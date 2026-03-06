import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Timer } from 'lucide-react';

const FlashSale = () => {
    const calculateTimeLeft = () => {
        const targetDate = new Date();
        targetDate.setHours(24, 0, 0, 0);
        const difference = +targetDate - +new Date();

        if (difference > 0) {
            return {
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }
        return { hours: 0, minutes: 0, seconds: 0 };
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearTimeout(timer);
    });

    return (
        <section className="py-16 bg-gradient-to-r from-rose-700 to-pink-600 text-white relative overflow-hidden">
            <div className="container px-4 relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-4 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
                            <Timer className="h-4 w-4" />
                            <span>Ending Soon</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Bridal Season Sale</h2>
                        <p className="text-lg opacity-90 max-w-md">
                            Grab up to 40% off on selected bridal & festive jewelry sets. Handcrafted Kundan & Polki pieces at unbeatable prices!
                        </p>
                        <div className="flex gap-4 justify-center md:justify-start pt-2">
                            {Object.entries(timeLeft).map(([unit, value]) => (
                                <div key={unit} className="flex flex-col items-center bg-white/10 rounded-lg p-3 min-w-[70px] backdrop-blur-sm">
                                    <span className="text-2xl font-bold">{value.toString().padStart(2, '0')}</span>
                                    <span className="text-xs uppercase opacity-75">{unit}</span>
                                </div>
                            ))}
                        </div>
                        <Button size="lg" variant="secondary" className="mt-6 font-bold">
                            Shop The Sale
                        </Button>
                    </div>

                    {/* Featured Product Image */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full" />
                        <img
                            src="https://cdn.shopify.com/s/files/1/0868/8930/0325/files/5_c65264f0-3db8-4e6d-a9f2-dc274b37c759.jpg?v=1767951908"
                            alt="Bridal Jewelry Sale"
                            className="relative w-80 md:w-96 rounded-2xl hover:scale-105 transition-transform duration-500 drop-shadow-2xl"
                        />
                        <div className="absolute top-0 right-0 bg-rose-500 text-white font-bold p-4 rounded-full shadow-lg animate-bounce">
                            -40%
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FlashSale;
