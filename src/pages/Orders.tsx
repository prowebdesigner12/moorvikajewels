import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import { Package, Search, ChevronRight, Loader2, Clock, CheckCircle, Truck, XCircle, Printer } from 'lucide-react';
import { toast } from 'sonner';

const Orders = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/');
            return;
        }

        const fetchOrders = async () => {
            try {
                const res = await fetch(`/api/orders?phone=${user.phone}`);
                if (res.ok) {
                    const data = await res.json();
                    setOrders(data);
                } else {
                    toast.error("Failed to load orders");
                }
            } catch (error) {
                console.error("Error fetching orders:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, [user, navigate]);

    if (!user) return null;

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
            case 'processing': return <Package className="h-4 w-4 text-blue-600" />;
            case 'shipped': return <Truck className="h-4 w-4 text-indigo-600" />;
            case 'delivered': return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'cancelled': return <XCircle className="h-4 w-4 text-red-600" />;
            default: return <Package className="h-4 w-4" />;
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800';
            case 'processing': return 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
            case 'shipped': return 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800';
            case 'delivered': return 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800';
            case 'cancelled': return 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';
            default: return 'bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header onCartClick={() => { }} onSearch={() => { }} />

            <main className="flex-1 container px-4 py-12 max-w-4xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Order History</h1>
                        <p className="text-muted-foreground mt-1">View and track all your orders</p>
                    </div>
                    <Button variant="outline" className="gap-2 rounded-full" onClick={() => navigate('/track-order')}>
                        <Search className="h-4 w-4" /> Track Other Order
                    </Button>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-muted-foreground">Loading your orders...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed">
                        <div className="h-20 w-20 bg-white dark:bg-card rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <Package className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <h2 className="text-xl font-semibold">No orders yet</h2>
                        <p className="text-muted-foreground mt-2 max-w-xs mx-auto">
                            Looks like you haven't placed any orders yet. Start shopping and they will appear here!
                        </p>
                        <Button className="mt-8 rounded-full px-8" onClick={() => navigate('/shop')}>
                            Go to Shop
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order.id} className="group bg-card border rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300">
                                <div className="p-6">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <span className="font-bold text-lg">Order #{order.id}</span>
                                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyles(order.status)}`}>
                                                    {getStatusIcon(order.status)}
                                                    <span className="capitalize">{order.status}</span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                        <div className="text-left md:text-right">
                                            <p className="text-lg font-bold">₹{order.total_amount.toLocaleString('en-IN')}</p>
                                            <p className="text-xs text-muted-foreground">{order.payment_method}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between border-t pt-4">
                                        <div className="flex -space-x-3 overflow-hidden">
                                            {/* We don't have items here, so we show a summary or just a button */}
                                            <span className="text-sm font-medium text-muted-foreground">
                                                Click to view tracking and details
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="gap-2 text-primary hover:text-primary hover:bg-primary/5"
                                                onClick={() => window.open(`/invoice/${order.id}?phone=${user.phone}`, '_blank')}
                                            >
                                                <Printer className="h-4 w-4" />
                                                <span className="hidden sm:inline">Invoice</span>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                className="gap-2 group-hover:translate-x-1 transition-transform"
                                                onClick={() => navigate(`/track-order?id=${order.id}&phone=${user.phone}`)}
                                            >
                                                Track Order <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
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

export default Orders;
