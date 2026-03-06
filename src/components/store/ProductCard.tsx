import { Eye, ShoppingCart, Heart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types/product';
import { cn } from '@/lib/utils';
import { useWishlist } from '@/context/WishlistContext';
import { useNavigate } from 'react-router-dom';
import { CountdownTimer } from './CountdownTimer';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  className?: string;
}

const ProductCard = ({ product, onQuickView, className }: ProductCardProps) => {
  const navigate = useNavigate();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleNavigate = () => {
    navigate(`/product/${product.id}`);
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className={cn("group relative", className)}>
      <div className="aspect-[3/4] overflow-hidden rounded-xl bg-gray-100 dark:bg-card relative cursor-pointer" onClick={handleNavigate}>
        <img
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1560343076-ec47320b24d0?w=600'}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {discount > 0 && (
            <Badge className="bg-red-500 hover:bg-red-600">-{discount}%</Badge>
          )}
          {product.category === "New Arrivals" && (
            <Badge className="bg-primary hover:bg-primary/90">New</Badge>
          )}
        </div>

        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full shadow-lg translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-100"
            onClick={() => onQuickView?.(product)}
          >
            <Eye className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full shadow-lg translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-200"
            onClick={(e) => {
              e.stopPropagation();
              onQuickView?.(product);
            }}
          >
            <ShoppingCart className="h-5 w-5" />
          </Button>
        </div>

        {/* Flash Sale Timer */}
        {product.tags?.includes('Flash Sale') && (
          <div className="absolute bottom-3 left-3 right-3">
            <CountdownTimer
              endTime={new Date(Date.now() + 24 * 60 * 60 * 1000)} // 24 hours from now
            />
          </div>
        )}

        {/* Wishlist Button */}
        <Button
          size="icon"
          variant="ghost"
          className={cn(
            "absolute top-3 right-3 rounded-full hover:bg-background/80 transition-colors",
            isWishlisted ? "bg-background/80 text-red-500 hover:text-red-600" : "bg-transparent text-white hover:text-red-500"
          )}
          onClick={toggleWishlist}
        >
          <Heart className={cn("h-5 w-5", isWishlisted && "fill-current")} />
        </Button>
      </div>

      <div className="mt-4 space-y-1">
        <h3 className="text-sm text-muted-foreground">{product.category}</h3>
        <h2 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors cursor-pointer" onClick={() => onQuickView?.(product)}>
          {product.name}
        </h2>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <p className="font-bold text-slate-900 dark:text-slate-50">₹{product.price.toLocaleString()}</p>
            {product.originalPrice && (
              <p className="text-sm text-muted-foreground line-through">
                ₹{product.originalPrice.toLocaleString()}
              </p>
            )}
          </div>
          {Number(product.rating) > 0 && (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-rose-400 text-rose-400" />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{Number(product.rating).toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
