import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Trash2, Plus, Users, ShieldCheck } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface Admin {
    id: string;
    name: string;
    phone: string;
    email?: string;
    created_at: string;
}

const Settings = () => {
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newAdmin, setNewAdmin] = useState({ name: '', phone: '', email: '', password: '' });
    const [isAdding, setIsAdding] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            const res = await fetch('/api/admins');
            if (res.ok) {
                const data = await res.json();
                setAdmins(data);
            }
        } catch (error) {
            console.error("Failed to fetch admins", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsAdding(true);
        try {
            const res = await fetch('/api/admins', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newAdmin)
            });
            const data = await res.json();
            if (res.ok && data.success) {
                toast.success("Admin added successfully!");
                setNewAdmin({ name: '', phone: '', email: '', password: '' });
                fetchAdmins();
                setIsDialogOpen(false);
            } else {
                toast.error(data.error || "Failed to add admin");
            }
        } catch (error) {
            toast.error("Error adding admin");
        } finally {
            setIsAdding(false);
        }
    };

    const handleDeleteAdmin = async (id: string) => {
        if (!confirm("Are you sure you want to remove this admin?")) return;
        try {
            const res = await fetch(`/api/admins?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success("Admin removed");
                fetchAdmins();
            }
        } catch (error) {
            toast.error("Failed to remove admin");
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Settings & Team Management</h1>

            <div className="grid gap-6">
                {/* Admin Management Section - MOVED TO TOP */}
                <Card className="border-primary/50 shadow-md">
                    <CardHeader className="bg-primary/5">
                        <CardTitle className="text-primary flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Team Members & Admins
                        </CardTitle>
                        <CardDescription>
                            Create new admin users here. Only admins can access this panel.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="flex justify-end mb-4">
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add New Admin
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>Add New Admin</DialogTitle>
                                        <DialogDescription>
                                            Create a new administrator account.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleAddAdmin} className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">Full Name</Label>
                                            <Input
                                                id="name"
                                                value={newAdmin.name}
                                                onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                                                placeholder="John Doe"
                                                required
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <Input
                                                id="phone"
                                                value={newAdmin.phone}
                                                onChange={(e) => setNewAdmin({ ...newAdmin, phone: e.target.value })}
                                                placeholder="9876543210"
                                                required
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="password">Password</Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                value={newAdmin.password}
                                                onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                                                placeholder="******"
                                                required
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                value={newAdmin.email}
                                                onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                                                placeholder="john@example.com"
                                                type="email"
                                            />
                                        </div>
                                        <Button type="submit" disabled={isAdding} className="mt-2 text-white w-full">
                                            {isAdding ? "Creating..." : "Create Admin Account"}
                                        </Button>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-medium">Current Admin List</h3>
                            <div className="border rounded-md divide-y">
                                {admins.map(admin => (
                                    <div key={admin.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                {admin.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium">{admin.name}</p>
                                                <p className="text-sm text-muted-foreground">{admin.phone} {admin.email && `• ${admin.email}`}</p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                            onClick={() => handleDeleteAdmin(admin.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                {admins.length === 0 && !isLoading && (
                                    <div className="p-8 text-center text-muted-foreground">No admins found</div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Store Information</CardTitle>
                        <CardDescription>
                            Manage your store details and preferences.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="storeName">Store Name</Label>
                            <Input id="storeName" defaultValue="ShopHub" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contactEmail">Contact Email</Label>
                            <Input id="contactEmail" defaultValue="support@shop.com" type="email" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Notifications</CardTitle>
                        <CardDescription>
                            Configure how you receive alerts.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Order Alerts</Label>
                                <div className="text-sm text-muted-foreground">Receive emails for new orders</div>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Low Stock</Label>
                                <div className="text-sm text-muted-foreground">Alert when inventory is low</div>
                            </div>
                            <Switch defaultChecked />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button>Save Changes</Button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
