import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Save, Plus, Trash2, Image as ImageIcon, Loader2, MoreHorizontal, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Product, ProductVariant } from '@/types/product';

const ProductEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        originalPrice: '',
        costPerItem: '', // New placeholder, though not in DB yet
        category: '', // This will map to 'Type'
        tags: '',
        sku: '',
        barcode: '',
        trackQuantity: true,
        continueSellingOOS: false,
        weight: '',
        slug: '',
        meta_title: '',
        meta_description: '',
        meta_keywords: '',
        status: 'active',
        vendor: '',
        type: '',
        images: [] as string[]
    });

    const [variants, setVariants] = useState<ProductVariant[]>([{ id: '1', size: '', color: '', stock: 0, price: 0 }]);
    const [wholesaleTiers, setWholesaleTiers] = useState<any[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<{ file: File; preview: string }[]>([]);
    const [manualImage, setManualImage] = useState('');
    const [isPhysical, setIsPhysical] = useState(true);

    // Cleanup object URLs on unmount
    useEffect(() => {
        return () => {
            selectedFiles.forEach(f => URL.revokeObjectURL(f.preview));
        };
    }, [selectedFiles]);

    // Fetch Product Data if Edit Mode
    useEffect(() => {
        if (isEditMode) {
            fetchProductData();
        }
    }, [id]);

    const fetchProductData = async () => {
        setIsLoading(true);
        try {
            // Add timestamp to prevent caching
            const res = await fetch(`/api/products?id=${id}&t=${Date.now()}`);
            if (res.ok) {
                const data = await res.json();
                let product: Product | undefined;

                if (Array.isArray(data)) {
                    product = data.find(p => p.id === id);
                } else {
                    product = data as Product;
                }

                if (product) {
                    setFormData({
                        name: product.name,
                        description: product.description || '',
                        price: product.price.toString(),
                        originalPrice: product.originalPrice?.toString() || '',
                        costPerItem: '',
                        category: product.category,
                        tags: Array.isArray(product.tags) ? product.tags.join(', ') : (product.tags || ''),
                        sku: '',
                        barcode: '',
                        trackQuantity: product.track_quantity === undefined ? true : !!product.track_quantity,
                        continueSellingOOS: !!product.continue_selling_oos,
                        weight: product.weight?.toString() || '',
                        slug: product.slug || '',
                        meta_title: product.meta_title || '',
                        meta_description: product.meta_description || '',
                        meta_keywords: product.meta_keywords || '',
                        status: product.status || 'active',
                        vendor: product.vendor || '',
                        type: product.type || '',
                        images: product.images || []
                    });
                    if (product.variants && product.variants.length > 0) {
                        setVariants(product.variants);
                    } else {
                        setVariants([{ id: '1', size: '', color: '', stock: 0, price: 0 }]);
                    }
                    if (product.wholesale_tiers) {
                        setWholesaleTiers(product.wholesale_tiers);
                    }
                    setIsPhysical(product.weight !== null && product.weight !== undefined);
                } else {
                    toast.error("Product not found");
                    navigate('/admin/products');
                }
            }
        } catch (error) {
            console.error("Fetch error:", error);
            toast.error("Failed to load product details");
        } finally {
            setIsLoading(false);
        }
    };


    const generateAIDescription = async () => {
        if (!formData.name) {
            toast.error("Please enter a product name first");
            return;
        }

        setIsGenerating(true);
        try {
            // Simulated AI call with a realistic delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            const templates = [
                `Product high-quality ${formData.name}. Designed for style and comfort. Perfect for everyday use with premium materials.`,
                `Elevate your style with the all-new ${formData.name}. Features a modern aesthetic and durable construction. Available in multiple sizes.`,
                `Experience ultimate comfort with our signature ${formData.name}. Crafted with attention to detail and high-grade fabric.`
            ];

            const randomDescription = templates[Math.floor(Math.random() * templates.length)];
            setFormData(prev => ({ ...prev, description: randomDescription }));
            toast.success("AI description generated!");
        } catch (error) {
            toast.error("Failed to generate description");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files).map(file => ({
                file,
                preview: URL.createObjectURL(file)
            }));
            setSelectedFiles([...selectedFiles, ...newFiles]);
        }
    };

    const removeFile = (index: number) => {
        const fileToRemove = selectedFiles[index];
        if (fileToRemove) URL.revokeObjectURL(fileToRemove.preview);
        setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    };

    const removeUploadedImage = (index: number) => {
        const newImages = [...formData.images];
        newImages.splice(index, 1);
        setFormData({ ...formData, images: newImages });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            // 1. Upload New Images
            const uploadedUrls = [...formData.images];

            if (manualImage) {
                uploadedUrls.push(manualImage);
            }

            for (const item of selectedFiles) {
                const uploadData = new FormData();
                uploadData.append('file', item.file);

                try {
                    // 10s Timeout for upload
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 10000);

                    const res = await fetch('/api/upload', {
                        method: 'POST',
                        body: uploadData,
                        signal: controller.signal
                    });

                    clearTimeout(timeoutId);

                    if (res.ok) {
                        const data = await res.json();
                        if (data.url) {
                            uploadedUrls.push(data.url);
                        } else {
                            throw new Error("Invalid response");
                        }
                    } else {
                        const err = await res.text();
                        console.error("Upload failed", err);
                        throw new Error(err);
                    }
                } catch (err: any) {
                    console.error("File upload error:", err);
                    if (err.name === 'AbortError') {
                        toast.error(`Upload timed out: ${item.file.name}`);
                    } else {
                        toast.error(`Failed to upload ${item.file.name}: ${err.message}`);
                    }
                    continue;
                }
            }

            // 2. Prepare Payload
            const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);

            const productPayload = {
                ...formData,
                id: isEditMode ? id : undefined,
                price: Number(formData.price),
                originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
                weight: formData.weight ? Number(formData.weight) : null,
                track_quantity: formData.trackQuantity,
                continue_selling_oos: formData.continueSellingOOS,
                tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
                variants,
                wholesale_tiers: wholesaleTiers,
                stock: totalStock, // Explicitly send calculated stock
                images: uploadedUrls
            };


            // Auto-generate slug
            if (!productPayload.slug) {
                productPayload.slug = productPayload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            }

            // 3. Submit
            const method = isEditMode ? 'PUT' : 'POST';
            const url = isEditMode ? `/api/products?id=${id}` : '/api/products';

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productPayload)
            });

            if (res.ok) {
                const data = await res.json();
                toast.success(isEditMode ? "Product updated!" : "Product created!");

                if (!isEditMode && data.id) {
                    navigate(`/admin/products/edit/${data.id}`, { replace: true });
                }

                setSelectedFiles([]);
                setManualImage('');
            } else {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || "Failed to save");
            }

        } catch (error: any) {
            console.error("Save error:", error);
            toast.error(error.message || "Failed to save product");
        } finally {
            setIsSaving(false);
        }
    };

    // Wholesale Tier Helpers
    const addWholesaleTier = () => setWholesaleTiers([...wholesaleTiers, { min_quantity: 1, price: 0 }]);
    const removeWholesaleTier = (index: number) => setWholesaleTiers(wholesaleTiers.filter((_, i) => i !== index));
    const updateWholesaleTier = (index: number, field: string, value: number) => {
        const newTiers = [...wholesaleTiers];
        newTiers[index] = { ...newTiers[index], [field]: value };
        setWholesaleTiers(newTiers);
    };

    // Variant Helpers
    const addVariant = () => setVariants([...variants, { id: Date.now().toString(), size: '', color: '', stock: 0, price: 0 }]);
    const removeVariant = (index: number) => setVariants(variants.filter((_, i) => i !== index));
    const updateVariant = (index: number, field: keyof ProductVariant, value: string | number) => {
        const newVariants = [...variants];
        newVariants[index] = { ...newVariants[index], [field]: value };
        setVariants(newVariants);
    };


    if (isLoading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <form onSubmit={handleSave} className="container max-w-6xl py-8 pb-32 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" type="button" onClick={() => navigate('/admin/products')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-xl font-bold tracking-tight">{isEditMode ? formData.name : 'Add product'}</h1>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" type="button" onClick={() => navigate('/admin/products')}>Discard</Button>
                    <Button type="submit" className="bg-gray-900 hover:bg-black text-white" disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* --- Left Column (Main Content) --- */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Basic Info */}
                    <Card>
                        <CardContent className="pt-6 space-y-4">
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Short sleeve t-shirt" required />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label>Description</Label>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="text-xs h-7 text-primary font-bold hover:bg-primary/10 gap-1"
                                        onClick={generateAIDescription}
                                        disabled={isGenerating}
                                    >
                                        {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                                        Generate with AI
                                    </Button>
                                </div>
                                <Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="min-h-[200px]" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Media */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between py-4">
                            <CardTitle className="text-base">Media</CardTitle>
                            <div className="flex gap-2">
                                <Input
                                    className="h-8 text-xs w-[200px]"
                                    value={manualImage}
                                    onChange={e => setManualImage(e.target.value)}
                                    placeholder="Add from URL..."
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            if (manualImage) { setFormData({ ...formData, images: [...formData.images, manualImage] }); setManualImage(''); }
                                        }
                                    }}
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                {[...formData.images].map((img, i) => (
                                    <div key={`existing-${i}`} className="relative group aspect-square rounded-lg overflow-hidden border">
                                        <img src={img} alt={`Product ${i}`} className="h-full w-full object-cover" />
                                        <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeUploadedImage(i)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                {selectedFiles.map((item, i) => (
                                    <div key={`new-${i}`} className="relative group aspect-square rounded-lg overflow-hidden border">
                                        <img src={item.preview} alt="Preview" className="h-full w-full object-cover opacity-60" />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/5">
                                            {isSaving && <Loader2 className="h-6 w-6 animate-spin text-white drop-shadow-md" />}
                                        </div>
                                        <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeFile(i)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                <div className="border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors relative aspect-square cursor-pointer">
                                    <Plus className="h-6 w-6 text-gray-400" />
                                    <span className="text-xs text-gray-500 mt-2">Add New</span>
                                    <Input type="file" multiple accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileSelect} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pricing */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Pricing</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Price</Label>
                                <Input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} placeholder="0.00" required />
                            </div>
                            <div className="space-y-2">
                                <Label>Compare-at price</Label>
                                <Input type="number" value={formData.originalPrice} onChange={e => setFormData({ ...formData, originalPrice: e.target.value })} placeholder="0.00" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Inventory */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Inventory</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>SKU (Stock Keeping Unit)</Label>
                                    <Input value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Barcode (ISBN, UPC, GTIN)</Label>
                                    <Input value={formData.barcode} onChange={e => setFormData({ ...formData, barcode: e.target.value })} />
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="track_quantity" checked={formData.trackQuantity} onCheckedChange={(c) => setFormData({ ...formData, trackQuantity: !!c })} />
                                <Label htmlFor="track_quantity">Track quantity</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="continue_selling" checked={formData.continueSellingOOS} onCheckedChange={(c) => setFormData({ ...formData, continueSellingOOS: !!c })} />
                                <Label htmlFor="continue_selling">Continue selling when out of stock</Label>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Variants */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between py-4">
                            <CardTitle className="text-base">Variants</CardTitle>
                            <Button type="button" variant="ghost" size="sm" onClick={addVariant} className="text-blue-600 hover:text-blue-700 p-0 h-auto">
                                + Add another option
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {variants.map((variant, index) => (
                                    <div key={index} className="grid grid-cols-12 gap-2 items-center border-b pb-2 last:border-0 last:pb-0">
                                        <div className="col-span-3">
                                            <Input className="h-8" value={variant.size} onChange={e => updateVariant(index, 'size', e.target.value)} placeholder="Size" />
                                        </div>
                                        <div className="col-span-3">
                                            <Input className="h-8" value={variant.color} onChange={e => updateVariant(index, 'color', e.target.value)} placeholder="Color" />
                                        </div>
                                        <div className="col-span-2">
                                            <Input className="h-8" type="number" value={variant.stock} onChange={e => updateVariant(index, 'stock', Number(e.target.value))} placeholder="Stock" />
                                        </div>
                                        <div className="col-span-3">
                                            <Input className="h-8" type="number" value={variant.price} onChange={e => updateVariant(index, 'price', Number(e.target.value))} placeholder="Price" />
                                        </div>
                                        <div className="col-span-1 text-right">
                                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-500" onClick={() => removeVariant(index)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Wholesale Pricing */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between py-4">
                            <CardTitle className="text-base">Wholesale Pricing</CardTitle>
                            <Button type="button" variant="ghost" size="sm" onClick={addWholesaleTier} className="text-blue-600 hover:text-blue-700 p-0 h-auto">
                                + Add tier
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {wholesaleTiers.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">No wholesale tiers defined. Add one to enable bulk discounts.</p>
                                ) : (
                                    wholesaleTiers.map((tier, index) => (
                                        <div key={index} className="grid grid-cols-12 gap-4 items-center border-b pb-2 last:border-0 last:pb-0">
                                            <div className="col-span-5 space-y-1">
                                                <Label className="text-[10px] text-muted-foreground uppercase">Min Quantity</Label>
                                                <Input className="h-8" type="number" value={tier.min_quantity} onChange={e => updateWholesaleTier(index, 'min_quantity', Number(e.target.value))} />
                                            </div>
                                            <div className="col-span-5 space-y-1">
                                                <Label className="text-[10px] text-muted-foreground uppercase">Price per unit</Label>
                                                <Input className="h-8" type="number" value={tier.price} onChange={e => updateWholesaleTier(index, 'price', Number(e.target.value))} />
                                            </div>
                                            <div className="col-span-2 text-right pt-4">
                                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-500" onClick={() => removeWholesaleTier(index)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Search engine listing */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex justify-between">
                                <span>Search engine listing</span>
                                <span className="text-blue-600 text-sm cursor-pointer hover:underline">Edit</span>
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Add a title and description to see how this product might appear in a search engine listing
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-0">
                            <div className="space-y-1">
                                <Label>Page title</Label>
                                <Input value={formData.meta_title} onChange={e => setFormData({ ...formData, meta_title: e.target.value })} />
                            </div>
                            <div className="space-y-1">
                                <Label>Meta description</Label>
                                <Textarea className="h-20" value={formData.meta_description} onChange={e => setFormData({ ...formData, meta_description: e.target.value })} />
                            </div>
                            <div className="space-y-1">
                                <Label>URL handle</Label>
                                <Input value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} />
                            </div>
                        </CardContent>
                    </Card>

                </div>

                {/* --- Right Sidebar --- */}
                <div className="space-y-6">

                    {/* Status */}
                    <Card>
                        <CardHeader className="py-4">
                            <CardTitle className="text-base">Product Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Select value={formData.status} onValueChange={val => setFormData({ ...formData, status: val })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>

                    {/* Organization */}
                    <Card>
                        <CardHeader className="py-4">
                            <CardTitle className="text-base">Product Organization</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Input value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} placeholder="e.g. Shirts" />
                            </div>
                            <div className="space-y-2">
                                <Label>Vendor</Label>
                                <Input value={formData.vendor} onChange={e => setFormData({ ...formData, vendor: e.target.value })} placeholder="e.g. Nike" />
                            </div>
                            <div className="space-y-2">
                                <Label>Collections</Label>
                                <Input value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} placeholder="Search for collections..." />
                            </div>
                            <div className="space-y-2">
                                <Label>Tags</Label>
                                <Input value={formData.tags} onChange={e => setFormData({ ...formData, tags: e.target.value })} placeholder="Vintage, Cotton, Summer" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Shipping */}
                    <Card>
                        <CardHeader className="py-4">
                            <CardTitle className="text-base">Shipping</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="physical_product"
                                    checked={isPhysical}
                                    onCheckedChange={(c) => {
                                        setIsPhysical(!!c);
                                        if (!c) setFormData(prev => ({ ...prev, weight: '' }));
                                    }}
                                />
                                <Label htmlFor="physical_product">This is a physical product</Label>
                            </div>
                            <Separator />
                            {isPhysical && (
                                <div className="space-y-2">
                                    <Label>Weight</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            value={formData.weight}
                                            onChange={e => setFormData({ ...formData, weight: e.target.value })}
                                            placeholder="0.0"
                                            step="0.1"
                                            className="w-1/2"
                                        />
                                        <span className="text-sm text-muted-foreground">kg</span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                </div>

            </div>
        </form >
    );
};

export default ProductEditor;
