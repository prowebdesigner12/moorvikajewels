import { Button } from "@/components/ui/button";
import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";
import { Users, Target, Shield, Truck } from "lucide-react";

const About = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header onCartClick={() => { }} onSearch={() => { }} />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="py-20 bg-secondary/30">
                    <div className="container px-4 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Story</h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Founded in 2025, ShopHub began with a simple mission: to make premium quality products accessible to everyone.
                        </p>
                    </div>
                </section>

                {/* Mission & Vision */}
                <section className="py-20">
                    <div className="container px-4">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="space-y-6">
                                <div className="inline-block p-3 rounded-lg bg-primary/10 text-primary">
                                    <Target className="h-6 w-6" />
                                </div>
                                <h2 className="text-3xl font-bold">Our Mission</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    We believe that style shouldn't come at a premium. Our mission is to democratize access to high-end fashion and technology, ensuring that our customers always access the latest trends without breaking the bank.
                                </p>
                            </div>
                            <div className="h-[300px] bg-muted rounded-2xl overflow-hidden">
                                <img
                                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80"
                                    alt="Team working"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="py-20 bg-secondary/10">
                    <div className="container px-4">
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="bg-background p-8 rounded-xl border text-center space-y-4">
                                <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-full flex items-center justify-center">
                                    <Shield className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-semibold">Quality Guarantee</h3>
                                <p className="text-muted-foreground">Every product is verified for authenticity and quality before shipping.</p>
                            </div>
                            <div className="bg-background p-8 rounded-xl border text-center space-y-4">
                                <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-full flex items-center justify-center">
                                    <Truck className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-semibold">Fast Delivery</h3>
                                <p className="text-muted-foreground">We partner with top logistics providers to ensure timely delivery.</p>
                            </div>
                            <div className="bg-background p-8 rounded-xl border text-center space-y-4">
                                <div className="mx-auto w-12 h-12 bg-purple-100 dark:bg-purple-900/20 text-purple-600 rounded-full flex items-center justify-center">
                                    <Users className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-semibold">24/7 Support</h3>
                                <p className="text-muted-foreground">Our customer success team is always here to help you.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default About;
