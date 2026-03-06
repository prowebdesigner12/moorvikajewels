import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Eye, Star, X } from 'lucide-react';

const cities = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Jaipur", "Ahmedabad"];
const names = ["Rahul", "Priya", "Amit", "Sneha", "Vikram", "Anjali", "Rohan", "Kavita", "Arjun", "Deepa"];
const actions = [
    { type: 'purchase', text: 'purchased', icon: CheckCircle, color: 'text-green-500' },
    { type: 'view', text: 'is viewing', icon: Eye, color: 'text-blue-500' },
    { type: 'review', text: 'rated 5 stars', icon: Star, color: 'text-rose-500' }
];

// Fallback product list if data import is complex
const fallbackProducts = [
    "Premium Wireless Headphones", "Smart Fitness Watch", "Leather Weekend Bag", "Organic Cotton T-Shirt",
    "Minimalist Desk Lamp", "Noise Cancelling Earbuds", "Ergonomic Office Chair", "Stainless Steel Water Bottle"
];

const SalesPopup = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [notification, setNotification] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);

    useEffect(() => {
        // Fetch products to show real data
        fetch('/api/products')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setProducts(data);
                }
            })
            .catch(() => { });

        // Initial delay
        const initialTimeout = setTimeout(() => {
            triggerPopup();
        }, 5000);

        // Loop
        const interval = setInterval(() => {
            triggerPopup();
        }, 20000); // 20 seconds loop

        return () => {
            clearTimeout(initialTimeout);
            clearInterval(interval);
        };
    }, []);

    const triggerPopup = () => {
        setProducts(currentProducts => {
            if (!Array.isArray(currentProducts) || currentProducts.length === 0) return currentProducts;

            try {
                const randomName = names[Math.floor(Math.random() * names.length)];
                const randomCity = cities[Math.floor(Math.random() * cities.length)];
                const randomProduct = currentProducts[Math.floor(Math.random() * currentProducts.length)];

                if (!randomProduct || !randomProduct.name) return currentProducts;

                const randomAction = actions[Math.floor(Math.random() * actions.length)];

                let productImage = null;
                try {
                    const images = JSON.parse(randomProduct.images || '[]');
                    productImage = Array.isArray(images) ? images[0] : null;
                } catch (e) {
                    productImage = null;
                }

                setNotification({
                    name: randomName,
                    city: randomCity,
                    productName: randomProduct.name,
                    productImage: productImage,
                    action: randomAction
                });

                setIsVisible(true);
                setTimeout(() => setIsVisible(false), 5000);
            } catch (e) {
                console.warn("Error triggering sales popup", e);
            }
            return currentProducts;
        });
    };

    if (!notification) return null;

    const Icon = notification.action.icon;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, x: -20 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="fixed bottom-4 left-4 z-50 max-w-sm w-full md:w-auto"
                >
                    <div className="bg-background/80 backdrop-blur-md border shadow-2xl rounded-2xl p-3 flex items-center gap-3 pr-10 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                        <button
                            onClick={() => setIsVisible(false)}
                            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="h-3 w-3" />
                        </button>

                        <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden flex-shrink-0 border shadow-sm">
                            {notification.productImage ? (
                                <img src={notification.productImage} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className={`h-full w-full flex items-center justify-center ${notification.action.color} bg-secondary/50`}>
                                    <Icon className="h-5 w-5" />
                                </div>
                            )}
                        </div>

                        <div className="min-w-[140px]">
                            <p className="text-[13px] font-medium leading-tight">
                                <span className="font-bold text-primary">{notification.name}</span> <span className="text-muted-foreground">from</span> <span className="font-semibold">{notification.city}</span>
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis max-w-[180px]">
                                {notification.action.text} <span className="font-bold text-foreground">{notification.productName}</span>
                            </p>
                            <div className="flex items-center gap-1.5 mt-1">
                                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider">
                                    Verified • Just now
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SalesPopup;
