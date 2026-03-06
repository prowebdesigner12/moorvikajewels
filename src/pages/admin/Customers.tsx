import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Eye, Clock, ShoppingBag, Mail, Phone, MapPin, History } from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface User {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    role: string;
    status: string;
    created_at: string;
    avatar_url: string | null;
}

const Customers = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users');
            if (res.ok) {
                const data = await res.json();
                setUsers(data as User[]);
            }
        } catch (e) {
            console.error(e);
            toast.error("Failed to load users");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCustomerDetails = async (id: string) => {
        setIsDetailLoading(true);
        setIsSheetOpen(true);
        try {
            const res = await fetch(`/api/customers?id=${id}&admin=true`);
            if (res.ok) {
                const data = await res.json();
                setSelectedCustomer(data);
            } else {
                toast.error("Failed to load customer details");
            }
        } catch (e) {
            console.error(e);
            toast.error("Error loading details");
        } finally {
            setIsDetailLoading(false);
        }
    };

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'login': return <Clock className="h-4 w-4 text-blue-500" />;
            case 'signup': return <Clock className="h-4 w-4 text-green-500" />;
            case 'order_placed': return <ShoppingBag className="h-4 w-4 text-orange-500" />;
            case 'status_change': return <History className="h-4 w-4 text-purple-500" />;
            default: return <Clock className="h-4 w-4 text-gray-500" />;
        }
    };

    const formatAction = (action: string) => {
        return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const toggleStatus = async (user: User) => {
        const newStatus = user.status === 'approved' ? 'pending' : 'approved';
        try {
            const res = await fetch('/api/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: user.id, status: newStatus })
            });
            if (res.ok) {
                toast.success(`User ${newStatus === 'approved' ? 'Approved' : 'Suspended'}`);
                fetchUsers();
            } else {
                toast.error("Failed to update status");
            }
        } catch (e) {
            toast.error("Error updating status");
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Customers Management</h2>

            <Card>
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                                </TableRow>
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">No users found</TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                {user.avatar_url && <img src={user.avatar_url} className="w-6 h-6 rounded-full" />}
                                                {user.name}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col text-sm">
                                                <span>{user.email || '-'}</span>
                                                <span className="text-muted-foreground">{user.phone || '-'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{user.role}</TableCell>
                                        <TableCell>
                                            <Badge variant={user.status === 'approved' ? 'default' : 'destructive'}>
                                                {user.status || 'approved'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="gap-1"
                                                    onClick={() => fetchCustomerDetails(user.id)}
                                                >
                                                    <Eye className="h-3 w-3" /> View
                                                </Button>
                                                {user.role !== 'admin' && (
                                                    <Button
                                                        size="sm"
                                                        variant={user.status === 'approved' ? 'destructive' : 'default'}
                                                        onClick={() => toggleStatus(user)}
                                                    >
                                                        {user.status === 'approved' ? 'Suspend' : 'Approve'}
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="sm:max-w-xl w-full">
                    <SheetHeader className="mb-6">
                        <SheetTitle>Customer Details</SheetTitle>
                        <SheetDescription>
                            Full profile and activity history.
                        </SheetDescription>
                    </SheetHeader>

                    {isDetailLoading ? (
                        <div className="flex items-center justify-center h-[400px]">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : selectedCustomer ? (
                        <ScrollArea className="h-[calc(100vh-150px)] pr-4">
                            <div className="space-y-8 pb-10">
                                {/* Basic Info */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                                            {selectedCustomer.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold">{selectedCustomer.name}</h3>
                                            <p className="text-sm text-muted-foreground italic">Customer since {new Date(selectedCustomer.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <span className="truncate">{selectedCustomer.email || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <span>{selectedCustomer.phone || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Stats Cards */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-muted/30 p-4 rounded-xl border">
                                        <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Total Orders</p>
                                        <p className="text-2xl font-bold">{selectedCustomer.total_orders || 0}</p>
                                    </div>
                                    <div className="bg-muted/30 p-4 rounded-xl border">
                                        <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Total Spent</p>
                                        <p className="text-2xl font-bold text-primary">₹{(selectedCustomer.total_spent || 0).toLocaleString()}</p>
                                    </div>
                                </div>

                                {/* Activity Timeline */}
                                <div className="space-y-4">
                                    <h4 className="font-bold flex items-center gap-2">
                                        <History className="h-4 w-4" /> Activity Timeline
                                    </h4>
                                    <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-muted-foreground/20">
                                        {selectedCustomer.activities?.length > 0 ? (
                                            selectedCustomer.activities.map((log: any) => (
                                                <div key={log.id} className="relative">
                                                    <div className="absolute -left-[22px] top-1 bg-background p-0.5 rounded-full border">
                                                        {getActionIcon(log.action)}
                                                    </div>
                                                    <div className="bg-muted/10 p-3 rounded-lg border border-transparent hover:border-muted-foreground/10 transition-colors">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <span className="text-sm font-semibold">{formatAction(log.action)}</span>
                                                            <span className="text-[10px] text-muted-foreground font-mono">
                                                                {new Date(log.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                                            </span>
                                                        </div>
                                                        {log.details && (
                                                            <p className="text-xs text-muted-foreground mt-1 bg-background/50 p-2 rounded leading-tight">
                                                                {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-muted-foreground text-center py-4 italic">No activity recorded yet.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Order History Summary */}
                                <div className="space-y-4">
                                    <h4 className="font-bold">Recent Orders</h4>
                                    <div className="space-y-2">
                                        {(selectedCustomer.orders || []).slice(0, 5).map((order: any) => (
                                            <div key={order.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/20 transition-colors text-sm">
                                                <div>
                                                    <span className="font-bold">#{order.id}</span>
                                                    <span className="text-xs text-muted-foreground ml-2">{new Date(order.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold">₹{order.total_amount.toLocaleString()}</p>
                                                    <p className="text-[10px] uppercase font-bold text-blue-600">{order.status}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>
                    ) : null}
                </SheetContent>
            </Sheet>
        </div>
    );
};

export default Customers;
