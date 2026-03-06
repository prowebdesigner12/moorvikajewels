import { Separator } from "@/components/ui/separator";

const Terms = () => {
    return (
        <div className="container py-12 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
            <Separator className="mb-8" />

            <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
                <section>
                    <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
                    <p className="text-muted-foreground">
                        By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">2. Use License</h2>
                    <p className="text-muted-foreground">
                        Permission is granted to temporarily download one copy of the materials (information or software) on ShopHub's website for personal, non-commercial transitory viewing only.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">3. Pricing and Availability</h2>
                    <p className="text-muted-foreground">
                        All prices are subject to change without notice. We reserve the right to limit quantities of any products or services that we offer.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">4. Returns and Refunds</h2>
                    <p className="text-muted-foreground">
                        Please review our Return Policy, which also governs your visit to our site, to understand our practices.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">5. Governing Law</h2>
                    <p className="text-muted-foreground">
                        Any claim relating to ShopHub's website shall be governed by the laws of the State without regard to its conflict of law provisions.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default Terms;
