import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Edit, Layers, Package } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Bundles = () => {
    const [bundles, setBundles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchBundles = async () => {
        try {
            const res = await fetch('/api/bundles');
            if (res.ok) {
                const data = await res.json();
                setBundles(data);
            }
        } catch (error) {
            console.error("Failed to load bundles", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBundles();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this bundle?")) return;
        try {
            const res = await fetch(`/api/bundles?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success("Bundle deleted");
                fetchBundles();
            }
        } catch (error) {
            toast.error("Failed to delete bundle");
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Product Bundles</h2>
                    <p className="text-muted-foreground">Manage your combo offers and bundle deals.</p>
                </div>
                <Button onClick={() => navigate('/admin/bundles/new')}>
                    <Plus className="h-4 w-4 mr-2" /> Create Bundle
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bundles.map(bundle => (
                    <Card key={bundle.id} className="overflow-hidden">
                        <div className="aspect-video relative overflow-hidden bg-muted">
                            {bundle.image ? (
                                <img src={bundle.image} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                    <Layers className="h-8 w-8 opacity-20" />
                                </div>
                            )}
                        </div>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span className="line-clamp-1">{bundle.name}</span>
                                <span className="text-lg font-bold">₹{bundle.price}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                                <Package className="h-4 w-4" />
                                {bundle.items?.length || 0} products included
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => navigate(`/admin/bundles/edit/${bundle.id}`)}
                                >
                                    <Edit className="h-4 w-4 mr-2" /> Edit
                                </Button>
                                <Button
                                    variant="outline"
                                    className="text-destructive hover:bg-destructive hover:text-white"
                                    onClick={() => handleDelete(bundle.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {bundles.length === 0 && !loading && (
                <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed">
                    <Layers className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
                    <h3 className="font-semibold text-lg">No bundles found</h3>
                    <p className="text-sm text-muted-foreground mb-6">Start by creating your first product combo.</p>
                    <Button onClick={() => navigate('/admin/bundles/new')}>Create First Bundle</Button>
                </div>
            )}
        </div>
    );
};

export default Bundles;
