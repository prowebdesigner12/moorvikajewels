import { CheckCircle, Package, ArrowRight, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { trackPurchase } from '@/utils/meta-pixel';

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Get order ID from state or fallback to a timestamp-based ID (though state should exist)
  // Get order ID from state or URL param (for better reload handling)
  const searchParams = new URLSearchParams(location.search);
  const orderId = location.state?.orderId || searchParams.get('orderId') || `ORD${Date.now().toString().slice(-8)}`;

  useEffect(() => {
    // Track Meta Pixel Purchase
    // Note: We don't have all item details here, but we can track the event with basic info
    // In a real scenario, we might want to pass more total info through state
    const value = location.state?.amount || 0;
    trackPurchase({
      content_ids: [], // Would ideally come from order details
      content_type: 'product',
      value: value,
      currency: 'INR',
      num_items: location.state?.itemCount || 0,
      order_id: orderId
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-8 pb-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>

          <h1 className="text-2xl font-bold mb-2">Order Placed Successfully!</h1>
          <p className="text-muted-foreground mb-6">
            Thank you for your order. We'll send you a confirmation email shortly.
          </p>

          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <p className="text-sm text-muted-foreground">Order ID</p>
            <p className="font-mono font-semibold text-lg tracking-wider text-primary">{orderId}</p>
            <p className="text-xs text-muted-foreground mt-1">Save this ID to track your order</p>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6">
            <Package className="h-4 w-4" />
            <span>Expected delivery: 3-5 business days</span>
          </div>

          <div className="space-y-3">
            <Button className="w-full" onClick={() => navigate('/')}>
              Continue Shopping
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button variant="outline" className="w-full" onClick={() => navigate(`/track-order?id=${orderId}`)}>
              Track Order
            </Button>
            <Button
              variant="outline"
              className="w-full gap-2 border-primary text-primary hover:bg-primary/5"
              onClick={() => {
                const phone = location.state?.phone || '';
                window.open(`/invoice/${orderId}${phone ? `?phone=${phone}` : ''}`, '_blank');
              }}
            >
              <Printer className="h-4 w-4" />
              Download Invoice
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderSuccess;
