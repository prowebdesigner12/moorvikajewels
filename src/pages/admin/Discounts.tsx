import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Plus, Search, Loader2, Trash2, TicketPercent } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Discount {
    id: string;
    code: string;
    type: string;
    value: number;
    status: string;
    used_count: number;
}

const Discounts = () => {
    const navigate = useNavigate();
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchDiscounts();
    }, []);

    const fetchDiscounts = async () => {
        try {
            const res = await fetch('/api/discounts');
            if (res.ok) {
                const data = await res.json();
                setDiscounts(data);
            }
        } catch (error) {
            console.error("Failed to load discounts", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Delete this discount code?")) return;

        try {
            const res = await fetch(`/api/discounts?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setDiscounts(discounts.filter(c => c.id !== id));
                toast.success("Discount deleted");
            }
        } catch (error) {
            toast.error("Failed to delete discount");
        }
    };

    const filteredDiscounts = discounts.filter(d =>
        d.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Discounts</h1>
                    <p className="text-muted-foreground">Manage discount codes and promotions.</p>
                </div>
                <Button onClick={() => navigate('/admin/discounts/new')} className="bg-gray-900 hover:bg-black text-white">
                    <Plus className="mr-2 h-4 w-4" /> Create discount
                </Button>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Filter discounts..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Used</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredDiscounts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        No discounts found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredDiscounts.map((discount) => (
                                    <TableRow
                                        key={discount.id}
                                        className="cursor-pointer hover:bg-gray-50 bg-white"
                                        onClick={() => navigate(`/admin/discounts/edit/${discount.id}`)}
                                    >
                                        <TableCell className="font-medium text-base">
                                            {discount.code}
                                            <div className="text-xs text-muted-foreground font-normal">
                                                {discount.value}{discount.type === 'percentage' ? '%' : ' currency'} off
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={discount.status === 'active' ? 'default' : 'secondary'} className={discount.status === 'active' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}>
                                                {discount.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="capitalize">{discount.type.replace('_', ' ')}</TableCell>
                                        <TableCell>{discount.used_count} times</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={(e) => handleDelete(discount.id, e)}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default Discounts;
