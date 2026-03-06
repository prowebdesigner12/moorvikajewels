import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import {
    Package,
    User as UserIcon,
    LogOut,
    RefreshCw,
    Share2,
    Gift,
    Bell,
    Mail,
    MessageSquare,
    Copy,
    ShoppingBag,
    CheckCircle2,
    ChevronRight // Added missing import
} from 'lucide-react';
import { toast } from 'sonner';
import { LoyaltyCard } from '@/components/store/LoyaltyCard';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/context/LanguageContext';

const Profile = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { t } = useLanguage();

    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [smsNotifications, setSmsNotifications] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'subscriptions' | 'referral'>('profile');
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [loyaltyData, setLoyaltyData] = useState<{ totalPoints: number, tier: any } | null>(null);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const fetchSettings = async () => {
        if (!user) return;
        try {
            const res = await fetch(`/api/customer/settings?phone=${user.phone}`);
            if (res.ok) {
                const data = await res.json();
                setEmailNotifications(data.email_notifications !== 0);
                setSmsNotifications(data.sms_notifications === 1);
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
        }
    };

    const handleUpdateSettings = async (email: boolean, sms: boolean) => {
        if (!user) return;
        setIsSaving(true);
        try {
            const res = await fetch('/api/customer/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: user.phone,
                    email_notifications: email,
                    sms_notifications: sms
                })
            });
            if (res.ok) {
                toast.success("Notification settings updated");
            } else {
                toast.error("Failed to update settings");
            }
        } catch (error) {
            toast.error("Error updating settings");
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        if (!user) return;

        const fetchRecentOrders = async () => {
            try {
                const res = await fetch(`/api/orders?phone=${user.phone}`);
                if (res.ok) {
                    const data = await res.json();
                    setRecentOrders(data.slice(0, 3)); // Only show top 3
                }
            } catch (error) {
                console.error("Error fetching recent orders:", error);
            } finally {
                setIsLoading(false);
            }
        };

        const fetchSubscriptions = async () => {
            try {
                const res = await fetch(`/api/subscriptions?phone=${user.phone}`);
                if (res.ok) {
                    const data = await res.json();
                    setSubscriptions(data);
                }
            } catch (error) {
                console.error("Error fetching subscriptions:", error);
            }
        };

        const fetchLoyaltyPoints = async () => {
            try {
                const res = await fetch(`/api/loyalty?userId=${user.phone}`);
                if (res.ok) {
                    const data = await res.json();
                    setLoyaltyData(data);
                }
            } catch (error) {
                console.error("Error fetching loyalty points:", error);
            }
        };

        fetchRecentOrders();
        fetchSettings();
        fetchSubscriptions();
        fetchLoyaltyPoints();
    }, [user]);

    const handleCancelSubscription = async (id: string) => {
        if (!confirm("Are you sure you want to cancel this subscription?")) return;
        try {
            const res = await fetch('/api/subscriptions', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: 'cancelled' })
            });
            if (res.ok) {
                toast.success("Subscription cancelled");
                setSubscriptions(subscriptions.map(s => s.id === id ? { ...s, status: 'cancelled' } : s));
            }
        } catch (error) {
            toast.error("Failed to cancel subscription");
        }
    };

    if (!user) {
        navigate('/');
        return null;
    }

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            <Header onCartClick={() => { }} onSearch={() => { }} />

            <main className="container px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">{t('my_account')}</h1>

                <div className="grid md:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="md:col-span-1 space-y-4">
                        <div className="bg-muted/30 p-6 rounded-2xl text-center border border-muted">
                            <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                                <UserIcon className="h-10 w-10" />
                            </div>
                            <h2 className="font-bold text-xl">{user.name}</h2>
                            <p className="text-sm text-muted-foreground mb-3">{user.email}</p>
                            <div className="flex justify-center gap-4">
                                <div className="text-center">
                                    <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">{t('points')}</p>
                                    <p className="text-lg font-black text-primary">{loyaltyData?.totalPoints || 0}</p>
                                </div>
                            </div>
                        </div>

                        <nav className="space-y-1">
                            <Button
                                variant={activeTab === 'profile' ? 'secondary' : 'ghost'}
                                className="w-full justify-start gap-3 h-12 rounded-xl"
                                onClick={() => setActiveTab('profile')}
                            >
                                <UserIcon className="h-4 w-4" /> {t('profile_details')}
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full justify-start gap-3 h-12 rounded-xl"
                                onClick={() => navigate('/orders')}
                            >
                                <Package className="h-4 w-4" /> {t('orders')}
                            </Button>
                            <Button
                                variant={activeTab === 'subscriptions' ? 'secondary' : 'ghost'}
                                className="w-full justify-start gap-3 h-12 rounded-xl"
                                onClick={() => setActiveTab('subscriptions')}
                            >
                                <RefreshCw className="h-4 w-4" /> {t('my_subscriptions')}
                            </Button>
                            <Button
                                variant={activeTab === 'referral' ? 'secondary' : 'ghost'}
                                className="w-full justify-start gap-3 h-12 rounded-xl"
                                onClick={() => setActiveTab('referral')}
                            >
                                <Gift className="h-4 w-4" /> {t('refer_and_earn')}
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full justify-start gap-3 h-12 rounded-xl text-red-500 hover:text-red-500 hover:bg-red-50"
                                onClick={handleLogout}
                            >
                                <LogOut className="h-4 w-4" /> {t('logout')}
                            </Button>
                        </nav>
                    </div>

                    {/* Content Area */}
                    <div className="md:col-span-3 space-y-8">
                        {activeTab === 'profile' && (
                            <>
                                {/* Loyalty Card */}
                                <LoyaltyCard userId={user.phone} />

                                <div className="bg-card border rounded-2xl p-6 shadow-sm">
                                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                        <Package className="h-5 w-5 text-primary" />
                                        {t('recent_orders')}
                                    </h3>

                                    <div className="space-y-4">
                                        {isLoading ? (
                                            <div className="flex justify-center py-12 text-muted-foreground animate-pulse font-medium">{t('loading_orders')}</div>
                                        ) : recentOrders.length === 0 ? (
                                            <div className="text-center py-12 border-2 border-dashed rounded-2xl">
                                                <ShoppingBag className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
                                                <p className="text-muted-foreground font-medium">{t('no_orders')}</p>
                                                <Button variant="link" onClick={() => navigate('/shop')}>{t('start_shopping')}</Button>
                                            </div>
                                        ) : (
                                            recentOrders.map((order) => (
                                                <div
                                                    key={order.id}
                                                    className="border rounded-xl p-4 bg-muted/5 cursor-pointer hover:bg-muted/10 transition-all border-muted/50"
                                                    onClick={() => navigate(`/track-order?id=${order.id}&phone=${user.phone}`)}
                                                >
                                                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-sm md:text-base">Order #{order.id}</span>
                                                                <span className={`text-[10px] md:text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                                                    order.status === 'shipped' ? 'bg-indigo-100 text-indigo-700' :
                                                                        'bg-blue-100 text-blue-700'
                                                                    }`}>
                                                                    {order.status}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground mt-1 tracking-tight">
                                                                Placed on {new Date(order.created_at).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-black text-sm md:text-base tracking-tighter">₹{order.total_amount.toLocaleString()}</p>
                                                            <p className="text-[10px] text-muted-foreground uppercase font-bold">{order.payment_method}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-end border-t border-muted/50 pt-3">
                                                        <span className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
                                                            View Details & Track <ChevronRight className="h-3 w-3" />
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                        {recentOrders.length > 0 && (
                                            <Button variant="outline" className="w-full rounded-xl h-10 font-bold" onClick={() => navigate('/orders')}>
                                                {t('view_all_orders')}
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* Notification Settings */}
                                <div className="bg-card border rounded-2xl p-6 shadow-sm">
                                    <div className="flex items-center gap-2 mb-6">
                                        <Bell className="h-5 w-5 text-primary" />
                                        <h3 className="text-lg font-bold">{t('notification_preferences')}</h3>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between p-4 bg-muted/10 rounded-xl">
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-4 w-4 text-primary" />
                                                    <Label className="text-base font-bold">{t('email_alerts')}</Label>
                                                </div>
                                                <p className="text-xs text-muted-foreground">Get order confirmations and shipping updates via email.</p>
                                            </div>
                                            <Switch
                                                checked={emailNotifications}
                                                onCheckedChange={(checked) => {
                                                    setEmailNotifications(checked);
                                                    handleUpdateSettings(checked, smsNotifications);
                                                }}
                                                disabled={isSaving}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-muted/10 rounded-xl">
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-2">
                                                    <MessageSquare className="h-4 w-4 text-primary" />
                                                    <Label className="text-base font-bold">{t('sms_updates')}</Label>
                                                </div>
                                                <p className="text-xs text-muted-foreground">Receive instant tracking alerts on your phone.</p>
                                            </div>
                                            <Switch
                                                checked={smsNotifications}
                                                onCheckedChange={(checked) => {
                                                    setSmsNotifications(checked);
                                                    handleUpdateSettings(emailNotifications, checked);
                                                }}
                                                disabled={isSaving}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'subscriptions' && (
                            <div className="bg-card border rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center gap-2 mb-6">
                                    <RefreshCw className="h-5 w-5 text-primary" />
                                    <h3 className="text-lg font-bold">{t('active_subscriptions')}</h3>
                                </div>
                                <div className="space-y-4">
                                    {subscriptions.length === 0 ? (
                                        <div className="text-center py-16 border-2 border-dashed rounded-2xl">
                                            <RefreshCw className="h-16 w-16 text-muted-foreground/10 mx-auto mb-4" />
                                            <p className="text-muted-foreground font-medium">You don't have any active subscriptions.</p>
                                            <Button variant="link" className="font-bold underline" onClick={() => navigate('/shop')}>{t('start_shopping')}</Button>
                                        </div>
                                    ) : (
                                        subscriptions.map(sub => (
                                            <div key={sub.id} className="border rounded-2xl p-4 flex items-center justify-between bg-muted/5">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-20 w-20 bg-muted rounded-xl overflow-hidden border border-muted shadow-sm">
                                                        {sub.product_image && <img src={sub.product_image} alt="" className="w-full h-full object-cover" />}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-bold text-lg">{sub.product_name}</h4>
                                                            <span className={`text-[8px] uppercase px-1.5 py-0.5 rounded-full font-black ${sub.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                                {sub.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground font-medium capitalize mt-1">
                                                            Delivered {sub.frequency} • Next: {new Date(sub.next_billing_date).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    {sub.status === 'active' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-red-500 border-red-100 hover:bg-red-50 h-9 px-4 rounded-xl font-bold"
                                                            onClick={() => handleCancelSubscription(sub.id)}
                                                        >
                                                            {t('cancel_plan')}
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'referral' && (
                            <div className="bg-card border rounded-2xl p-10 text-center shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                    <Gift className="h-40 w-40 rotate-12" />
                                </div>
                                <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                                    <Gift className="h-12 w-12 text-primary" />
                                    <div className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-black px-2 py-1 rounded-full animate-bounce">
                                        EXTRA POINTS
                                    </div>
                                </div>
                                <h3 className="text-3xl font-black mb-3">{t('refer_get_rewarded')}</h3>
                                <p className="text-muted-foreground mb-10 max-w-md mx-auto font-medium">
                                    {t('invite_friends')}
                                </p>

                                <div className="max-w-sm mx-auto p-8 bg-muted/30 rounded-3xl border-2 border-dashed border-primary/20 backdrop-blur-sm">
                                    <p className="text-xs font-black text-primary uppercase tracking-widest mb-3">{t('your_code')}</p>
                                    <div className="flex items-center gap-3 bg-background border border-muted rounded-2xl p-4 shadow-sm">
                                        <span className="flex-1 font-mono font-black text-2xl select-all tracking-tighter">
                                            {(user?.phone || 'SHOPHUB').slice(-4).toUpperCase()}REF
                                        </span>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-10 w-10 p-0 hover:bg-primary/10 hover:text-primary transition-all rounded-xl"
                                            onClick={() => {
                                                navigator.clipboard.writeText(`${(user?.phone || 'SHOPHUB').slice(-4).toUpperCase()}REF`);
                                                toast.success(t('copy_success'));
                                            }}
                                        >
                                            <Copy className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-8 mt-16">
                                    <div className="space-y-3">
                                        <div className="h-14 w-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                                            <Share2 className="h-7 w-7" />
                                        </div>
                                        <p className="text-sm font-black">1. {t('share_link')}</p>
                                        <p className="text-[10px] text-muted-foreground leading-tight font-medium uppercase tracking-tighter">Share your code with friends</p>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="h-14 w-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                                            <ShoppingBag className="h-7 w-7" />
                                        </div>
                                        <p className="text-sm font-black">2. {t('friends_shop')}</p>
                                        <p className="text-[10px] text-muted-foreground leading-tight font-medium uppercase tracking-tighter">They get ₹100 off first order</p>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="h-14 w-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                                            <CheckCircle2 className="h-7 w-7" />
                                        </div>
                                        <p className="text-sm font-black">3. {t('earn_points')}</p>
                                        <p className="text-[10px] text-muted-foreground leading-tight font-medium uppercase tracking-tighter">You get 500 points per friend</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Profile;
