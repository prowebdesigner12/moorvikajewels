import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Save, Loader2, ArrowUpRight } from 'lucide-react';
import { Product } from '@/types/product';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface InventoryItem {
    productId: string;
    productName: string;
    productImage: string;
    variantIndex: number;
    sku: string; // From Form or Variant? MVP: Use variant text
    variantTitle: string;
    stock: number;
}

const Inventory = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products');
            if (res.ok) {
                const data: Product[] = await res.json();
                setProducts(data);

                // Flatten to Inventory Items
                const items: InventoryItem[] = [];
                data.forEach(p => {
                    if (p.variants && p.variants.length > 0) {
                        p.variants.forEach((v, idx) => {
                            items.push({
                                productId: p.id,
                                productName: p.name,
                                productImage: p.images?.[0] || '',
                                variantIndex: idx,
                                sku: p.id.substring(0, 4), // Placeholder if we don't have variant SKUs
                                variantTitle: `${v.size} / ${v.color}`,
                                stock: v.stock
                            });
                        });
                    }
                });
                setInventoryItems(items);
            }
        } catch (error) {
            console.error("Failed to fetch products", error);
            toast.error("Failed to load inventory");
        } finally {
            setIsLoading(false);
        }
    };

    const handleStockChange = (index: number, newStock: string) => {
        const value = parseInt(newStock) || 0;
        const newItems = [...inventoryItems];
        newItems[index].stock = value;
        setInventoryItems(newItems);
        setHasChanges(true); // Flag that we have unsaved changes
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // We need to group updates by Product because API updates per Product
            // 1. Group items by ProductID
            const updatesByProduct: Record<string, Product> = {};

            inventoryItems.forEach(item => {
                const product = products.find(p => p.id === item.productId);
                if (product) {
                    if (!updatesByProduct[product.id]) {
                        // Create a clone to modify
                        updatesByProduct[product.id] = JSON.parse(JSON.stringify(product));
                    }
                    // Update the specific variant in the clone
                    if (updatesByProduct[product.id].variants[item.variantIndex]) {
                        updatesByProduct[product.id].variants[item.variantIndex].stock = item.stock;
                    }
                }
            });

            // 2. Send update requests for each changed product
            // Optimally: Bulk Update API. Currently: Loop PUT requests.
            const promises = Object.values(updatesByProduct).map(product => {
                // Ensure required fields for PUT are present
                const payload = {
                    ...product,
                    // Ensure boolean maps to 0/1 if strictly needed by API types or just pass boolean if API handles it
                    // API implementation handles boolean -> 0/1 mapping manually in bind() so raw boolean is fine? 
                    // Wait, API expects JSON body.
                };

                return fetch(`/api/products?id=${product.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            });

            await Promise.all(promises);

            toast.success("Inventory updated successfully!");
            setHasChanges(false);
            fetchProducts(); // Refresh to be safe

        } catch (error) {
            console.error("Save error", error);
            toast.error("Failed to save inventory");
        } finally {
            setIsSaving(false);
        }
    };

    const filteredItems = inventoryItems.filter(item =>
        item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.variantTitle.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="space-y-6 pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
                    <p className="text-muted-foreground">Manage stock levels across all locations.</p>
                </div>
                <Button
                    className="bg-gray-900 hover:bg-black text-white"
                    onClick={handleSave}
                    disabled={!hasChanges || isSaving}
                >
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Changes
                </Button>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Filter products..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-gray-50">
                            <TableRow>
                                <TableHead className="w-[80px]"></TableHead>
                                <TableHead>Product Name</TableHead>
                                <TableHead>SKU</TableHead>
                                <TableHead>State</TableHead>
                                <TableHead className="w-[150px]">On Hand</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredItems.map((item, index) => (
                                <TableRow key={`${item.productId}-${item.variantIndex}`} className="hover:bg-gray-50/50">
                                    <TableCell>
                                        <div className="h-10 w-10 rounded border overflow-hidden bg-gray-100">
                                            {item.productImage && <img src={item.productImage} alt="" className="h-full w-full object-cover" />}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium flex items-center gap-2">
                                            <span onClick={() => navigate(`/admin/products/edit/${item.productId}`)} className="cursor-pointer hover:underline hover:text-blue-600">
                                                {item.productName}
                                            </span>
                                        </div>
                                        <div className="text-sm text-muted-foreground">{item.variantTitle}</div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">{item.sku}</TableCell>
                                    <TableCell>
                                        {item.stock <= 0 ? (
                                            <span className="text-red-600 bg-red-50 px-2 py-1 rounded text-xs font-medium">Out of stock</span>
                                        ) : (
                                            <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-medium">In stock</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="number"
                                                value={item.stock}
                                                onChange={(e) => {
                                                    // Find the REAL index in the master array since we are mapping filteredItems
                                                    // This is tricky. Let's find index in master array.
                                                    const realIndex = inventoryItems.findIndex(i => i.productId === item.productId && i.variantIndex === item.variantIndex);
                                                    if (realIndex !== -1) handleStockChange(realIndex, e.target.value);
                                                }}
                                                className={`h-9 w-24 text-right ${item.stock <= 0 ? 'text-red-500 border-red-200 bg-red-50' : ''}`}
                                            />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default Inventory;
