import { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from '@/types/product';
import { toast } from 'sonner';

interface ComparisonContextType {
    items: Product[];
    addToComparison: (product: Product) => void;
    removeFromComparison: (productId: string) => void;
    clearComparison: () => void;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export const ComparisonProvider = ({ children }: { children: ReactNode }) => {
    const [items, setItems] = useState<Product[]>([]);

    const addToComparison = (product: Product) => {
        if (items.length >= 3) {
            toast.error("You can compare up to 3 products only");
            return;
        }
        if (items.find(item => item.id === product.id)) {
            toast.info("Product already in comparison");
            return;
        }
        setItems([...items, product]);
        toast.success(`${product.name} added to comparison`);
    };

    const removeFromComparison = (productId: string) => {
        setItems(items.filter(item => item.id !== productId));
    };

    const clearComparison = () => {
        setItems([]);
    };

    return (
        <ComparisonContext.Provider value={{ items, addToComparison, removeFromComparison, clearComparison }}>
            {children}
        </ComparisonContext.Provider>
    );
};

export const useComparison = () => {
    const context = useContext(ComparisonContext);
    if (!context) {
        throw new Error('useComparison must be used within ComparisonProvider');
    }
    return context;
};
