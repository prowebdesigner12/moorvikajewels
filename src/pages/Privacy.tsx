import { Separator } from "@/components/ui/separator";

const Privacy = () => {
    return (
        <div className="container py-12 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
            <Separator className="mb-8" />

            <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
                <section>
                    <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
                    <p className="text-muted-foreground">
                        We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support. This includes your name, email address, payment information, and shipping address.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
                    <p className="text-muted-foreground">
                        We use your information to process transactions, provide customer support, and send you updates about your order. We may also send you promotional emails if you opt-in.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">3. Data Security</h2>
                    <p className="text-muted-foreground">
                        We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">4. Cookies</h2>
                    <p className="text-muted-foreground">
                        Our website uses cookies to enhance your browsing experience, analyze site traffic, and personalize content. You can manage your cookie preferences through your browser settings.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">5. Contact Us</h2>
                    <p className="text-muted-foreground">
                        If you have any questions about this Privacy Policy, please contact us at support@shop.com.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default Privacy;
