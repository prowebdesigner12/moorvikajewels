import { Gift, Share2, CheckCircle2, ShoppingBag, Copy, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import AuthModal from '@/components/store/AuthModal';
import { useState } from 'react';

const ReferralPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isAuthOpen, setIsAuthOpen] = useState(false);

    const referralCode = user ? `${(user.phone || 'SHOP').slice(-4).toUpperCase()}REF` : '';

    const handleCopy = () => {
        if (!referralCode) return;
        navigator.clipboard.writeText(referralCode);
        toast.success("Referral code copied!");
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header onCartClick={() => navigate('/cart')} onSearch={() => { }} />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative overflow-hidden bg-primary/5 py-20 px-4">
                    <div className="absolute top-0 right-0 p-12 opacity-5 translate-x-1/3 -translate-y-1/3">
                        <Gift className="h-96 w-96 rotate-12" />
                    </div>

                    <div className="container max-w-4xl mx-auto text-center relative z-10">
                        <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-900 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-6 animate-bounce">
                            <Gift className="h-3 w-3" />
                            Invite & Earn
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-tight">
                            Share the love, <br />
                            <span className="text-primary">Earn Rewards.</span>
                        </h1>
                        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto font-medium">
                            Give your friends <span className="text-foreground font-bold">₹100 OFF</span> their first order, and you'll get <span className="text-foreground font-bold">500 Loyalty Points</span> when they shop.
                        </p>

                        {user ? (
                            <div className="bg-white dark:bg-card p-2 rounded-2xl shadow-xl border max-w-md mx-auto flex items-center gap-2 pl-6">
                                <span className="flex-1 text-left font-mono font-black text-2xl tracking-tighter">
                                    {referralCode}
                                </span>
                                <Button size="lg" onClick={handleCopy} className="rounded-xl font-bold">
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy Code
                                </Button>
                            </div>
                        ) : (
                            <div className="flex justify-center gap-4">
                                <Button size="lg" className="rounded-full px-8 h-12 font-bold text-lg" onClick={() => setIsAuthOpen(true)}>
                                    Login to Get Your Code
                                </Button>
                                <Button size="lg" variant="outline" className="rounded-full px-8 h-12 font-bold text-lg" onClick={() => navigate('/shop')}>
                                    Start Shopping
                                </Button>
                            </div>
                        )}
                    </div>
                </section>

                {/* How it works */}
                <section className="py-24 container px-4">
                    <h2 className="text-3xl font-black text-center mb-16">How it works</h2>

                    <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
                        <div className="text-center space-y-4 relative group">
                            <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                <Share2 className="h-10 w-10" />
                            </div>
                            <div className="absolute top-12 right-0 left-1/2 w-full h-0.5 bg-dashed border-t-2 border-gray-200 dark:border-gray-800 -z-10 hidden md:block"></div>
                            <h3 className="text-xl font-bold">1. Share your Link</h3>
                            <p className="text-muted-foreground">Copy your unique referral code and share it with your friends via WhatsApp, Instagram, or Email.</p>
                        </div>

                        <div className="text-center space-y-4 relative group">
                            <div className="w-24 h-24 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                <ShoppingBag className="h-10 w-10" />
                            </div>
                            <div className="absolute top-12 right-0 left-1/2 w-full h-0.5 bg-dashed border-t-2 border-gray-200 dark:border-gray-800 -z-10 hidden md:block"></div>
                            <h3 className="text-xl font-bold">2. Friends Shop</h3>
                            <p className="text-muted-foreground">Your friends get ₹100 OFF their first order (min ₹500) when they use your code at checkout.</p>
                        </div>

                        <div className="text-center space-y-4 group">
                            <div className="w-24 h-24 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                <CheckCircle2 className="h-10 w-10" />
                            </div>
                            <h3 className="text-xl font-bold">3. You Earn Points</h3>
                            <p className="text-muted-foreground">You automatically get 500 Loyalty Points added to your account once their order is delivered.</p>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-20 bg-black dark:bg-card border-t dark:border-border text-white text-center px-4">
                    <div className="container max-w-3xl mx-auto">
                        <h2 className="text-4xl font-black mb-6 text-white dark:text-foreground">Ready to start earning?</h2>
                        <p className="text-xl text-gray-400 dark:text-gray-400 mb-10">Join thousands of happy shoppers who are earning rewards every day.</p>
                        <Button
                            size="lg"
                            className="bg-white text-black hover:bg-gray-100 dark:bg-primary dark:text-primary-foreground h-14 px-10 rounded-full font-bold text-lg"
                            onClick={() => {
                                if (user) {
                                    navigate('/profile');
                                } else {
                                    setIsAuthOpen(true);
                                }
                            }}
                        >
                            {user ? 'View My Dashboard' : 'Join Now - It\'s Free'} <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                </section>
            </main>
            <Footer />
            <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
        </div>
    );
};

export default ReferralPage;
