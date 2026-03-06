import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Loader2, Package, MapPin, Phone, User, Calendar, Printer, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import CustomerDetailsModal from '@/components/admin/CustomerDetailsModal';

const Orders = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    // For Customer Profile Modal
    const [selectedCustomerEmail, setSelectedCustomerEmail] = useState<string | null>(null);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/orders?admin=true');
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (error) {
            console.error("Failed to fetch orders", error);
            toast.error("Failed to load orders");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrderDetails = async (orderId: string) => {
        try {
            const res = await fetch(`/api/orders?id=${orderId}&admin=true`);
            if (res.ok) {
                const data = await res.json();
                setSelectedOrder(data);
                setIsDetailsOpen(true);
            }
        } catch (error) {
            toast.error("Failed to fetch order details");
        }
    };

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        // 1. Optimistic UI update
        const previousOrders = [...orders];
        setOrders(orders.map(o =>
            o.id === orderId ? { ...o, status: newStatus } : o
        ));

        try {
            // 2. Call API
            const res = await fetch('/api/orders', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: orderId, status: newStatus })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed");
            }

            toast.success(`Order ${orderId} marked as ${newStatus}`);
        } catch (error) {
            // 3. Revert on failure
            console.error("Status Update Failed", error);
            setOrders(previousOrders);
            toast.error("Failed to update status");
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-orange-100 text-orange-700';
            case 'processing': return 'bg-blue-100 text-blue-700';
            case 'shipped': return 'bg-purple-100 text-purple-700';
            case 'delivered': return 'bg-green-100 text-green-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Orders Management</h1>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Payment</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                    No orders found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            {order.id}
                                            {order.is_b2b === 1 && (
                                                <Badge variant="outline" className="text-[10px] uppercase font-bold text-blue-600 border-blue-200 bg-blue-50">
                                                    B2B
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <button
                                            className="font-medium text-blue-600 hover:underline flex flex-col items-start"
                                            onClick={() => setSelectedCustomerEmail(order.customer_email)}
                                        >
                                            {order.customer_name}
                                            <span className="text-xs text-muted-foreground font-normal">{order.customer_email}</span>
                                        </button>
                                    </TableCell>
                                    <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell>₹{order.total_amount}</TableCell>
                                    <TableCell className="capitalize">{order.payment_method}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className={getStatusColor(order.status)}>
                                            {order.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end items-center gap-2">
                                            <Select
                                                defaultValue={order.status}
                                                onValueChange={(val) => handleStatusChange(order.id, val)}
                                            >
                                                <SelectTrigger className="w-[130px] h-8">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="pending">Pending</SelectItem>
                                                    <SelectItem value="processing">Processing</SelectItem>
                                                    <SelectItem value="shipped">Shipped</SelectItem>
                                                    <SelectItem value="delivered">Delivered</SelectItem>
                                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => fetchOrderDetails(order.id)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Order Details Modal */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    {selectedOrder && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex justify-between items-center mr-6">
                                    <span>Order #{selectedOrder.id}</span>
                                    <Badge className={getStatusColor(selectedOrder.status)}>
                                        {selectedOrder.status}
                                    </Badge>
                                </DialogTitle>
                                <DialogDescription>
                                    Placed on {new Date(selectedOrder.created_at).toLocaleString()}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-6 py-4">
                                {/* Customer Info */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <h4 className="font-semibold flex items-center gap-2">
                                            <User className="h-4 w-4" /> Customer Details
                                        </h4>
                                        <div className="text-sm space-y-1 text-muted-foreground ml-6">
                                            <button
                                                className="text-primary font-medium hover:underline text-left"
                                                onClick={() => {
                                                    setIsDetailsOpen(false);
                                                    setSelectedCustomerEmail(selectedOrder.customer_email);
                                                }}
                                            >
                                                {selectedOrder.customer_name}
                                            </button>
                                            <p>{selectedOrder.customer_email}</p>
                                            <p>{selectedOrder.customer_phone}</p>
                                        </div>
                                    </div>
                                    {selectedOrder.is_b2b === 1 && (
                                        <div className="space-y-3">
                                            <h4 className="font-semibold flex items-center gap-2">
                                                <Building2 className="h-4 w-4" /> Business Info
                                            </h4>
                                            <div className="text-sm space-y-1 text-muted-foreground ml-6">
                                                <p className="font-bold text-black">{selectedOrder.company_name}</p>
                                                <p>GST: {selectedOrder.gst_number || 'Not Provided'}</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="space-y-3">
                                        <h4 className="font-semibold flex items-center gap-2">
                                            <MapPin className="h-4 w-4" /> Shipping Address
                                        </h4>
                                        <div className="text-sm space-y-1 text-muted-foreground ml-6">
                                            <p>{selectedOrder.address}</p>
                                            <p>{selectedOrder.city}, {selectedOrder.pincode}</p>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Order Items */}
                                <div>
                                    <h4 className="font-semibold flex items-center gap-2 mb-4">
                                        <Package className="h-4 w-4" /> Order Items
                                    </h4>
                                    <div className="space-y-4">
                                        {selectedOrder.items?.map((item: any) => (
                                            <div key={item.id} className="flex gap-4 items-center bg-muted/40 p-3 rounded-lg">
                                                <div className="h-12 w-12 bg-white rounded border overflow-hidden flex-shrink-0">
                                                    {item.image && <img src={item.image} alt={item.product_name} className="w-full h-full object-cover" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate">{item.product_name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Qty: {item.quantity} | Price: ₹{item.price}
                                                    </p>
                                                </div>
                                                <p className="font-medium">₹{item.price * item.quantity}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex justify-between items-center bg-primary/5 p-4 rounded-lg">
                                    <span className="font-semibold">Total Amount</span>
                                    <div className="flex items-center gap-4">
                                        <Button size="sm" variant="outline" onClick={() => window.open(`/invoice/${selectedOrder.id}`, '_blank')}>
                                            <Printer className="mr-2 h-4 w-4" /> Print Invoice
                                        </Button>
                                        <span className="font-bold text-xl">₹{selectedOrder.total_amount.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Customer Profile Modal */}
            <CustomerDetailsModal
                email={selectedCustomerEmail}
                isOpen={!!selectedCustomerEmail}
                onClose={() => setSelectedCustomerEmail(null)}
            />
        </div>
    );
};

export default Orders;
