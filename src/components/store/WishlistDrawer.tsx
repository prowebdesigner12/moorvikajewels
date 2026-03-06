import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, ShoppingCart, Share2 } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

interface WishlistDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

const WishlistDrawer = ({ isOpen, onClose }: WishlistDrawerProps) => {
    const { items, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();

    const handleMoveToCart = (item: any) => {
        if (item.variants && item.variants.length > 0) {
            addToCart(item, item.variants[0], 1);
            removeFromWishlist(item.id);
        }
    };

    const handleShareWishlist = (method: 'whatsapp' | 'email') => {
        if (items.length === 0) {
            toast.error("Your wishlist is empty!");
            return;
        }

        const wishlistText = items.map((item, idx) =>
            `${idx + 1}. ${item.name} - ₹${item.price.toLocaleString()}\n   https://prasantbagriya.online/product/${item.id}`
        ).join('\n\n');

        const message = `Check out my wishlist from TopStore! 🛍️\n\n${wishlistText}\n\nShop now at: https://prasantbagriya.online`;

        if (method === 'whatsapp') {
            window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
        } else {
            window.location.href = `mailto:?subject=My TopStore Wishlist&body=${encodeURIComponent(message)}`;
        }
        toast.success("Opening share dialog...");
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="w-full sm:max-w-lg">
                <SheetHeader>
                    <div className="flex items-center justify-between">
                        <SheetTitle>My Wishlist ({items.length})</SheetTitle>
                        {items.length > 0 && (
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleShareWishlist('whatsapp')}
                                    className="gap-2"
                                >
                                    <Share2 className="h-4 w-4" />
                                    WhatsApp
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleShareWishlist('email')}
                                >
                                    Email
                                </Button>
                            </div>
                        )}
                    </div>
                </SheetHeader>

                <div className="flex flex-col h-full pb-10">
                    <ScrollArea className="flex-1 -mx-6 px-6 my-4">
                        {items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
                                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center">
                                    <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-semibold text-lg">Your wishlist is empty</h3>
                                    <p className="text-muted-foreground">
                                        Save items you love to buy later
                                    </p>
                                </div>
                                <Button onClick={onClose}>
                                    Continue Shopping
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-4 p-4 border rounded-lg bg-card">
                                        <div className="h-24 w-24 rounded-md overflow-hidden bg-muted shrink-0">
                                            <img
                                                src={item.images[0]}
                                                alt={item.name}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <h4 className="font-medium line-clamp-1">{item.name}</h4>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    ₹{item.price.toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 mt-2">
                                                <Button
                                                    size="sm"
                                                    className="flex-1"
                                                    onClick={() => handleMoveToCart(item)}
                                                >
                                                    Move to Cart
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => removeFromWishlist(item.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default WishlistDrawer;
