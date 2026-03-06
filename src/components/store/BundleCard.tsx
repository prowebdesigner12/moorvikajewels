import { Bundle } from "@/types/product";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Plus } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";

interface BundleCardProps {
    bundle: Bundle;
    onAddToCart: (bundle: Bundle) => void;
}

export function BundleCard({ bundle, onAddToCart }: BundleCardProps) {
    const { convertPrice } = useCurrency();

    return (
        <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 border-primary/10">
            <div className="relative aspect-[16/9] overflow-hidden">
                <img
                    src={bundle.image || "/placeholder.svg"}
                    alt={bundle.name}
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-2 right-2 flex flex-col gap-2">
                    <Badge className="bg-primary text-primary-foreground font-bold">
                        {bundle.discount_label}
                    </Badge>
                    <Badge variant="secondary" className="backdrop-blur-md bg-white/30 text-black">
                        Combo Pack
                    </Badge>
                </div>
            </div>

            <CardHeader className="p-4 pb-2">
                <CardTitle className="text-xl font-bold leading-tight group-hover:text-primary transition-colors">
                    {bundle.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground line-clamp-2">
                    {bundle.description}
                </p>
            </CardHeader>

            <CardContent className="p-4 pt-0">
                <div className="space-y-2 mt-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Includes:</p>
                    <ul className="space-y-1">
                        {bundle.items.map((item, index) => (
                            <li key={index} className="text-sm flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                <span className="font-medium">{item.quantity}x</span>
                                {item.product?.name || "Product"}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-primary">
                        {convertPrice(bundle.price)}
                    </span>
                    <span className="text-sm text-muted-foreground line-through opacity-70">
                        {convertPrice(bundle.original_price)}
                    </span>
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-0">
                <Button
                    className="w-full gap-2 font-bold"
                    onClick={() => onAddToCart(bundle)}
                >
                    <Plus className="h-4 w-4" />
                    Add Bundle to Cart
                </Button>
            </CardFooter>
        </Card>
    );
}
