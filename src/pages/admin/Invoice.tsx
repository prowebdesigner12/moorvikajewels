import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const Invoice = () => {
    const { id } = useParams();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch order details
        const fetchOrder = async () => {
            try {
                const searchParams = new URLSearchParams(window.location.search);
                const phone = searchParams.get('phone');

                // If phone is provided, use the public tracking API, otherwise use admin API
                const endpoint = phone
                    ? `/api/orders?id=${id}&phone=${phone}`
                    : `/api/orders?id=${id}&admin=true`;

                const res = await fetch(endpoint);
                if (!res.ok) throw new Error("Order not found or access denied");

                const data = await res.json();
                setOrder(data);

                // Small delay to ensure table finishes rendering before print dialog opens
                setTimeout(() => {
                    window.print();
                }, 800);
            } catch (error) {
                console.error("Failed to load order", error);
                toast.error("Failed to load invoice data");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchOrder();
    }, [id]);

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
    if (!order) return <div className="p-8">Order not found.</div>;

    const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;

    return (
        <div className="bg-white min-h-screen p-8 max-w-4xl mx-auto text-black print:p-0">
            <div className="flex justify-between items-start mb-8 border-b pb-8">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight mb-2">INVOICE</h1>
                    <p className="text-gray-500">Order #{order.id}</p>
                    <p className="text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-bold">TopStore</h2>
                    <p className="text-sm text-gray-500">123 Commerce St, India</p>
                    <p className="text-sm text-gray-500">support@topstore.com</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                    <h3 className="font-bold text-gray-900 mb-2">Bill To:</h3>
                    <p className="font-bold">{order.customer_name}</p>
                    {order.is_b2b === 1 && <p className="text-gray-600 font-medium">{order.company_name}</p>}
                    <p>{order.address}</p>
                    <p>{order.city} - {order.pincode}</p>
                    <p>{order.customer_phone}</p>
                    {order.is_b2b === 1 && order.gst_number && (
                        <p className="mt-2 text-sm">
                            <span className="font-bold">GST:</span> {order.gst_number}
                        </p>
                    )}
                </div>
                <div className="text-right">
                    <h3 className="font-bold text-gray-900 mb-2">Payment Details:</h3>
                    <p className="capitalize">Method: {order.payment_method}</p>
                    <p className="capitalize">Status: {order.payment_status || order.status}</p>
                    {order.payment_id && <p>Trans ID: {order.payment_id}</p>}
                </div>
            </div>

            <table className="w-full mb-8">
                <thead>
                    <tr className="border-b-2 border-black">
                        <th className="text-left py-2">Item</th>
                        <th className="text-center py-2">Qty</th>
                        <th className="text-right py-2">Price</th>
                        <th className="text-right py-2">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item: any, i: number) => (
                        <tr key={i} className="border-b border-gray-100">
                            <td className="py-3">
                                <p className="font-medium">{item.product_name || item.name}</p>
                                {item.variant && <p className="text-sm text-gray-500">{item.variant.name}</p>}
                            </td>
                            <td className="text-center py-3">{item.quantity}</td>
                            <td className="text-right py-3">₹{item.price}</td>
                            <td className="text-right py-3">₹{(item.price * item.quantity).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="flex justify-end">
                <div className="w-64">
                    <div className="flex justify-between py-2 border-b">
                        <span className="font-medium">Subtotal</span>
                        <span>₹{order.total_amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                        <span className="font-medium">Shipping</span>
                        <span>Free</span>
                    </div>
                    <div className="flex justify-between py-2 text-lg font-bold">
                        <span>Total</span>
                        <span>₹{order.total_amount.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div className="mt-16 text-center text-sm text-gray-500">
                <p>Thank you for shopping with TopStore!</p>
                <p>For any queries, contact support@topstore.com</p>
            </div>

            <style>
                {`
                  @media print {
                     @page { margin: 0.5cm; }
                     body { margin: 0; padding: 0; }
                     .print\\:hidden { display: none; }
                  }
               `}
            </style>
        </div>
    );
};

export default Invoice;
