import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import { toast } from "sonner";

const Newsletter = () => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast.success("Thank you for subscribing!");
    };

    return (
        <section className="py-16 bg-muted/50">
            <div className="container px-4">
                <div className="bg-card border rounded-3xl p-8 md:p-12 shadow-sm">
                    <div className="max-w-2xl mx-auto text-center space-y-4">
                        <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                            <Mail className="h-6 w-6" />
                        </div>
                        <h2 className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Join the Moorvika Family</h2>
                        <p className="text-muted-foreground">
                            Stay updated with new jewelry collections, exclusive bridal offers, and festive deals delivered to your inbox.
                        </p>
                        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 pt-4">
                            <Input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 h-12"
                                required
                            />
                            <Button type="submit" size="lg" className="h-12 px-8">
                                Subscribe
                            </Button>
                        </form>
                        <p className="text-xs text-muted-foreground pt-4">
                            By subscribing, you agree to our Terms of Service and Privacy Policy.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Newsletter;
