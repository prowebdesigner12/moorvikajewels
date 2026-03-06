import { useState, useEffect } from 'react';
import SEO from '@/components/store/SEO';
import { useParams, Link } from 'react-router-dom';
import { Product } from '@/types/product';
import { Button } from "@/components/ui/button";
import { Loader2 } from 'lucide-react';

interface Collection {
    id: string;
    title: string;
    description: string;
    image?: string;
    products: string[]; // List of product IDs
}

const CollectionDetails = () => {
    const { id } = useParams();
    const [collection, setCollection] = useState<Collection | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Collections to find the current one
                const collRes = await fetch('/api/collections');
                if (collRes.ok) {
                    const collections: Collection[] = await collRes.json();
                    const current = collections.find(c => c.id === id); // Matching by ID for simplicity, could be slug
                    setCollection(current || null);

                    if (current && current.products && current.products.length > 0) {
                        // 2. Fetch All Products (In a real app, filtering should happen on backend)
                        // MVP: Fetch all and filter client side
                        const prodRes = await fetch('/api/products');
                        if (prodRes.ok) {
                            const allProducts: Product[] = await prodRes.json();
                            // Filter active products that belong to this collection
                            const variants = allProducts.filter(p =>
                                current.products.includes(p.id) &&
                                (p.status === 'active' || !p.status) // Backward compatibility
                            );
                            setProducts(variants);
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to load collection data");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchData();
    }, [id]);

    if (isLoading) {
        return <div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!collection) {
        return <div className="container py-16 text-center"><h1 className="text-2xl font-bold">Collection not found</h1><Link to="/collections"><Button variant="link">Back to Collections</Button></Link></div>;
    }

    return (
        <div className="min-h-screen">
            <SEO
                title={collection.title}
                description={collection.description}
                url={`https://prasantbagriya.online/collections/${collection.id}`}
                schema={{
                    "@context": "https://schema.org",
                    "@type": "ItemList",
                    "name": collection.title,
                    "description": collection.description,
                    "itemListElement": products.map((p, i) => ({
                        "@type": "ListItem",
                        "position": i + 1,
                        "url": `https://prasantbagriya.online/product/${p.id}`
                    }))
                }}
            />
            {/* Hero Section */}
            <div className="bg-gray-50 dark:bg-white/5 py-16 mb-12">
                <div className="container text-center max-w-2xl">
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl mb-4">{collection.title}</h1>
                    {collection.description && <p className="text-lg text-gray-500 dark:text-gray-400">{collection.description}</p>}
                </div>
            </div>

            {/* Product Grid */}
            <div className="container pb-20">
                {products.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 dark:bg-white/5 rounded-lg">
                        <p className="text-gray-500 dark:text-gray-400">No products found in this collection.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {products.map((product) => (
                            <Link key={product.id} to={`/product/${product.id}`} className="group relative">
                                <div className="aspect-[3/4] w-full overflow-hidden rounded-lg bg-gray-200 dark:bg-card group-hover:opacity-75 relative">
                                    {product.images?.[0] ? (
                                        <img
                                            src={product.images[0]}
                                            alt={product.name}
                                            className="h-full w-full object-cover object-center"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-gray-400">No Image</div>
                                    )}
                                    {product.track_quantity && (product.variants?.reduce((sum, v) => sum + v.stock, 0) || 0) <= 0 && !product.continue_selling_oos && (
                                        <span className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                            Out of Stock
                                        </span>
                                    )}
                                </div>
                                <div className="mt-4 flex justify-between">
                                    <div>
                                        <h3 className="text-sm text-gray-700 dark:text-gray-200">
                                            <span aria-hidden="true" className="absolute inset-0" />
                                            {product.name}
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{product.category}</p>
                                    </div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">${product.price}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CollectionDetails;
