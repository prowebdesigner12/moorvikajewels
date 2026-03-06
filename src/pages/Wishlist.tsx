import { useNavigate } from 'react-router-dom';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Heart, Trash2, ArrowRight } from 'lucide-react';

const Wishlist = () => {
    const { items: wishlist, removeFromWishlist } = useWishlist();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background">
            <Header onCartClick={() => { }} onSearch={() => { }} />

            <main className="container px-4 py-8">
                <div className="flex items-center gap-3 mb-8">
                    <div className="h-10 w-10 bg-red-50 rounded-full flex items-center justify-center text-red-500">
                        <Heart className="h-6 w-6 fill-current" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">My Wishlist</h1>
                        <p className="text-muted-foreground">{wishlist.length} items saved for later</p>
                    </div>
                </div>

                {wishlist.length === 0 ? (
                    <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed">
                        <Heart className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
                        <p className="text-muted-foreground mb-6 text-sm">Save items you like to track them and buy later.</p>
                        <Button onClick={() => navigate('/')}>Continue Shopping</Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {wishlist.map((product) => (
                            <div key={product.id} className="group relative bg-card border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300">
                                <div
                                    className="aspect-square relative overflow-hidden cursor-pointer"
                                    onClick={() => navigate(`/product/${product.id}`)}
                                >
                                    <img
                                        src={product.images[0]}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        className="absolute top-3 right-3 h-8 w-8 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeFromWishlist(product.id);
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>

                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">{product.category}</p>
                                            <h3 className="font-bold text-lg leading-tight">{product.name}</h3>
                                        </div>
                                        <p className="font-bold text-lg">₹{product.price.toLocaleString()}</p>
                                    </div>

                                    <div className="flex gap-2 mt-4">
                                        <Button
                                            className="flex-1 rounded-xl"
                                            onClick={() => navigate(`/product/${product.id}`)}
                                        >
                                            View Details
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default Wishlist;
