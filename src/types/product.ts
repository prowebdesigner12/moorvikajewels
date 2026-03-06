export interface ProductVariant {
  id: string;
  size: string;
  color: string;
  stock: number;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  original_price?: number; // DB Match
  images: string[];
  category: string;
  variants: ProductVariant[];
  rating: number;
  reviews: number;
  tags: string[];
  slug?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  // Shopify-like fields
  status?: 'active' | 'draft' | 'archived';
  vendor?: string;
  type?: string;
  weight?: number;
  track_quantity?: boolean; // 1 = true, 0 = false in DB
  continue_selling_oos?: boolean;
  wholesale_tiers?: WholesaleTier[];
  subscription_plans?: SubscriptionPlan[];
  flash_sale_end?: string;
}

export interface SubscriptionPlan {
  id: string;
  frequency: 'weekly' | 'monthly' | 'quarterly';
  discount_percent: number;
}

export interface WholesaleTier {
  id?: number;
  product_id: string;
  min_quantity: number;
  price: number;
}

export interface CartItem {
  product?: Product;
  variant?: ProductVariant;
  bundle?: Bundle;
  quantity: number;
  subscriptionPlanId?: string;
  isSubscription?: boolean;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  shippingAddress: ShippingAddress;
  createdAt: Date;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Bundle {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price: number;
  discount_label: string;
  image: string;
  type: 'fixed_combo' | 'buy_x_get_y';
  items: BundleMapping[];
}

export interface BundleMapping {
  product_id: string;
  quantity: number;
  product?: Product; // Populated for UI display
}
