import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package, ShoppingBag, CreditCard, Calendar } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface CustomerDetailsModalProps {
    email: string | null;
    isOpen: boolean;
    onClose: () => void;
}

const CustomerDetailsModal = ({ email, isOpen, onClose }: CustomerDetailsModalProps) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && email) {
            const fetchCustomer = async () => {
                setLoading(true);
                try {
                    const res = await fetch(`/api/customers?email=${email}&admin=true`);
                    if (res.ok) {
                        setData(await res.json());
                    }
                } catch (error) {
                    console.error("Failed to load customer", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchCustomer();
        }
    }, [isOpen, email]);

    return (
        <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Customer Profile</DialogTitle>
                    <DialogDescription>Detailed history and stats for this customer</DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="animate-spin h-8 w-8 text-primary" />
                    </div>
                ) : data ? (
                    <div className="space-y-6">
                        {/* Header Stats */}
                        <div className="flex items-start justify-between bg-muted/30 p-4 rounded-lg">
                            <div>
                                <h2 className="text-xl font-bold">{data.name}</h2>
                                <div className="text-sm text-muted-foreground space-y-1">
                                    <p>{data.email}</p>
                                    <p>{data.phone}</p>
                                    <p>{data.city}, {data.pincode}</p>
                                </div>
                            </div>
                            <div className="text-right space-y-2">
                                <Badge variant="outline" className="text-base px-3 py-1">
                                    Lifetime Spent: <span className="font-bold ml-1 text-primary">₹{data.total_spent?.toLocaleString()}</span>
                                </Badge>
                                <p className="text-sm text-muted-foreground">
                                    Total Orders: <span className="font-medium text-foreground">{data.total_orders}</span>
                                </p>
                            </div>
                        </div>

                        <Separator />

                        {/* Top Products */}
                        {data.top_products && data.top_products.length > 0 && (
                            <div>
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <Package className="h-4 w-4" /> Frequently Purchased
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {data.top_products.map((prod: any, i: number) => (
                                        <div key={i} className="flex justify-between items-center border p-3 rounded bg-white">
                                            <span className="font-medium truncate flex-1">{prod.product_name}</span>
                                            <div className="text-xs text-right ml-2 text-muted-foreground">
                                                <p>{prod.count} orders</p>
                                                <p>Total: {prod.total_quantity} units</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Order History */}
                        <div>
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <ShoppingBag className="h-4 w-4" /> Order History
                            </h3>
                            <div className="space-y-3">
                                {data.orders && data.orders.length > 0 ? (
                                    data.orders.map((order: any) => (
                                        <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono font-medium">{order.id}</span>
                                                    <Badge variant="secondary" className="text-xs">{order.status}</Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(order.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="mt-2 sm:mt-0 text-right">
                                                <p className="font-bold">₹{order.total_amount?.toLocaleString()}</p>
                                                <p className="text-xs text-muted-foreground capitalize">{order.payment_method}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-muted-foreground text-sm">No orders found.</p>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center p-8 text-muted-foreground">Customer Not Found</div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default CustomerDetailsModal;
