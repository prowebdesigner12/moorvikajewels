const BrandStrip = () => {
    const highlights = [
        "Handcrafted Artistry", "Premium Kundan", "Polki Collection", "Bridal Sets", "Gold Plated", "Skin Friendly", "COD Available", "Free Shipping"
    ];

    return (
        <section className="py-8 bg-background border-b">
            <div className="container px-4 overflow-hidden">
                <p className="text-center text-sm font-medium text-muted-foreground mb-6 uppercase tracking-widest">Trusted by 10,000+ Happy Brides</p>
                <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60">
                    {highlights.map((highlight, i) => (
                        <span key={i} className="text-lg md:text-xl font-semibold hover:opacity-100 hover:text-primary hover:scale-105 transition-all cursor-pointer" style={{ fontFamily: "'Playfair Display', serif" }}>
                            {highlight}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default BrandStrip;
