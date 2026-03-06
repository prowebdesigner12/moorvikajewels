import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageCircle, Mail, Send, CheckCircle2 } from "lucide-react";
import { toast } from 'sonner';

const AbandonedCarts = () => {
    const [carts, setCarts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState<string | null>(null);

    useEffect(() => {
        fetchCarts();
    }, []);

    const fetchCarts = () => {
        setIsLoading(true);
        fetch('/api/abandoned?admin=true')
            .then(res => res.json())
            .then(data => {
                setCarts(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error(err);
                setIsLoading(false);
            });
    };

    const sendAutomatedWhatsApp = async (cartId: string) => {
        setIsSending(cartId);
        try {
            const res = await fetch('/api/admin/recover_abandoned?admin=true', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cartId })
            });

            if (res.ok) {
                toast.success("Automated WhatsApp reminder sent!");
                fetchCarts();
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to send automated reminder");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred");
        } finally {
            setIsSending(null);
        }
    };

    const sendWhatsApp = (cart: any) => {
        if (!cart.customer_phone) {
            toast.error("No phone number available");
            return;
        }
        const text = `Hi ${cart.customer_name || 'there'}, we noticed you left some items in your cart at Moorvika Jewels. Complete your order now!`;
        window.open(`https://wa.me/${cart.customer_phone}?text=${encodeURIComponent(text)}`, '_blank');
    };

    const sendEmail = (cart: any) => {
        if (!cart.customer_email) {
            toast.error("No email available");
            return;
        }
        window.location.href = `mailto:${cart.customer_email}?subject=You left items in your cart&body=Hi ${cart.customer_name}, come back and complete your purchase!`;
    };

    if (isLoading && carts.length === 0) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Abandoned Checkouts</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Potential Recoveries</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Items</TableHead>
                                <TableHead>Value</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {carts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                        No abandoned carts found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                carts.map((cart) => {
                                    const items = JSON.parse(cart.items || '[]');
                                    return (
                                        <TableRow key={cart.id}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{cart.customer_name || 'Guest'}</span>
                                                    <span className="text-xs text-muted-foreground">{new Date(cart.updated_at).toLocaleString()}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col text-sm">
                                                    <span>{cart.customer_phone}</span>
                                                    <span className="text-muted-foreground text-xs">{cart.customer_email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <Badge variant={cart.reminder_count > 0 ? "default" : "outline"} className={cart.reminder_count > 0 ? "bg-green-100 text-green-800 border-green-200" : ""}>
                                                        {cart.reminder_count > 0 ? `${cart.reminder_count} Reminder(s) Sent` : "No Reminders Sent"}
                                                    </Badge>
                                                    {cart.notification_sent_at && (
                                                        <span className="text-[10px] text-muted-foreground">Last: {new Date(cart.notification_sent_at).toLocaleDateString()}</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm max-w-[200px] truncate">
                                                    {items.map((i: any) => `${i.quantity}x ${i.name}`).join(', ')}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-semibold">₹{cart.total_amount}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700 text-white"
                                                        onClick={() => sendAutomatedWhatsApp(cart.id)}
                                                        disabled={isSending === cart.id || !cart.customer_phone}
                                                    >
                                                        {isSending === cart.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 mr-1" />}
                                                        Automate
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="border-green-200 text-green-700 hover:bg-green-50" onClick={() => sendWhatsApp(cart)}>
                                                        <MessageCircle className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="sm" variant="outline" onClick={() => sendEmail(cart)}>
                                                        <Mail className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default AbandonedCarts;
