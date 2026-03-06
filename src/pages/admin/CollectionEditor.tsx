import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Loader2, Search, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Product } from '@/types/product';

const CollectionEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image: '',
        slug: '',
        type: 'manual',
    });

    const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [productSearch, setProductSearch] = useState('');

    useEffect(() => {
        fetchAllProducts();
        if (isEditMode) {
            fetchCollectionData();
        }
    }, [id]);

    const fetchAllProducts = async () => {
        try {
            const res = await fetch('/api/products');
            if (res.ok) setAllProducts(await res.json());
        } catch (e) {
            console.error("Failed to load products");
        }
    };

    const fetchCollectionData = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/collections');
            if (res.ok) {
                const collections = await res.json();
                const collection = collections.find((c: any) => c.id === id);
                if (collection) {
                    setFormData({
                        title: collection.title,
                        description: collection.description || '',
                        image: collection.image || '',
                        slug: collection.slug || '',
                        type: collection.type || 'manual',
                    });
                    setSelectedProductIds(collection.products || []);
                }
            }
        } catch (error) {
            toast.error("Failed to load collection");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const payload = {
                ...formData,
                products: selectedProductIds
            };

            const method = isEditMode ? 'PUT' : 'POST';
            const url = isEditMode ? `/api/collections?id=${id}` : '/api/collections';

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success("Collection saved!");
                navigate('/admin/collections');
            } else {
                throw new Error("Failed to save");
            }
        } catch (error) {
            toast.error("Error saving collection");
        } finally {
            setIsSaving(false);
        }
    };

    const toggleProduct = (productId: string) => {
        if (selectedProductIds.includes(productId)) {
            setSelectedProductIds(selectedProductIds.filter(id => id !== productId));
        } else {
            setSelectedProductIds([...selectedProductIds, productId]);
        }
    };

    const filteredProducts = allProducts.filter(p =>
        p.name.toLowerCase().includes(productSearch.toLowerCase())
    );

    if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <form onSubmit={handleSave} className="container max-w-5xl py-8 space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" type="button" onClick={() => navigate('/admin/collections')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-xl font-bold tracking-tight">{isEditMode ? 'Edit Collection' : 'Create Collection'}</h1>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" type="button" onClick={() => navigate('/admin/collections')}>Discard</Button>
                    <Button type="submit" className="bg-gray-900 hover:bg-black text-white" disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardContent className="pt-6 space-y-4">
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Summer Sale" required />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="min-h-[150px]" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Products</CardTitle>
                            <CardDescription>Manually select products for this collection.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    className="pl-8"
                                    placeholder="Search products..."
                                    value={productSearch}
                                    onChange={e => setProductSearch(e.target.value)}
                                />
                            </div>

                            <div className="border rounded-md max-h-[400px] overflow-y-auto divide-y">
                                {filteredProducts.map(product => {
                                    const isSelected = selectedProductIds.includes(product.id);
                                    return (
                                        <div
                                            key={product.id}
                                            className={`flex items-center p-3 gap-3 hover:bg-gray-50 cursor-pointer ${isSelected ? 'bg-blue-50/50' : ''}`}
                                            onClick={() => toggleProduct(product.id)}
                                        >
                                            <div className={`h-4 w-4 rounded border flex items-center justify-center ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                                                {isSelected && <Check className="h-3 w-3 text-white" />}
                                            </div>
                                            <div className="h-10 w-10 rounded bg-gray-100 overflow-hidden border">
                                                {product.images?.[0] && <img src={product.images[0]} className="h-full w-full object-cover" />}
                                            </div>
                                            <div className="flex-1 text-sm font-medium">{product.name}</div>
                                        </div>
                                    );
                                })}
                            </div>

                            <p className="text-sm text-muted-foreground">{selectedProductIds.length} products selected</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Collection Image</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors relative h-40">
                                {formData.image ? (
                                    <>
                                        <img src={formData.image} className="absolute inset-0 h-full w-full object-cover rounded-lg" />
                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="destructive"
                                            className="absolute top-2 right-2 h-6 w-6"
                                            onClick={(e) => { e.stopPropagation(); setFormData({ ...formData, image: '' }); }}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </>
                                ) : (
                                    <span className="text-sm text-gray-500">Paste URL below for now</span>
                                )}
                            </div>
                            <Input
                                className="mt-2"
                                placeholder="Image URL..."
                                value={formData.image}
                                onChange={e => setFormData({ ...formData, image: e.target.value })}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Search engine listing</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="space-y-1">
                                <Label className="text-xs">URL Handle</Label>
                                <Input value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} placeholder="summer-sale" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    );
};

export default CollectionEditor;
