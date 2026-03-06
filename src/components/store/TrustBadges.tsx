import { ShieldCheck, Truck, RotateCcw, Gem } from 'lucide-react';

const TrustBadges = () => {
    const badges = [
        {
            icon: ShieldCheck,
            title: "Authentic Jewelry",
            desc: "100% Genuine Craftsmanship"
        },
        {
            icon: Truck,
            title: "Free Shipping",
            desc: "On orders over ₹999"
        },
        {
            icon: RotateCcw,
            title: "Easy Returns",
            desc: "7 Day Return Policy"
        },
        {
            icon: Gem,
            title: "Premium Quality",
            desc: "Handcrafted with Care"
        }
    ];

    return (
        <section className="py-10 bg-secondary/10 border-y">
            <div className="container px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {badges.map((badge, idx) => (
                        <div key={idx} className="flex flex-col items-center text-center space-y-2">
                            <div className="h-12 w-12 rounded-full bg-background flex items-center justify-center shadow-sm text-primary">
                                <badge.icon className="h-6 w-6" />
                            </div>
                            <h3 className="font-semibold">{badge.title}</h3>
                            <p className="text-xs text-muted-foreground">{badge.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TrustBadges;
