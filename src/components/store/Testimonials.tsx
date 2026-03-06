import { Star, User, Quote } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const testimonials = [
    {
        name: "Priya Sharma",
        role: "Verified Buyer",
        content: "The Kundan choker set I purchased was absolutely stunning! The craftsmanship is incredible and it looked perfect on my wedding day. Highly recommended!",
        rating: 5,
        location: "Mumbai"
    },
    {
        name: "Anita Gupta",
        role: "Regular Customer",
        content: "I've ordered multiple jewelry sets from Moorvika Jewels. Every piece is beautifully designed and the quality is outstanding. The packaging is also very premium.",
        rating: 5,
        location: "Delhi"
    },
    {
        name: "Meera Patel",
        role: "Bridal Collection Buyer",
        content: "Bought the Polki choker set for my sister's wedding. Everyone was amazed by how beautiful it looked. Great value for the price!",
        rating: 5,
        location: "Ahmedabad"
    },
    {
        name: "Sneha Reddy",
        role: "Verified Buyer",
        content: "The antique gold finish is exactly what I was looking for. Updates on delivery were timely, and the jewelry arrived safely. Will definitely shop again.",
        rating: 5,
        location: "Hyderabad"
    },
    {
        name: "Kavita Singhania",
        role: "Luxury Enthusiast",
        content: "Moorvika Jewels never disappoints. The Ruby Sunburst Mangalsutra is even more beautiful in person. Love the attention to detail.",
        rating: 4,
        location: "Jaipur"
    },
    {
        name: "Roshni Verma",
        role: "Verified Buyer",
        content: "Excellent customer service and prompt delivery. The earrings are lightweight yet look heavy and royal. Perfect for festive wear.",
        rating: 5,
        location: "Bangalore"
    },
    {
        name: "Divya Malhotra",
        role: "Reviewer",
        content: "A hidden gem for traditional jewelry! The designs are unique and the prices are very competitive compared to physical stores.",
        rating: 5,
        location: "Chandigarh"
    }
];

const TestimonialCard = ({ t }: { t: typeof testimonials[0] }) => (
    <div className="w-[350px] shrink-0 bg-background/50 backdrop-blur-sm p-6 rounded-2xl border border-primary/10 hover:border-primary/30 transition-all duration-300 shadow-sm mx-4">
        <div className="flex gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    className={cn(
                        "h-4 w-4",
                        i < t.rating ? "fill-primary text-primary" : "fill-muted text-muted-foreground/20"
                    )}
                />
            ))}
        </div>

        <div className="relative mb-6">
            <Quote className="absolute -top-2 -left-2 h-8 w-8 text-primary/10 rotate-180" />
            <p className="text-muted-foreground leading-relaxed italic pl-4 relative z-10">"{t.content}"</p>
        </div>

        <div className="flex items-center gap-4 mt-auto">
            <div className="h-10 w-10 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center border border-primary/10">
                <span className="font-playfair font-bold text-primary">{t.name.charAt(0)}</span>
            </div>
            <div>
                <p className="font-semibold text-sm font-playfair">{t.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{t.role}</span>
                    <span>•</span>
                    <span>{t.location}</span>
                </div>
            </div>
        </div>
    </div>
);

const Testimonials = () => {
    return (
        <section className="py-20 bg-secondary/10 overflow-hidden">
            <div className="container px-4 mb-12">
                <div className="text-center max-w-2xl mx-auto">
                    <span className="text-primary font-medium tracking-wider uppercase text-sm">Testimonials</span>
                    <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4 font-playfair">What Our Customers Say</h2>
                    <div className="w-20 h-1 bg-primary mx-auto rounded-full" />
                </div>
            </div>

            {/* Marquee Container */}
            <div className="relative w-full overflow-hidden">
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-secondary/10 to-transparent z-10" />
                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-secondary/10 to-transparent z-10" />

                <div className="flex animate-scroll hover:pause" style={{ width: "max-content" }}>
                    {/* First Loop */}
                    {testimonials.map((t, i) => (
                        <TestimonialCard key={`original-${i}`} t={t} />
                    ))}
                    {/* Second Loop for Seamless Effect */}
                    {testimonials.map((t, i) => (
                        <TestimonialCard key={`duplicate-${i}`} t={t} />
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-scroll {
                    animation: scroll 40s linear infinite;
                }
                .hover\\:pause:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </section>
    );
};

export default Testimonials;
