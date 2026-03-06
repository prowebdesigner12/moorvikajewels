import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useComparison } from "@/context/ComparisonContext";
import { X, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ComparisonModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ComparisonModal({ isOpen, onClose }: ComparisonModalProps) {
    const { items, removeFromComparison, clearComparison } = useComparison();
    const navigate = useNavigate();

    if (items.length === 0) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Product Comparison</DialogTitle>
                    </DialogHeader>
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">No products to compare. Add products from the shop.</p>
                        <Button onClick={onClose} className="mt-4">Close</Button>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle>Compare Products ({items.length}/3)</DialogTitle>
                        <Button variant="outline" size="sm" onClick={clearComparison}>
                            Clear All
                        </Button>
                    </div>
                </DialogHeader>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b">
                                <th className="p-4 text-left font-semibold w-48">Feature</th>
                                {items.map(product => (
                                    <th key={product.id} className="p-4 text-center min-w-[250px] relative">
                                        <button
                                            onClick={() => removeFromComparison(product.id)}
                                            className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-full"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                        <div className="space-y-2">
                                            <img
                                                src={product.images?.[0]}
                                                alt={product.name}
                                                className="w-full h-40 object-cover rounded-lg"
                                            />
                                            <h3 className="font-bold text-sm">{product.name}</h3>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b hover:bg-gray-50">
                                <td className="p-4 font-medium">Price</td>
                                {items.map(product => (
                                    <td key={product.id} className="p-4 text-center">
                                        <div className="text-2xl font-bold">₹{product.price.toLocaleString()}</div>
                                        {product.original_price && product.original_price > product.price && (
                                            <div className="text-sm text-muted-foreground line-through">
                                                ₹{product.original_price.toLocaleString()}
                                            </div>
                                        )}
                                    </td>
                                ))}
                            </tr>
                            <tr className="border-b hover:bg-gray-50">
                                <td className="p-4 font-medium">Rating</td>
                                {items.map(product => (
                                    <td key={product.id} className="p-4 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <Star className="h-4 w-4 fill-rose-400 text-rose-400" />
                                            <span className="font-semibold">{product.rating || 4.5}</span>
                                            <span className="text-muted-foreground text-sm">({product.reviews || 0})</span>
                                        </div>
                                    </td>
                                ))}
                            </tr>
                            <tr className="border-b hover:bg-gray-50">
                                <td className="p-4 font-medium">Description</td>
                                {items.map(product => (
                                    <td key={product.id} className="p-4 text-center text-sm text-muted-foreground">
                                        {product.description?.substring(0, 100)}...
                                    </td>
                                ))}
                            </tr>
                            <tr className="border-b hover:bg-gray-50">
                                <td className="p-4 font-medium">Category</td>
                                {items.map(product => (
                                    <td key={product.id} className="p-4 text-center">
                                        <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                                            {product.category}
                                        </span>
                                    </td>
                                ))}
                            </tr>
                            <tr className="border-b hover:bg-gray-50">
                                <td className="p-4 font-medium">Stock</td>
                                {items.map(product => (
                                    <td key={product.id} className="p-4 text-center">
                                        {product.variants && product.variants.length > 0 ? (
                                            <span className="text-green-600 font-semibold">In Stock</span>
                                        ) : (
                                            <span className="text-red-600 font-semibold">Out of Stock</span>
                                        )}
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="p-4 font-medium">Action</td>
                                {items.map(product => (
                                    <td key={product.id} className="p-4 text-center">
                                        <Button
                                            onClick={() => {
                                                navigate(`/product/${product.id}`);
                                                onClose();
                                            }}
                                            className="w-full"
                                        >
                                            View Details
                                        </Button>
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </DialogContent>
        </Dialog>
    );
}
