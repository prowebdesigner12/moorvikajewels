import { Button } from "@/components/ui/button";

const PromotionalBanner = () => {
    return (
        <section className="py-20 bg-primary text-primary-foreground relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 pattern-dots-md" />
            <div className="container px-4 text-center relative z-10">
                <h2 className="text-3xl md:text-5xl font-bold mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>Festive Season Collection</h2>
                <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-90">
                    Get up to 40% off on premium Kundan & Polki bridal jewelry. Limited edition handcrafted pieces for your special day.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" variant="secondary" className="px-8 font-semibold text-lg">
                        Bridal Collection
                    </Button>
                    <Button size="lg" variant="secondary" className="px-8 font-semibold text-lg">
                        Festive Collection
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default PromotionalBanner;
