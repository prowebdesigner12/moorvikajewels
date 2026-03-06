import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { CartItem, Product, ProductVariant, Bundle } from '@/types/product';
import { toast } from 'sonner';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, variant: ProductVariant, quantity: number, subscriptionPlanId?: string, isSubscription?: boolean) => void;
  addBundleToCart: (bundle: Bundle) => void;
  removeFromCart: (productId?: string, variantId?: string, bundleId?: string) => void;
  updateQuantity: (quantity: number, productId?: string, variantId?: string, bundleId?: string) => void;
  clearCart: () => void;
  subtotal: number;
  applyDiscount: (code: string) => Promise<boolean>;
  removeDiscount: () => void;
  appliedDiscount: { code: string; type: string; value: number; is_referral?: boolean; referrer_id?: string } | null;
  totalItems: number;
  totalPrice: number;
  discountAmount: number;
  totalAfterDiscount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; type: string; value: number; is_referral?: boolean; referrer_id?: string } | null>(null);

  const addToCart = (product: Product, variant: ProductVariant, quantity: number, subscriptionPlanId?: string, isSubscription?: boolean) => {
    setItems(prev => {
      const existingIndex = prev.findIndex(
        item => item.product?.id === product.id &&
          item.variant?.id === variant.id &&
          item.isSubscription === isSubscription &&
          item.subscriptionPlanId === subscriptionPlanId
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        toast.success('Cart updated!');
        return updated;
      }

      toast.success('Added to cart!');
      return [...prev, { product, variant, quantity, subscriptionPlanId, isSubscription }];
    });
  };

  const addBundleToCart = (bundle: Bundle) => {
    setItems(prev => {
      const existingIndex = prev.findIndex(item => item.bundle?.id === bundle.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        toast.success('Bundle quantity updated!');
        return updated;
      }
      toast.success('Bundle added to cart!');
      return [...prev, { bundle, quantity: 1 }];
    });
  };

  const removeFromCart = (productId?: string, variantId?: string, bundleId?: string) => {
    setItems(prev => prev.filter(item => {
      if (bundleId) return item.bundle?.id !== bundleId;
      return !(item.product?.id === productId && item.variant?.id === variantId);
    }));
    toast.success('Removed from cart');
  };

  const updateQuantity = (quantity: number, productId?: string, variantId?: string, bundleId?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId, bundleId);
      return;
    }

    setItems(prev => prev.map(item => {
      if (bundleId && item.bundle?.id === bundleId) return { ...item, quantity };
      if (!bundleId && item.product?.id === productId && item.variant?.id === variantId) return { ...item, quantity };
      return item;
    }));
  };

  const clearCart = () => {
    setItems([]);
    setAppliedDiscount(null);
  };

  const applyDiscount = async (code: string) => {
    try {
      // Server-side validation
      const res = await fetch(`/api/discounts?code=${code}`);

      if (res.ok) {
        const discount = await res.json();

        // Check min amount
        const subtotal = items.reduce((sum, item) => sum + (item.variant?.price || item.product?.price || 0) * item.quantity, 0);
        if (discount.min_amount && subtotal < discount.min_amount) {
          toast.error(`Minimum ₹${discount.min_amount} required`);
          return false;
        }

        setAppliedDiscount({
          code: discount.code,
          type: discount.type,
          value: discount.value,
          is_referral: discount.is_referral,
          referrer_id: discount.referrer_id
        });
        toast.success('Discount applied!');
        return true;
      }

      const err = await res.json();
      toast.error(err.error || 'Invalid or expired discount code');
      return false;
    } catch (error) {
      console.error(error);
      toast.error('Failed to verify discount');
      return false;
    }
  };

  const removeDiscount = () => {
    setAppliedDiscount(null);
    toast.success('Discount removed');
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => {
    if (item.bundle) return sum + (item.bundle.price * item.quantity);

    // Check for wholesale pricing (Retail path)
    let unitPrice = item.variant?.price || item.product?.price || 0;

    if (item.isSubscription) {
      // Apply 10% fixed subscription discount for now
      unitPrice = unitPrice * 0.9;
    } else if (item.product?.wholesale_tiers && item.product.wholesale_tiers.length > 0) {
      const applicableTier = [...item.product.wholesale_tiers]
        .sort((a, b) => b.min_quantity - a.min_quantity)
        .find(tier => item.quantity >= tier.min_quantity);

      if (applicableTier) unitPrice = applicableTier.price;
    }

    return sum + (unitPrice * item.quantity);
  }, 0);

  const discountAmount = appliedDiscount
    ? appliedDiscount.type === 'percentage'
      ? (subtotal * appliedDiscount.value) / 100
      : appliedDiscount.value
    : 0;

  const totalAfterDiscount = Math.max(0, subtotal - discountAmount);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      addBundleToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      subtotal,
      applyDiscount,
      removeDiscount,
      appliedDiscount,
      totalItems,
      totalPrice: subtotal,
      discountAmount,
      totalAfterDiscount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
