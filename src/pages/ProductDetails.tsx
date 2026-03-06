import { useNavigate, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useState, useEffect, useMemo } from 'react';
import SEO from '@/components/store/SEO';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import CartDrawer from '@/components/store/CartDrawer';
import ProductGrid from '@/components/store/ProductGrid';
import ProductModal from '@/components/store/ProductModal';
import ProductCarousel from '@/components/store/ProductCarousel';
import { Star, Truck, Shield, ArrowRight, Minus, Plus, X, CheckCircle2, ShoppingBag, RefreshCw, Package, Heart, Timer, Zap } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { toast } from 'sonner';
// import { productService } from '@/services/productService';
import { Product } from '@/types/product';
import { trackViewContent, trackAddToCart } from '@/utils/meta-pixel';

const ProductDetails = () => {
    const { id, slug } = useParams();
    const [product, setProduct] = useState<Product | undefined>(undefined);
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [selectedColor, setSelectedColor] = useState<string>('');
    const [quantity, setQuantity] = useState(1);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isSubscription, setIsSubscription] = useState(false);

    const { addToCart } = useCart();
    const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
    const navigate = useNavigate();

    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
    const [selectedProductModal, setSelectedProductModal] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Save to recently viewed
    useEffect(() => {
        if (product) {
            let viewed = [];
            try {
                viewed = JSON.parse(localStorage.getItem('topstore_viewed') || '[]');
            } catch (e) {
                console.warn("Failed to parse viewed items on details page", e);
                localStorage.setItem('topstore_viewed', '[]');
            }
            const updated = [product.id, ...viewed.filter((id: string) => id !== product.id)].slice(0, 10);
            localStorage.setItem('topstore_viewed', JSON.stringify(updated));

            // Track Meta Pixel ViewContent
            trackViewContent({
                content_ids: [product.id.toString()],
                content_name: product.name,
                content_type: 'product',
                value: product.price,
                currency: 'INR'
            });
        }
    }, [product]);

    // Load recently viewed from allProducts
    useEffect(() => {
        if (allProducts.length > 0) {
            const viewedIds = JSON.parse(localStorage.getItem('topstore_viewed') || '[]');
            const viewed = viewedIds
                .map((id: string) => allProducts.find(p => p.id === id))
                .filter(Boolean) as Product[];
            setRecentlyViewed(viewed.slice(0, 10));
        }
    }, [allProducts]);

    const relatedProducts = useMemo(() => {
        if (!product || allProducts.length === 0) return [];
        return allProducts
            .filter(p => p.category === product.category && p.id !== product.id)
            .slice(0, 8);
    }, [product, allProducts]);

    const [reviews, setReviews] = useState<any[]>([]);
    const [reviewSort, setReviewSort] = useState<'newest' | 'highest' | 'lowest'>('newest');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '', email: '' });
    // Social Proof Randomizers
    // Social Proof Randomizers
    const [viewCount, setViewCount] = useState(() => Math.floor(Math.random() * (45 - 12 + 1)) + 12);
    // Stock starts between 5 and 8
    const [stockLeft, setStockLeft] = useState(() => Math.floor(Math.random() * (8 - 5 + 1)) + 5);

    useEffect(() => {
        // View Count Randomizer (Every 2s)
        const viewInterval = setInterval(() => {
            setViewCount(prev => {
                const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
                return Math.max(8, prev + change);
            });
        }, 2000);

        // Stock Decay (Every 5s, decrease by 1)
        const stockInterval = setInterval(() => {
            setStockLeft(prev => Math.max(0, prev - 1)); // Decrease until 0
        }, 5000);

        return () => {
            clearInterval(viewInterval);
            clearInterval(stockInterval);
        };
    }, []);

    // ... (existing code)

    // In render:
    // ...
    <div className="flex items-center gap-2 text-orange-600 text-sm font-medium animate-pulse">
        <span className="w-2 h-2 rounded-full bg-orange-600"></span>
        {viewCount} people are viewing this right now
    </div>
    // ...
    {/* Stock Warning */ }
    <p className="text-red-500 text-sm font-medium mb-8 flex items-center gap-2 animate-pulse">
        Hurry! Only {stockLeft} left in stock.
    </p>

    const colorMap: { [key: string]: string } = {
        'White': '#FFFFFF',
        'Black': '#000000',
        'Blue': '#3B82F6',
        'Red': '#EF4444',
        'Brown': '#78350F',
        'Tan': '#D2B48C',
        'Silver': '#C0C0C0',
        'Gold': '#FFD700',
        'Rose Gold': '#B76E79',
        'Green': '#22C55E',
        'Navy': '#1E3A8A',
        'Gray': '#6B7280',
    };


    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!product) return;

        setIsSubmittingReview(true);
        try {
            const savedUser = localStorage.getItem('topstore_user');
            let userName = 'Guest';
            if (savedUser) {
                try {
                    const parsedUser = JSON.parse(savedUser);
                    if (parsedUser && parsedUser.name) userName = parsedUser.name;
                } catch (e) {
                    console.warn("Failed to parse user for review", e);
                }
            }

            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: product.id,
                    customerName: userName,
                    customerEmail: newReview.email,
                    rating: newReview.rating,
                    comment: newReview.comment
                })
            });

            if (res.ok) {
                toast.success("Review submitted!");
                setNewReview({ rating: 5, comment: '', email: '' });
                loadProduct();
            } else {
                const err = await res.json();
                toast.error(err.error || "Failed to submit");
            }
        } catch (error) {
            toast.error("Failed to submit review");
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const getReviewStats = () => {
        const stats = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0, total: reviews.length };
        reviews.forEach(r => {
            if (stats[r.rating as keyof typeof stats] !== undefined) {
                (stats[r.rating as keyof typeof stats] as number)++;
            }
        });
        return stats;
    };

    const sortedReviews = [...reviews].sort((a, b) => {
        if (reviewSort === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        if (reviewSort === 'highest') return b.rating - a.rating;
        if (reviewSort === 'lowest') return a.rating - b.rating;
        return 0;
    });

    const [timeLeft, setTimeLeft] = useState<{ h: number, m: number, s: number } | null>(null);

    // Flash Sale Timer
    useEffect(() => {
        if (!product?.flash_sale_end) return;

        const timer = setInterval(() => {
            const end = new Date(product.flash_sale_end!).getTime();
            const now = new Date().getTime();
            const distance = end - now;

            if (distance < 0) {
                setTimeLeft(null);
                clearInterval(timer);
                return;
            }

            setTimeLeft({
                h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                s: Math.floor((distance % (1000 * 60)) / 1000)
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [product]);

    const formatTime = (time: number) => time.toString().padStart(2, '0');

    const loadProduct = async () => {
        try {
            setIsLoading(true);
            // Fetch all products to populate recommendations and helper lists
            const res = await fetch('/api/products');
            if (res.ok) {
                const data: Product[] = await res.json();
                setAllProducts(data);

                const found = data.find((p: Product) => p.id == id || (slug && p.slug == slug));
                setProduct(found);

                if (found) {
                    // Check for variants and set default
                    if (found.variants && Array.isArray(found.variants) && found.variants.length > 0 && found.variants[0]) {
                        setSelectedSize(found.variants[0].size || '');
                        setSelectedColor(found.variants[0].color || '');
                    }

                    // Load bundles to check if this product is part of any
                    const bundleRes = await fetch('/api/bundles');
                    if (bundleRes.ok) {
                        const bundleData: any[] = await bundleRes.json();
                        const partOf = bundleData.find(b =>
                            b.items.some((item: any) => item.product_id === found.id)
                        );
                        if (partOf) (found as any).bundle = partOf;
                    }

                    // Load reviews
                    const revRes = await fetch(`/api/reviews?productId=${found.id}`);
                    if (revRes.ok) {
                        try {
                            const revData = await revRes.json();
                            if (Array.isArray(revData)) {
                                setReviews(revData);
                            } else {
                                console.warn("Reviews data is not an array:", revData);
                                setReviews([]);
                            }
                        } catch (e) {
                            console.error("Failed to parse reviews", e);
                            setReviews([]);
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error loading product", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadProduct();
    }, [id, slug]);

    // Safe Access Helpers
    const currentPrice = product?.price || 0;
    const originalPrice = product?.original_price || 0;
    const hasDiscount = originalPrice > currentPrice;

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header onCartClick={() => setIsCartOpen(true)} onSearch={() => { }} />
                <main className="flex-1 flex flex-col items-center justify-center p-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-muted-foreground font-medium animate-pulse">Loading product details...</p>
                </main>
                <Footer />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header onCartClick={() => setIsCartOpen(true)} onSearch={() => { }} />
                <main className="flex-1 flex items-center justify-center p-4">
                    <div className="text-center">
                        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <X className="h-10 w-10" />
                        </div>
                        <h2 className="text-3xl font-bold mb-2">Product Not Found</h2>
                        <p className="text-muted-foreground mb-8">The product you are looking for does not exist or has been removed.</p>
                        <Button onClick={() => navigate('/shop')}>Back to Shop</Button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header onCartClick={() => setIsCartOpen(true)} onSearch={() => { }} />
            <SEO
                title={product.name}
                description={product.description}
                image={product.images?.[0]}
                type="product"
                url={`https://prasantbagriya.online/product/${product.id}`}
                schema={{
                    "@context": "https://schema.org",
                    "@type": "Product",
                    "name": product.name,
                    "description": product.description,
                    "image": product.images,
                    "sku": product.id,
                    "brand": {
                        "@type": "Brand",
                        "name": "TopStore"
                    },
                    "offers": {
                        "@type": "Offer",
                        "url": `https://prasantbagriya.online/product/${product.id}`,
                        "priceCurrency": "INR",
                        "price": product.price,
                        "availability": (product.variants?.some((v: any) => v.stock > 0))
                            ? "https://schema.org/InStock"
                            : "https://schema.org/OutOfStock"
                    },
                    ...(reviews.length > 0 ? {
                        "aggregateRating": {
                            "@type": "AggregateRating",
                            "ratingValue": product.rating || 4.5,
                            "reviewCount": reviews.length
                        },
                        "review": reviews.slice(0, 5).map(r => ({
                            "@type": "Review",
                            "author": { "@type": "Person", "name": r.customer_name },
                            "datePublished": r.created_at,
                            "reviewBody": r.comment,
                            "reviewRating": {
                                "@type": "Rating",
                                "ratingValue": r.rating
                            }
                        }))
                    } : {})
                }}
            />

            <main className="container px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Left: Images */}
                    <div className="w-full lg:w-1/2 space-y-4">
                        <div className="aspect-square bg-gray-50 dark:bg-white/5 rounded-2xl overflow-hidden relative shadow-sm">
                            {product.images && product.images.length > 0 ? (
                                <img
                                    src={product.images[selectedImage] || product.images[0]}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                                    No Image
                                </div>
                            )}
                            {/* Tags badges */}
                            <div className="absolute top-4 left-4 flex flex-col gap-2">
                                {product.tags && Array.isArray(product.tags) && product.tags.map((tag: string) => (
                                    <span key={tag} className="px-3 py-1 bg-white/90 text-black backdrop-blur-sm text-xs font-bold rounded-full shadow-sm uppercase tracking-wider">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                        {/* Thumbnails */}
                        {product.images && product.images.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide py-2">
                                {product.images.map((img: string, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 transition-all ${selectedImage === idx
                                            ? 'ring-2 ring-black ring-offset-2 opacity-100'
                                            : 'opacity-60 hover:opacity-100'
                                            }`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Details */}
                    <div className="w-full lg:w-1/2">
                        <div className="mb-6 space-y-4">
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 leading-tight">{product.name}</h1>

                            <div className="flex items-center gap-4">
                                <span className="text-3xl font-bold text-primary">₹{currentPrice.toLocaleString()}</span>
                                {hasDiscount && (
                                    <>
                                        <span className="text-xl text-muted-foreground line-through">
                                            ₹{originalPrice.toLocaleString()}
                                        </span>
                                        <span className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded">
                                            {originalPrice > 0 ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0}% OFF
                                        </span>
                                    </>
                                )}
                            </div>

                            {/* Rating */}
                            <div className="flex items-center gap-2">
                                <div className="flex text-rose-400">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star key={s} className={`h-4 w-4 ${s <= (product.rating || 0) ? 'fill-current' : 'text-gray-300'}`} />
                                    ))}
                                </div>
                                <span className="text-sm text-muted-foreground">({product.reviews || 0} reviews)</span>
                            </div>

                            {/* Live View with Avatars */}
                            <div className="flex items-center gap-3 pt-2">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="h-7 w-7 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                                            <img src={`https://i.pravatar.cc/100?img=${i + 15}`} alt="" className="h-full w-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-center gap-2 text-orange-600 text-sm font-medium animate-pulse">
                                    <span className="w-2 h-2 rounded-full bg-orange-600"></span>
                                    {viewCount} people are viewing this right now
                                </div>
                            </div>

                            {/* Limited Time Badge */}
                            <div className="pt-2">
                                <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider border border-red-100">
                                    <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                                    Limited Time Offer
                                </div>
                            </div>
                        </div>

                        <div className="w-full h-px bg-border my-6" />

                        <p className="text-muted-foreground mb-8 leading-relaxed whitespace-pre-line">
                            {product.description}
                        </p>

                        {/* Variants Selection */}
                        {product.variants && Array.isArray(product.variants) && product.variants.length > 0 && (
                            <div className="space-y-6 mb-8">
                                {/* Sizes */}
                                <div>
                                    <label className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-2 block">Size</label>
                                    <div className="flex flex-wrap gap-2">
                                        {(Array.from(new Set(product.variants.filter((v: any) => v && v.size).map((v: any) => v.size))) as any[]).map((size: any) => (
                                            <button
                                                key={size}
                                                onClick={() => setSelectedSize(size)}
                                                className={`min-w-[40px] h-10 px-3 flex items-center justify-center border rounded-md text-sm font-medium transition-all ${selectedSize === size
                                                    ? 'bg-black text-white border-black'
                                                    : 'bg-white dark:bg-card text-gray-900 dark:text-gray-100 border-gray-200 hover:border-black'
                                                    }`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Colors */}
                                <div>
                                    <label className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 block">Color: <span className="font-normal text-muted-foreground">{selectedColor}</span></label>
                                    <div className="flex flex-wrap gap-3">
                                        {(Array.from(new Set(product.variants.filter((v: any) => v && v.color).map((v: any) => v.color))) as any[]).map((color: any) => (
                                            <button
                                                key={color}
                                                onClick={() => setSelectedColor(color)}
                                                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${selectedColor === color
                                                    ? 'ring-2 ring-offset-2 ring-black scale-110'
                                                    : 'hover:scale-105'
                                                    }`}
                                                title={color}
                                            >
                                                <div
                                                    className="w-full h-full rounded-full border shadow-sm"
                                                    style={{ backgroundColor: colorMap[color] || '#ccc' }}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Wholesale / Bulk Pricing */}
                        {product.wholesale_tiers && product.wholesale_tiers.length > 0 && (
                            <div className="mb-8 p-4 bg-primary/5 border border-primary/10 rounded-xl">
                                <h3 className="text-sm font-bold flex items-center gap-2 mb-3">
                                    <Package className="h-4 w-4 text-primary" />
                                    Wholesale Bulk Pricing
                                </h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {product.wholesale_tiers.map((tier: any) => (
                                        <div key={tier.id} className="bg-white dark:bg-card p-2 rounded border flex flex-col items-center justify-center">
                                            <span className="text-xs text-muted-foreground">{tier.min_quantity}+ Units</span>
                                            <span className="text-sm font-bold">₹{tier.price.toLocaleString()}/unit</span>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-2 italic">* Pricing will be automatically applied in cart</p>
                            </div>
                        )}

                        {/* Add to Cart Actions */}
                        <div className="flex items-center gap-4 mb-3">
                            <div className="flex items-center border rounded-md h-12 border-gray-300">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="px-4 hover:bg-gray-50 dark:bg-white/5 h-full transition-colors text-gray-600 dark:text-gray-400 rounded-l-md"
                                >
                                    <Minus className="h-4 w-4" />
                                </button>
                                <span className="w-8 text-center font-medium text-lg">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="px-4 hover:bg-gray-50 dark:bg-white/5 h-full transition-colors text-gray-600 dark:text-gray-400 rounded-r-md"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>

                            <Button
                                size="lg"
                                className="flex-1 h-12 text-base font-bold bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-md shadow-md"
                                onClick={() => {
                                    const variant = product.variants?.find((v: any) => v.size === selectedSize && v.color === selectedColor)
                                        || product.variants?.[0]
                                        || { id: 'default', size: 'One Size', color: 'Default', stock: 10, price: product.price };

                                    addToCart(product, variant, quantity);

                                    // Track Meta Pixel AddToCart
                                    trackAddToCart({
                                        content_ids: [product.id.toString()],
                                        content_name: product.name,
                                        content_type: 'product',
                                        value: (variant.price || product.price) * quantity,
                                        currency: 'INR'
                                    });

                                    setIsCartOpen(true);
                                    toast.success("Added to cart");
                                }}
                            >
                                <ShoppingBag className="mr-2 h-5 w-5" />
                                Add to Cart
                            </Button>

                            <Button
                                variant="outline"
                                size="icon"
                                className={`h-12 w-12 rounded-md ${isInWishlist(product.id) ? 'text-red-500 bg-red-50 border-red-100 hover:bg-red-100' : 'text-gray-400'}`}
                                onClick={() => {
                                    if (isInWishlist(product.id)) {
                                        removeFromWishlist(product.id);
                                    } else {
                                        addToWishlist(product);
                                    }
                                }}
                            >
                                <Heart className={`h-6 w-6 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                            </Button>
                        </div>



                        {/* Stock Warning */}
                        <p className="text-red-500 text-sm font-medium mb-8 flex items-center gap-2 animate-pulse">
                            Hurry! Only {stockLeft} left in stock.
                        </p>

                        <div className="grid grid-cols-2 gap-8 py-8 border-y mt-8">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center border">
                                    <Truck className="h-5 w-5 text-gray-900 dark:text-gray-100" />
                                </div>
                                <div className="text-sm">
                                    <p className="font-bold text-gray-900 dark:text-gray-100">Free Shipping</p>
                                    <p className="text-muted-foreground text-xs">On orders over ₹999</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center border">
                                    <Shield className="h-5 w-5 text-gray-900 dark:text-gray-100" />
                                </div>
                                <div className="text-sm">
                                    <p className="font-bold text-gray-900 dark:text-gray-100">Secure Payment</p>
                                    <p className="text-muted-foreground text-xs">100% protected checkout</p>
                                </div>
                            </div>
                        </div>
                        {/* Flash Sale Banner */}
                        {product.flash_sale_end && timeLeft && (
                            <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white p-3 rounded-xl flex items-center justify-between shadow-lg animate-pulse">
                                <div className="flex items-center gap-2">
                                    <Zap className="h-5 w-5 fill-current" />
                                    <span className="font-bold text-sm">Flash Sale</span>
                                </div>
                                <div className="flex items-center gap-2 font-mono text-lg font-bold">
                                    <Timer className="h-5 w-5" />
                                    <span>{formatTime(timeLeft.h)}:{formatTime(timeLeft.m)}:{formatTime(timeLeft.s)}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="border-t pt-16">
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Left Column: Stats & Review Form */}
                        <div className="space-y-6">
                            {/* Rating Stats */}
                            <div className="bg-white dark:bg-card p-6 rounded-2xl border shadow-sm">
                                <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-gray-100">Top Reviews</h3>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="text-5xl font-bold text-gray-900 dark:text-gray-100">{product.rating ? Number(product.rating).toFixed(1) : '4.5'}</div>
                                    <div className="space-y-1">
                                        <div className="flex text-rose-400">
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <Star key={s} className={`h-4 w-4 ${s <= Math.round(product.rating || 4.5) ? 'fill-current' : 'text-gray-300'}`} />
                                            ))}
                                        </div>
                                        <p className="text-sm text-muted-foreground font-medium">{reviews.length} reviews</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {[5, 4, 3, 2, 1].map(star => (
                                        <div key={star} className="flex items-center gap-2 text-sm">
                                            <span className="w-3 font-medium text-gray-700 dark:text-gray-300">{star}</span>
                                            <Star className="h-3 w-3 text-gray-400" />
                                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-slate-200"
                                                    style={{ width: reviews.length > 0 && getReviewStats()[star as keyof ReturnType<typeof getReviewStats>] ? `${(getReviewStats()[star as keyof ReturnType<typeof getReviewStats>] / reviews.length) * 100}%` : '0%' }}
                                                />
                                            </div>
                                            <span className="w-8 text-right text-xs text-muted-foreground">{reviews.length > 0 ? Math.round((getReviewStats()[star as keyof ReturnType<typeof getReviewStats>] / reviews.length) * 100) : 0}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Share Your Experience (Form) */}
                            <div className="bg-white dark:bg-card p-6 rounded-2xl border shadow-sm">
                                <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-gray-100">Share Your Experience</h3>
                                <div className="flex gap-2 mb-6">
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setNewReview({ ...newReview, rating: s })}
                                            className={`transition-transform hover:scale-110 ${newReview.rating >= s ? 'text-rose-400' : 'text-gray-300'}`}
                                        >
                                            <Star className="h-8 w-8 fill-current" />
                                        </button>
                                    ))}
                                </div>
                                <form onSubmit={handleReviewSubmit} className="space-y-4">
                                    <textarea
                                        className="w-full p-3 rounded-xl border bg-gray-50 dark:bg-white/5 text-sm min-h-[120px] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground"
                                        placeholder="What did you like or dislike? Your feedback helps others!"
                                        value={newReview.comment}
                                        onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
                                        required
                                    />
                                    <input
                                        type="email"
                                        className="w-full p-3 rounded-xl border bg-gray-50 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                        placeholder="Email (required for verification)"
                                        value={newReview.email}
                                        onChange={e => setNewReview({ ...newReview, email: e.target.value })}
                                        required
                                    />
                                    <Button type="submit" className="w-full rounded-xl h-11 font-semibold" disabled={isSubmittingReview}>
                                        {isSubmittingReview ? 'Posting...' : 'Post Review'}
                                    </Button>
                                </form>
                            </div>
                        </div>

                        {/* Right Column: Reviews List */}
                        <div className="md:col-span-2">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">What Customer Are Saying</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">Sort by:</span>
                                    <select
                                        className="p-2 pr-8 border rounded-md text-sm bg-transparent cursor-pointer focus:outline-none focus:border-primary"
                                        value={reviewSort}
                                        onChange={(e) => setReviewSort(e.target.value as any)}
                                    >
                                        <option value="newest">Newest First</option>
                                        <option value="highest">Highest Rated</option>
                                        <option value="lowest">Lowest Rated</option>
                                    </select>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-card rounded-2xl border p-8 min-h-[400px]">
                                {sortedReviews.length > 0 ? (
                                    <div className="space-y-10">
                                        {sortedReviews.map((review: any) => (
                                            <div key={review.id} className="border-b last:border-0 pb-10">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">
                                                            {review.customer_name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <div className="font-semibold text-gray-900 dark:text-gray-100">{review.customer_name}</div>
                                                                {review.is_verified === 1 && (
                                                                    <div className="flex items-center text-emerald-600 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                                                        <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex text-rose-400 text-sm mt-1">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs font-medium text-muted-foreground bg-gray-50 dark:bg-white/5 px-2 py-1 rounded">
                                                        {new Date(review.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed pl-[64px]">{review.comment}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-[300px] text-center border-2 border-dashed rounded-xl border-gray-100">
                                        <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4 text-gray-400">
                                            <Star className="h-8 w-8" />
                                        </div>
                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">No reviews yet</h4>
                                        <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                                            Be the first to share your thoughts about this product!
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {
                    relatedProducts.length > 0 && (
                        <ProductCarousel
                            title="You Might Also Like"
                            products={relatedProducts}
                            onQuickView={setSelectedProductModal}
                        />
                    )
                }

                {/* Recently Viewed */}
                {
                    recentlyViewed.length > 0 && (
                        <div className="mt-20 mb-20">
                            <ProductCarousel
                                title="Recently Viewed"
                                products={recentlyViewed}
                                onQuickView={setSelectedProductModal}
                            />
                        </div>
                    )
                }
            </main >

            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
            <ProductModal
                product={selectedProductModal}
                isOpen={!!selectedProductModal}
                onClose={() => setSelectedProductModal(null)}
            />
            <Footer />
        </div >
    );
};

export default ProductDetails;
