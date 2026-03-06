import { ArrowRight, Gem, Crown, Sparkles, Heart } from 'lucide-react';

const categories = [
    { name: 'Necklaces', icon: Gem, count: '6 Items' },
    { name: 'Jewelry Sets', icon: Crown, count: '26 Items' },
    { name: 'Earrings', icon: Sparkles, count: '2 Items' },
    { name: 'All Jewelry', icon: Heart, count: '34 Items' },
];

const FeaturedCategories = ({ onSelectCategory }: { onSelectCategory: (category: string) => void }) => {
    return (
        <section className="py-12 bg-secondary/30">
            <div className="container px-4">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Shop by Category</h2>
                        <p className="text-muted-foreground mt-1">Browse our curated jewelry collections</p>
                    </div>
                    <button className="text-primary font-medium hover:underline flex items-center gap-1 hidden sm:flex">
                        View All <ArrowRight className="h-4 w-4" />
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {categories.map((category) => (
                        <button
                            key={category.name}
                            onClick={() => onSelectCategory(category.name === 'All Jewelry' ? 'All' : category.name)}
                            className="group flex flex-col items-center p-6 bg-background rounded-xl border hover:border-primary/50 hover:shadow-lg transition-all duration-300"
                        >
                            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <category.icon className="h-6 w-6" />
                            </div>
                            <h3 className="font-semibold">{category.name}</h3>
                            <p className="text-xs text-muted-foreground mt-1">{category.count}</p>
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturedCategories;
