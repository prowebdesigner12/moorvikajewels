import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SEO from '@/components/store/SEO';
// import { productService } from '@/services/productService';
import { Product, Bundle } from '@/types/product';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import ProductGrid from '@/components/store/ProductGrid';
import ProductModal from '@/components/store/ProductModal';
import CartDrawer from '@/components/store/CartDrawer';
import { BundleCard } from '@/components/store/BundleCard';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Filter, X, ShoppingBag } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const Shop = () => {
    const [searchParams] = useSearchParams();
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        setSearchQuery(searchParams.get('search') || '');
    }, [searchParams]);

    const { addBundleToCart } = useCart();
    const { convertPrice } = useCurrency();
    const [bundles, setBundles] = useState<Bundle[]>([]);

    useEffect(() => {
        const fetchShopData = async () => {
            try {
                const [prodRes, bundleRes] = await Promise.all([
                    fetch('/api/products'),
                    fetch('/api/bundles')
                ]);

                if (prodRes.ok) {
                    const data: Product[] = await prodRes.json();
                    setProducts(data.filter(p => p.status === 'active' || !p.status));
                }

                if (bundleRes.ok) {
                    const data: Bundle[] = await bundleRes.json();
                    setBundles(data);
                }
            } catch (error) {
                console.error("Failed to fetch shop data", error);
            }
        };
        fetchShopData();
    }, []);

    // Filters
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [priceRange, setPriceRange] = useState([0, 5000]);
    const [sortBy, setSortBy] = useState('featured');

    // Derive unique categories and max price
    const allCategories = [...new Set(products.map(p => p.category))];
    const maxPrice = Math.max(...products.map(p => p.price), 5000);

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            // Search Filter
            const matchesSearch = (product.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                (product.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());

            // Category Filter
            const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);

            // Price Filter
            const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];

            return matchesSearch && matchesCategory && matchesPrice;
        }).sort((a, b) => {
            switch (sortBy) {
                case 'price-asc': return a.price - b.price;
                case 'price-desc': return b.price - a.price;
                case 'newest': return Number(b.id) - Number(a.id);
                default: return 0;
            }
        });
    }, [searchQuery, selectedCategories, priceRange, sortBy, products]);

    const FilterContent = () => (
        <div className="space-y-8">
            {/* Categories */}
            <div className="space-y-4">
                <h3 className="font-semibold mb-2">Categories</h3>
                <div className="space-y-2">
                    {allCategories.map(category => (
                        <div key={category} className="flex items-center space-x-2">
                            <Checkbox
                                id={category}
                                checked={selectedCategories.includes(category)}
                                onCheckedChange={(checked) => {
                                    if (checked) {
                                        setSelectedCategories([...selectedCategories, category]);
                                    } else {
                                        setSelectedCategories(selectedCategories.filter(c => c !== category));
                                    }
                                }}
                            />
                            <Label htmlFor={category} className="cursor-pointer">{category}</Label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div className="space-y-4">
                <h3 className="font-semibold mb-2">Price Range</h3>
                <Slider
                    defaultValue={[0, maxPrice]}
                    max={maxPrice}
                    step={100}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="py-4"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{convertPrice(priceRange[0])}</span>
                    <span>{convertPrice(priceRange[1])}</span>
                </div>
            </div>

            {/* Clear Filters */}
            <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                    setSelectedCategories([]);
                    setPriceRange([0, maxPrice]);
                }}
            >
                Clear Filters
            </Button>
        </div>
    );

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <SEO
                title={searchQuery ? `Search: ${searchQuery}` : 'Shop All Products'}
                description="Browse our extensive collection of high-quality electronics, accessories, and fashion essentials. Filter by price, category, and more."
                url="https://prasantbagriya.online/shop"
                schema={{
                    "@context": "https://schema.org",
                    "@type": "ItemList",
                    "name": searchQuery ? `Search Results for ${searchQuery}` : "Shop All Products",
                    "description": "Browse our range of products",
                    "itemListElement": products.slice(0, 10).map((p, i) => ({
                        "@type": "ListItem",
                        "position": i + 1,
                        "url": `https://prasantbagriya.online/product/${p.id}`
                    }))
                }}
            />

            <Header
                onCartClick={() => setIsCartOpen(true)}
                onSearch={setSearchQuery}
            />

            <main className="flex-1 container px-4 py-8">
                <div className="flex flex-col md:flex-row gap-8">

                    {/* Desktop Sidebar */}
                    <aside className="hidden md:block w-64 shrink-0 space-y-8 sticky top-24 self-start h-[calc(100vh-8rem)] overflow-y-auto pr-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold">Filters</h2>
                        </div>
                        <FilterContent />
                    </aside>

                    {/* Product Grid Area */}
                    <div className="flex-1">
                        {/* Bundles Section */}
                        {bundles.length > 0 && (
                            <div className="mb-12">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <ShoppingBag className="h-5 w-5 text-primary" />
                                    Bundles & Combos
                                </h2>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {bundles.map(bundle => (
                                        <BundleCard
                                            key={bundle.id}
                                            bundle={bundle}
                                            onAddToCart={addBundleToCart}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                            <h1 className="text-2xl font-bold">
                                {searchQuery ? `Search Results for "${searchQuery}"` : 'Shop'}
                                <span className="text-base font-normal text-muted-foreground ml-2">({filteredProducts.length} items)</span>
                            </h1>

                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                {/* Mobile Filter */}
                                <Sheet>
                                    <SheetTrigger asChild>
                                        <Button variant="outline" size="icon" className="md:hidden">
                                            <Filter className="h-4 w-4" />
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent side="left" className="w-[300px] sm:w-[540px]">
                                        <SheetHeader className="mb-6">
                                            <SheetTitle>Filters</SheetTitle>
                                        </SheetHeader>
                                        <FilterContent />
                                    </SheetContent>
                                </Sheet>

                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="w-full sm:w-[180px]">
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="featured">Featured</SelectItem>
                                        <SelectItem value="price-asc">Price: Low to High</SelectItem>
                                        <SelectItem value="price-desc">Price: High to Low</SelectItem>
                                        <SelectItem value="newest">Newest Arrivals</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {filteredProducts.length > 0 ? (
                            <ProductGrid
                                products={filteredProducts}
                                onQuickView={setSelectedProduct}
                            />
                        ) : (
                            <div className="text-center py-20">
                                <p className="text-lg text-muted-foreground">No products found matching your criteria.</p>
                                <Button
                                    variant="link"
                                    onClick={() => {
                                        setSelectedCategories([]);
                                        setPriceRange([0, maxPrice]);
                                        setSearchQuery('');
                                    }}
                                >
                                    Clear all filters
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />

            <ProductModal
                product={selectedProduct}
                isOpen={!!selectedProduct}
                onClose={() => setSelectedProduct(null)}
            />

            <CartDrawer
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
            />
        </div>
    );
};

export default Shop;
