import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Truck, ShieldCheck, ChevronRight, Tag, Loader2, Award, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import { trackInitiateCheckout } from '@/utils/meta-pixel';

// Type definition for Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalPrice, totalAfterDiscount, discountAmount, appliedDiscount, clearCart, applyDiscount, removeDiscount } = useCart();
  const [method, setMethod] = useState<'online' | 'cod'>('online');
  const [isProcessing, setIsProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    // Track Meta Pixel InitiateCheckout
    trackInitiateCheckout({
      content_ids: items.map(item => (item.product?.id || item.bundle?.id || '').toString()),
      num_items: items.reduce((acc, item) => acc + item.quantity, 0),
      value: totalAfterDiscount,
      currency: 'INR'
    });
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs} `;
  };

  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [isPincodeLoading, setIsPincodeLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));

    // Pincode Lookup Logic
    if (name === 'pincode' && value.length === 6 && /^\d+$/.test(value)) {
      lookupPincode(value);
    }
  };

  const lookupPincode = async (pincode: string) => {
    setIsPincodeLoading(true);
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await res.json();
      if (data[0].Status === "Success") {
        const postOffice = data[0].PostOffice[0];
        setShippingInfo(prev => ({
          ...prev,
          city: postOffice.District,
          state: postOffice.State
        }));
        toast.success(`Location found: ${postOffice.District}, ${postOffice.State}`);
      } else {
        toast.error("Invalid Pincode or no data found.");
        setShippingInfo(prev => ({ ...prev, city: '', state: '' })); // Clear if not found
      }
    } catch (error) {
      console.error("Pincode lookup failed", error);
      toast.error("Failed to lookup pincode. Please enter city and state manually.");
      setShippingInfo(prev => ({ ...prev, city: '', state: '' })); // Clear on error
    } finally {
      setIsPincodeLoading(false);
    }
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const processOrder = async (finalData: any) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData)
      });

      if (res.ok) {
        const data = await res.json();
        clearCart();
        toast.success(`Success! Order ID: ${data.orderId}`);
        navigate('/order-success', {
          state: {
            orderId: data.orderId,
            phone: shippingInfo.phone,
            amount: totalAfterDiscount,
            itemCount: items.reduce((acc, item) => acc + item.quantity, 0)
          }
        });
      } else {
        const err = await res.json().catch(() => ({ error: "Server Error" }));
        throw new Error(err.error || "Failed to save order");
      }
    } catch (error: any) {
      console.error("Order Saving Error:", error);
      toast.error(error.message || "Failed to process order. Please contact support.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setIsProcessing(true);

    const baseOrderData = {
      customer: shippingInfo,
      items: items,
      totalAmount: totalAfterDiscount,
      paymentMethod: method
    };

    if (method === 'cod') {
      await processOrder(baseOrderData);
    } else {
      try {
        const isLoaded = await loadRazorpay();
        if (!isLoaded) throw new Error("Razorpay SDK not found");

        const orderRes = await fetch('/api/razorpay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: totalAfterDiscount })
        });

        if (!orderRes.ok) throw new Error("Payment gateway unreachable");
        const razorpayOrder = await orderRes.json();

        const options = {
          key: "rzp_live_S9wqPFEHShtVj1",
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: "TopStore",
          description: "Order Payment",
          order_id: razorpayOrder.id,
          handler: async (response: any) => {
            await processOrder({
              ...baseOrderData,
              paymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature
            });
          },
          prefill: {
            name: shippingInfo.fullName,
            email: shippingInfo.email,
            contact: shippingInfo.phone
          },
          theme: { color: "#000000" },
          modal: { ondismiss: () => setIsProcessing(false) }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (error: any) {
        toast.error(`Payment Error: ${error.message}`);
        setIsProcessing(false);
      }
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <Button onClick={() => navigate('/')}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-200/40 dark:bg-zinc-950">
      <div className="bg-amber-50 border-b border-amber-100 py-2 overflow-hidden shadow-sm">
        <div className="container max-w-6xl mx-auto px-4 flex items-center justify-center gap-3 text-[10px] sm:text-xs font-bold text-amber-800">
          <Clock className="h-3.5 w-3.5 animate-pulse shrink-0" />
          <span className="whitespace-nowrap">Order reserved for {formatTime(timeLeft)} minutes. Checkout soon!</span>
          <div className="flex-1 max-w-[150px] h-1.5 bg-amber-200 rounded-full overflow-hidden hidden xs:block">
            <div
              className="h-full bg-amber-500 transition-all duration-1000 ease-linear"
              style={{ width: `${(timeLeft / 600) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        <div className="flex items-center gap-2 mb-8 text-sm text-gray-500">
          <span className="cursor-pointer hover:text-black transition-colors" onClick={() => navigate('/')}>Shop</span>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold text-black underline underline-offset-4">Checkout</span>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Main Info */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
              <h2 className="text-xl sm:text-2xl font-bold mb-8 flex items-center gap-3">
                <ShieldCheck className="text-emerald-600 h-6 w-6" />
                Shipping Details
              </h2>

              <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Full Name</Label>
                    <Input name="fullName" placeholder="Rahul Kumar" required onChange={handleInputChange} className="h-12 bg-slate-100 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700/50 focus:bg-white transition-all rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Phone Number</Label>
                    <Input name="phone" placeholder="+91 00000 00000" required onChange={handleInputChange} className="h-12 bg-slate-100 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700/50 focus:bg-white transition-all rounded-xl" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-sm font-semibold">Email Address</Label>
                    <Input name="email" type="email" placeholder="rahul@example.com" required onChange={handleInputChange} className="h-12 bg-slate-100 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700/50 focus:bg-white transition-all rounded-xl" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-sm font-semibold">Complete Address</Label>
                    <Input name="address" placeholder="House No, Street, Landmark" required onChange={handleInputChange} className="h-12 bg-slate-100 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700/50 focus:bg-white transition-all rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Pincode</Label>
                    <div className="relative">
                      <Input name="pincode" placeholder="400001" required maxLength={6} onChange={handleInputChange} className="h-12 bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700/50 focus:bg-white transition-all rounded-xl" />
                      {isPincodeLoading && <Loader2 className="absolute right-3 top-3 h-6 w-6 animate-spin text-slate-400" />}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">City</Label>
                    <Input name="city" placeholder="Mumbai" value={shippingInfo.city} required onChange={handleInputChange} className="h-12 bg-slate-100 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700/50 focus:bg-white transition-all rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">State</Label>
                    <Input name="state" placeholder="Maharashtra" value={shippingInfo.state} required onChange={handleInputChange} className="h-12 bg-slate-100 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700/50 focus:bg-white transition-all rounded-xl" />
                  </div>
                </div>

                <Separator className="my-10 opacity-50" />

                <div className="space-y-6">
                  <h3 className="text-xl font-bold">Payment Method</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Razorpay Option */}
                    <div
                      onClick={() => setMethod('online')}
                      className={`relative p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 group ${method === 'online' ? 'border-black bg-black text-white shadow-xl translate-y-[-2px]' : 'border-slate-200 bg-slate-100 dark:bg-zinc-800/30 dark:border-zinc-800 hover:border-slate-300'}`}
                    >
                      <CreditCard className={`h-6 w-6 mb-3 ${method === 'online' ? 'text-white' : 'text-slate-400'}`} />
                      <p className="font-bold">Pay Online</p>
                      <p className={`text-xs mt-1 ${method === 'online' ? 'text-white/70' : 'text-slate-500'}`}>UPI, Cards, NetBanking</p>
                      {method === 'online' && <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />}
                    </div>

                    {/* COD Option */}
                    <div
                      onClick={() => setMethod('cod')}
                      className={`relative p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 group ${method === 'cod' ? 'border-black bg-black text-white shadow-xl translate-y-[-2px]' : 'border-slate-200 bg-slate-50 dark:bg-zinc-800/30 dark:border-zinc-800 hover:border-slate-300'}`}
                    >
                      <Truck className={`h-6 w-6 mb-3 ${method === 'cod' ? 'text-white' : 'text-slate-400'}`} />
                      <p className="font-bold">Cash on Delivery</p>
                      <p className={`text-xs mt-1 ${method === 'cod' ? 'text-white/70' : 'text-slate-500'}`}>Pay upon delivery</p>
                      {method === 'cod' && <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />}
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Mini Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm lg:sticky lg:top-24 mt-8 lg:mt-0">
              <h3 className="text-xl font-bold mb-6">Order Details</h3>
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 mb-8 custom-scrollbar">
                {items.map((item, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-100 dark:border-zinc-800">
                      <img src={item.bundle?.image || item.product?.images[0]} className="h-full w-full object-cover" alt="" />
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="font-bold line-clamp-1">{item.bundle?.name || item.product?.name}</p>
                      <p className="text-slate-500 text-xs mt-1">
                        {item.variant ? `${item.variant.color} / ${item.variant.size}` : 'Standard Edition'} (x{item.quantity})
                      </p>
                      <p className="font-bold mt-2">₹{((item.bundle?.price || item.variant?.price || 0) * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-8 space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Discount Code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="h-12 bg-slate-100 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-800 rounded-xl"
                  />
                  <Button
                    variant="outline"
                    className="h-12 px-6 rounded-xl"
                    disabled={!couponCode || isApplyingCoupon}
                    onClick={async () => {
                      setIsApplyingCoupon(true);
                      await applyDiscount(couponCode);
                      setIsApplyingCoupon(false);
                      setCouponCode('');
                    }}
                  >
                    {isApplyingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                  </Button>
                </div>

                {appliedDiscount && (
                  <div className="flex items-center justify-between p-3.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      <span>{appliedDiscount.code} applied</span>
                    </div>
                    <button
                      onClick={() => removeDiscount()}
                      className="text-[10px] hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4 py-6 border-y border-dashed border-slate-200 dark:border-zinc-800 text-sm font-medium">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span className="text-slate-900 dark:text-zinc-100 font-bold">₹{totalPrice.toLocaleString()}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Discount Applied</span>
                    <span>-₹{discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500">
                  <span>Shipping</span>
                  <span className="text-emerald-500 font-bold">Free</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-8">
                <span className="text-sm font-bold text-gray-400">Total Amount</span>
                <span className="text-3xl font-bold text-slate-900 dark:text-zinc-100">₹{totalAfterDiscount.toLocaleString()}</span>
              </div>

              <Button
                type="submit"
                form="checkout-form"
                className="w-full h-16 sm:h-18 text-xl font-bold rounded-2xl bg-black hover:bg-gray-900 dark:bg-zinc-100 dark:text-zinc-900 shadow-2xl transition-all active:scale-[0.98]"
                disabled={isProcessing}
              >
                {isProcessing ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : `Place Order (₹${totalAfterDiscount.toLocaleString()})`}
              </Button>

              <div className="mt-6 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-zinc-800/20 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800">
                <Sparkles className="h-3.5 w-3.5 text-indigo-500 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">End-to-End Enhanced Secure Payment</span>
              </div>

              <div className="mt-6">
                <div className="grid grid-cols-4 gap-2">
                  <div className="flex flex-col items-center text-center gap-1.5 group">
                    <div className="h-8 w-8 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center transition-transform group-hover:scale-105">
                      <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-[9px] font-medium text-slate-500">Secure</span>
                  </div>
                  <div className="flex flex-col items-center text-center gap-1.5 group">
                    <div className="h-8 w-8 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center transition-transform group-hover:scale-105">
                      <Award className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <span className="text-[9px] font-medium text-slate-500">Genuine</span>
                  </div>
                  <div className="flex flex-col items-center text-center gap-1.5 group">
                    <div className="h-8 w-8 rounded-full bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center transition-transform group-hover:scale-105">
                      <Truck className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <span className="text-[9px] font-medium text-slate-500">Fast</span>
                  </div>
                  <div className="flex flex-col items-center text-center gap-1.5 group">
                    <div className="h-8 w-8 rounded-full bg-cyan-50 dark:bg-cyan-500/10 flex items-center justify-center transition-transform group-hover:scale-105">
                      <CheckCircle2 className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <span className="text-[9px] font-medium text-slate-500">Verified</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 mt-8 pb-4 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all cursor-default">
                <div className="h-5 w-8 bg-slate-200 dark:bg-zinc-800 rounded shadow-sm" />
                <div className="h-5 w-8 bg-slate-200 dark:bg-zinc-800 rounded shadow-sm" />
                <div className="h-5 w-8 bg-slate-200 dark:bg-zinc-800 rounded shadow-sm" />
                <div className="h-5 w-8 bg-slate-200 dark:bg-zinc-800 rounded shadow-sm" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
