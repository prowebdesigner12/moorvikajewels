import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Search, Package, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";

const TrackOrder = () => {
    const [searchParams] = useSearchParams();
    const [orderId, setOrderId] = useState(searchParams.get("id") || "");
    const [phone, setPhone] = useState(searchParams.get("phone") || "");
    const [order, setOrder] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const id = searchParams.get("id");
        const tel = searchParams.get("phone");
        if (id && tel) {
            handleTrackAuto(id, tel);
        }
    }, [searchParams]);

    const handleTrackAuto = async (id: string, tel: string) => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/orders?id=${id.trim()}&phone=${tel.trim()}`);
            if (res.ok) {
                const data = await res.json();
                setOrder(data);
            }
        } catch (error) {
            console.error("Auto track error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        setOrder(null);
        if (!orderId || !phone) {
            toast.error("Please fill in all fields");
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch(`/api/orders?id=${orderId.trim()}&phone=${phone.trim()}`);
            if (res.ok) {
                const data = await res.json();
                setOrder(data);
                toast.success("Order found!");
            } else {
                const err = await res.json();
                toast.error(err.error || "Order not found");
            }
        } catch (error) {
            toast.error("Failed to track order");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container py-12 flex flex-col items-center gap-8">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Track Your Order</CardTitle>
                    <CardDescription>
                        Enter your order ID and mobile number to check your shipment status.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleTrack} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="order-id">Order ID</Label>
                            <Input
                                id="order-id"
                                placeholder="e.g. 4F3A2B"
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Mobile Number</Label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="e.g. 9876543210"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Searching..." : (
                                <>
                                    <Search className="mr-2 h-4 w-4" /> Track Order
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {order && (
                <Card className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4">
                    <CardHeader className="border-b bg-muted/20">
                        <div className="flex justify-between items-center flex-wrap gap-4">
                            <div>
                                <CardTitle>Order #{order.id}</CardTitle>
                                <CardDescription>Placed on {new Date(order.created_at).toLocaleDateString()}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-8 space-y-8">
                        {/* Tracking Timeline */}
                        <div className="relative">
                            {order.status === 'cancelled' ? (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex items-center justify-center font-medium">
                                    This order has been cancelled.
                                </div>
                            ) : (
                                <div className="w-full">
                                    <div className="flex justify-between mb-2">
                                        {['Ordered', 'Processed', 'Shipped', 'Out', 'Delivered'].map((step, i) => {
                                            const statusMap: any = { 'pending': 0, 'confirmed': 0, 'processing': 1, 'shipped': 2, 'out_for_delivery': 3, 'delivered': 4 };
                                            const currentStep = statusMap[order.status] || 0;
                                            const isCompleted = i <= currentStep;

                                            return (
                                                <div key={step} className="flex flex-col items-center flex-1 relative z-10">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300 bg-white dark:bg-card
                                                ${isCompleted ? 'border-green-600 text-green-600' : 'border-gray-200 dark:border-gray-800 text-gray-300 dark:text-gray-600'}
                                                ${i === currentStep ? 'ring-4 ring-green-100 dark:ring-green-900/20' : ''}`}>
                                                        {isCompleted ? <Package className="h-4 w-4 fill-current" /> : <span className="text-xs font-semibold">{i + 1}</span>}
                                                    </div>
                                                    <span className={`text-[10px] md:text-xs mt-2 font-medium text-center uppercase tracking-wide ${isCompleted ? 'text-green-700 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
                                                        {step === 'Out' ? 'Out for Delivery' : step}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {/* Progress Bar Background */}
                                    <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-100 -z-0"></div>
                                    {/* Progress Bar Active */}
                                    <div className="absolute top-4 left-0 h-0.5 bg-green-500 -z-0 transition-all duration-500"
                                        style={{ width: `${Math.max(0, Math.min(100, (({ 'pending': 0, 'processing': 25, 'shipped': 50, 'out_for_delivery': 75, 'delivered': 100 } as any)[order.status] || 0)))}%` }}></div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-4">
                                <Label className="text-base font-semibold">Items</Label>
                                {order.items.map((item: any) => (
                                    <div key={item.id} className="flex gap-4 items-center bg-gray-50/50 dark:bg-white/5 p-2 rounded-lg">
                                        <div className="h-16 w-16 bg-white dark:bg-card rounded-md border border-gray-100 dark:border-gray-800 overflow-hidden flex-shrink-0">
                                            {item.image ? (
                                                <img src={item.image} className="w-full h-full object-cover" alt={item.product_name} />
                                            ) : (
                                                <div className="flex items-center justify-center h-full w-full text-gray-300 dark:text-gray-600"><Package /></div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold truncate">{item.product_name}</p>
                                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="font-medium whitespace-nowrap">₹{(item.price * item.quantity).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t pt-4 flex justify-between items-center font-bold text-lg">
                                <span>Total Amount</span>
                                <span>₹{order.total_amount.toLocaleString()}</span>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6 bg-gray-50 dark:bg-white/5 p-4 rounded-lg text-sm border border-gray-100 dark:border-gray-800">
                                <div>
                                    <div className="flex items-center gap-2 font-medium mb-2 text-primary">
                                        <MapPin className="h-4 w-4" /> Delivery Address
                                    </div>
                                    <div className="text-muted-foreground space-y-1 ml-6">
                                        <p className="font-medium text-foreground">{order.customer_name}</p>
                                        <p>{order.address}</p>
                                        <p>{order.city} - {order.pincode}</p>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 font-medium mb-2 text-primary">
                                        <Phone className="h-4 w-4" /> Contact Info
                                    </div>
                                    <div className="text-muted-foreground space-y-1 ml-6">
                                        <p>{order.customer_email}</p>
                                        <p>{order.customer_phone}</p>
                                        <p className="capitalize">Payment: {order.payment_method}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default TrackOrder;
