import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus, ArrowLeft, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';

const BundleEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [products, setProducts] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        originalPrice: '',
        image: '',
        items: [] as any[]
    });

    useEffect(() => {
        fetchProducts();
        if (isEdit) fetchBundle();
    }, [id]);

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products');
            if (res.ok) setProducts(await res.json());
        } catch (e) { toast.error("Failed to load products"); }
    };

    const fetchBundle = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/bundles?id=${id}`);
            if (res.ok) {
                const data = await res.json();
                setFormData({
                    name: data.name,
                    description: data.description || '',
                    price: data.price.toString(),
                    originalPrice: data.original_price?.toString() || '',
                    image: data.image || '',
                    items: data.items || []
                });
            }
        } catch (e) { toast.error("Failed to load bundle"); }
        finally { setLoading(false); }
    };

    const handleAddItem = (product: any) => {
        if (formData.items.find(i => i.product_id === product.id)) {
            toast.error("Product already in bundle");
            return;
        }
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, {
                product_id: product.id,
                name: product.name,
                image: product.images?.[0],
                quantity: 1
            }]
        }));
    };

    const handleRemoveItem = (prodId: string) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter(i => i.product_id !== prodId)
        }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.items.length === 0) {
            toast.error("Add at least one product to the bundle");
            return;
        }
        setSaving(true);
        try {
            const res = await fetch('/api/bundles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: id || crypto.randomUUID(),
                    ...formData,
                    price: Number(formData.price),
                    originalPrice: Number(formData.originalPrice)
                })
            });
            if (res.ok) {
                toast.success(isEdit ? "Bundle updated" : "Bundle created");
                navigate('/admin/bundles');
            }
        } catch (e) { toast.error("Failed to save bundle"); }
        finally { setSaving(false); }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);

    if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/admin/bundles')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h2 className="text-3xl font-bold tracking-tight">{isEdit ? 'Edit Bundle' : 'New Bundle'}</h2>
            </div>

            <form onSubmit={handleSave} className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Bundle Information</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Bundle Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Starter Kit"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="desc">Description</Label>
                                <Textarea
                                    id="desc"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Tell customers what's inside..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="price">Bundle Price (₹)</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="orig">Original Value (₹)</Label>
                                    <Input
                                        id="orig"
                                        type="number"
                                        value={formData.originalPrice}
                                        onChange={e => setFormData({ ...formData, originalPrice: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="image">Banner Image URL</Label>
                                <Input
                                    id="image"
                                    value={formData.image}
                                    onChange={e => setFormData({ ...formData, image: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Bundle Products</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search products to add..."
                                        className="pl-10"
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                    />
                                    {searchQuery && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10 overflow-hidden">
                                            {filteredProducts.map(p => (
                                                <div
                                                    key={p.id}
                                                    className="flex items-center gap-3 p-2 hover:bg-gray-50 cursor-pointer"
                                                    onClick={() => {
                                                        handleAddItem(p);
                                                        setSearchQuery('');
                                                    }}
                                                >
                                                    <img src={p.images?.[0]} className="h-8 w-8 object-cover rounded" />
                                                    <span className="text-sm">{p.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    {formData.items.map(item => (
                                        <div key={item.product_id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <img src={item.image} className="h-10 w-10 object-cover rounded" />
                                                <span className="text-sm font-medium">{item.name}</span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive"
                                                onClick={() => handleRemoveItem(item.product_id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Status</CardTitle></CardHeader>
                        <CardContent>
                            <Button className="w-full" size="lg" disabled={saving}>
                                {saving ? <Loader2 className="animate-spin mr-2" /> : 'Save Bundle'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </form>
        </div>
    );
};

export default BundleEditor;
