import { Separator } from "@/components/ui/separator";

const Returns = () => {
    return (
        <div className="container py-12 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Return & Refund Policy</h1>
            <Separator className="mb-8" />

            <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
                <section>
                    <h2 className="text-xl font-semibold mb-3">30-Day Money Back Guarantee</h2>
                    <p className="text-muted-foreground">
                        We want you to be completely satisfied with your purchase. If you're not happy with your order, you can return it within 30 days of the delivery date for a full refund.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">Conditions for Returns</h2>
                    <ul className="list-disc pl-5 text-muted-foreground space-y-2">
                        <li>Items must be unused and in the same condition that you received them.</li>
                        <li>Items must be in the original packaging.</li>
                        <li>You must have the receipt or proof of purchase.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">How to Initiate a Return</h2>
                    <p className="text-muted-foreground">
                        To start a return, please contact us at support@shop.com with your order number. We will send you a return shipping label, as well as instructions on how and where to send your package.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">Refunds</h2>
                    <p className="text-muted-foreground">
                        Once we receive your return, we will inspect it and notify you that we have received your returned item. We will immediately notify you on the status of your refund after inspecting the item.
                        If your return is approved, we will initiate a refund to your credit card (or original method of payment).
                    </p>
                </section>
            </div>
        </div>
    );
};

export default Returns;
