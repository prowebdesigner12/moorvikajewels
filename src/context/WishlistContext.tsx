import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/types/product';
import { toast } from 'sonner';

interface WishlistContextType {
    items: Product[];
    addToWishlist: (product: Product) => void;
    removeFromWishlist: (productId: string) => void;
    isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {
    const [items, setItems] = useState<Product[]>([]);

    useEffect(() => {
        const savedWishlist = localStorage.getItem('wishlist');
        if (savedWishlist) {
            setItems(JSON.parse(savedWishlist));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('wishlist', JSON.stringify(items));
    }, [items]);

    const addToWishlist = (product: Product) => {
        if (!isInWishlist(product.id)) {
            setItems([...items, product]);
            toast.success('Added to wishlist');
        }
    };

    const removeFromWishlist = (productId: string) => {
        setItems(items.filter(item => item.id !== productId));
        toast.info('Removed from wishlist');
    };

    const isInWishlist = (productId: string) => {
        return items.some(item => item.id === productId);
    };

    return (
        <WishlistContext.Provider value={{ items, addToWishlist, removeFromWishlist, isInWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};
