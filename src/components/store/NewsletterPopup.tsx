import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { X } from "lucide-react";

export function NewsletterPopup() {
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        try {
            const isSubscribed = localStorage.getItem("newsletter_subscribed");
            const isClosed = localStorage.getItem("newsletter_closed");
            const now = new Date().getTime();
            const closedTime = isClosed ? parseInt(isClosed) : 0;
            const oneDay = 24 * 60 * 60 * 1000;

            // Show if not subscribed AND (never closed OR closed more than 1 day ago)
            if (!isSubscribed && (!isClosed || (now - closedTime > oneDay))) {
                const timer = setTimeout(() => {
                    setIsOpen(true);
                }, 5000); // Show after 5 seconds
                return () => clearTimeout(timer);
            }
        } catch (e) {
            console.warn("Newsletter popup state check failed", e);
        }
    }, []);

    const handleSubscribe = async () => {
        if (!email) return;
        setLoading(true);
        try {
            const res = await fetch("/api/newsletter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (res.ok) {
                toast.success("Subscribed successfully! Check your email for code.");
                localStorage.setItem("newsletter_subscribed", "true");
                setIsOpen(false);
            } else {
                toast.error("Failed to subscribe");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        localStorage.setItem("newsletter_closed", new Date().getTime().toString());
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px] text-center p-0 overflow-hidden bg-white border-none shadow-2xl">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 bg-top"></div>
                <div className="absolute right-4 top-4">
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-8">
                    <div className="mb-6 flex justify-center">
                        <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center text-3xl">🎁</div>
                    </div>

                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-center mb-2">Get 10% OFF</DialogTitle>
                        <DialogDescription className="text-center text-gray-500 mb-6">
                            Subscribe to our newsletter and get a special discount code for your first order!
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <Input
                            placeholder="Enter your email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-gray-50 border-gray-200 focus:ring-purple-500"
                        />
                        <Button
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 transition-opacity font-bold pt-2 pb-2 h-auto"
                            onClick={handleSubscribe}
                            disabled={loading}
                        >
                            {loading ? "Joining..." : "UNLOCK 10% DISCOUNT"}
                        </Button>
                        <p className="text-xs text-gray-400 mt-4">
                            No spam, we promise. Unsubscribe anytime.
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
