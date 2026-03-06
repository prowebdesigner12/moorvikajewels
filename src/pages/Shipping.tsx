import { Separator } from "@/components/ui/separator";
import { Truck, Clock, Globe } from "lucide-react";

const Shipping = () => {
    return (
        <div className="container py-12 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Shipping Information</h1>
            <Separator className="mb-8" />

            <div className="grid md:grid-cols-3 gap-6 mb-12">
                <div className="border p-6 rounded-lg text-center bg-card">
                    <Truck className="h-10 w-10 mx-auto mb-4 text-primary" />
                    <h3 className="font-semibold mb-2">Free Shipping</h3>
                    <p className="text-sm text-muted-foreground">On all orders over ₹999</p>
                </div>
                <div className="border p-6 rounded-lg text-center bg-card">
                    <Clock className="h-10 w-10 mx-auto mb-4 text-primary" />
                    <h3 className="font-semibold mb-2">Fast Delivery</h3>
                    <p className="text-sm text-muted-foreground">3-5 business days delivery</p>
                </div>
                <div className="border p-6 rounded-lg text-center bg-card">
                    <Globe className="h-10 w-10 mx-auto mb-4 text-primary" />
                    <h3 className="font-semibold mb-2">Nationwide</h3>
                    <p className="text-sm text-muted-foreground">We ship across India</p>
                </div>
            </div>

            <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
                <section>
                    <h2 className="text-xl font-semibold mb-3">Delivery Times</h2>
                    <p className="text-muted-foreground">
                        Standard shipping takes 3-5 business days. Express shipping (1-2 business days) is available at checkout for an additional fee.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">Order Tracking</h2>
                    <p className="text-muted-foreground">
                        Once your order ships, you will receive an email with a tracking number. You can track your order status on our Track Order page.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">International Shipping</h2>
                    <p className="text-muted-foreground">
                        Currently, we only ship within India. We are working on expanding our shipping capabilities to international destinations soon.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default Shipping;
