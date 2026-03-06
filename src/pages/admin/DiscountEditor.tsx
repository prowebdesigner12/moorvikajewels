import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Save, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const DiscountEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        code: '',
        type: 'percentage',
        value: '',
        status: 'active',
        usage_limit: '',
        min_amount: '',
        starts_at: new Date().toISOString().split('T')[0],
        ends_at: ''
    });

    useEffect(() => {
        if (isEditMode) {
            fetchDiscountData();
        }
    }, [id]);

    const fetchDiscountData = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/discounts');
            if (res.ok) {
                const discounts = await res.json();
                const discount = discounts.find((d: any) => d.id === id);
                if (discount) {
                    setFormData({
                        code: discount.code,
                        type: discount.type,
                        value: discount.value.toString(),
                        status: discount.status,
                        usage_limit: discount.usage_limit || '',
                        min_amount: discount.min_amount || '',
                        starts_at: discount.starts_at || '',
                        ends_at: discount.ends_at || ''
                    });
                }
            }
        } catch (error) {
            toast.error("Failed to load discount");
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
                value: Number(formData.value),
                usage_limit: formData.usage_limit ? Number(formData.usage_limit) : null,
                min_amount: formData.min_amount ? Number(formData.min_amount) : null
            };

            const method = isEditMode ? 'PUT' : 'POST';
            const url = isEditMode ? `/api/discounts?id=${id}` : '/api/discounts';

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success("Discount saved!");
                navigate('/admin/discounts');
            } else {
                const err = await res.json();
                throw new Error(err.error || "Failed to save");
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const generateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData({ ...formData, code });
    };

    if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <form onSubmit={handleSave} className="container max-w-4xl py-8 space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" type="button" onClick={() => navigate('/admin/discounts')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-xl font-bold tracking-tight">{isEditMode ? 'Edit Discount' : 'Create Discount'}</h1>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" type="button" onClick={() => navigate('/admin/discounts')}>Discard</Button>
                    <Button type="submit" className="bg-gray-900 hover:bg-black text-white" disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Discount
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Discount Code</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    value={formData.code}
                                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    placeholder="e.g. SUMMERSALE20"
                                    className="uppercase font-medium"
                                    required
                                />
                                <Button type="button" variant="outline" onClick={generateCode}>
                                    <Sparkles className="mr-2 h-4 w-4" /> Generate
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">Customers will enter this discount code at checkout.</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Value</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <RadioGroup value={formData.type} onValueChange={v => setFormData({ ...formData, type: v })}>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="percentage" id="percentage" />
                                    <Label htmlFor="percentage">Percentage</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="fixed_amount" id="fixed_amount" />
                                    <Label htmlFor="fixed_amount">Fixed Amount</Label>
                                </div>
                            </RadioGroup>

                            <div className="space-y-2">
                                <Label>Discount Value</Label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        value={formData.value}
                                        onChange={e => setFormData({ ...formData, value: e.target.value })}
                                        placeholder="0"
                                        className="pl-8"
                                        required
                                    />
                                    <span className="absolute left-3 top-2.5 text-gray-400 font-medium">
                                        {formData.type === 'percentage' ? '%' : '$'}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Minimum Requirements</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Label>Minimum Purchase Amount ($)</Label>
                                <Input
                                    type="number"
                                    value={formData.min_amount}
                                    onChange={e => setFormData({ ...formData, min_amount: e.target.value })}
                                    placeholder="0.00"
                                />
                                <p className="text-xs text-muted-foreground">Leave blank for no minimum.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Active Dates</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Start Date</Label>
                                <Input
                                    type="date"
                                    value={formData.starts_at}
                                    onChange={e => setFormData({ ...formData, starts_at: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>End Date (Optional)</Label>
                                <Input
                                    type="date"
                                    value={formData.ends_at}
                                    onChange={e => setFormData({ ...formData, ends_at: e.target.value })}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Usage Limits</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Label>Limit number of times this discount can be used in total</Label>
                                <Input
                                    type="number"
                                    value={formData.usage_limit}
                                    onChange={e => setFormData({ ...formData, usage_limit: e.target.value })}
                                    placeholder="No limit"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    );
};

export default DiscountEditor;
