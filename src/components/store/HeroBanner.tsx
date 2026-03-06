import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCallback } from 'react';

const slides = [
  {
    id: 1,
    title: "Timeless Elegance, Crafted for You",
    subtitle: "Bridal Collection 2025",
    description: "Discover exquisite handcrafted Kundan & Polki jewelry for your most cherished moments.",
    image: "https://cdn.shopify.com/s/files/1/0868/8930/0325/files/5_473acb27-2691-4efa-b11c-90510008a0f8.jpg?v=1767951964",
    color: "bg-rose-500/10"
  },
  {
    id: 2,
    title: "Royal Choker Collections",
    subtitle: "Handcrafted Artistry",
    description: "Statement choker sets adorned with uncut stones and premium Kundan work for a regal look.",
    image: "https://cdn.shopify.com/s/files/1/0868/8930/0325/files/1_a43b6961-a7bc-4107-995a-3a62ff5c98c8.jpg?v=1770197014",
    color: "bg-pink-500/10"
  },
  {
    id: 3,
    title: "Mangalsutra Collection",
    subtitle: "Tradition Meets Modern",
    description: "Beautiful gold-plated mangalsutras with premium stones. Lightweight, skin-friendly & elegant.",
    image: "https://cdn.shopify.com/s/files/1/0868/8930/0325/files/ChatGPTImageFeb16_2026_11_07_14AM.png?v=1771242190",
    color: "bg-fuchsia-500/10"
  },
  {
    id: 4,
    title: "Statement Earrings",
    subtitle: "Chandbali & Jhumkas",
    description: "Exquisite dangler earrings with pearl drops & intricate gold detailing for festive occasions.",
    image: "https://cdn.shopify.com/s/files/1/0868/8930/0325/files/1_f1f3b3d6-7e52-4580-9dc3-4f7d30d06768.jpg?v=1767951588",
    color: "bg-rose-400/10"
  },
  {
    id: 5,
    title: "Emerald Polki Collection",
    subtitle: "New Arrivals",
    description: "Regal Polki chokers with emerald-green bead drops & antique gold detailing.",
    image: "https://cdn.shopify.com/s/files/1/0868/8930/0325/files/17.jpg?v=1770114803",
    color: "bg-emerald-500/10"
  }
];

const HeroBanner = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000, stopOnInteraction: false })]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <div className="relative overflow-hidden group">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide) => (
            <div key={slide.id} className={`flex-[0_0_100%] min-w-0 relative py-12 md:py-20 bg-gradient-to-br from-background via-background to-secondary/20`}>
              <div className="container px-4">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-6 animate-in slide-in-from-left duration-700 fade-in">
                    <span className="inline-block px-4 py-1.5 bg-secondary text-foreground text-sm font-medium rounded-full tracking-wider uppercase">
                      {slide.subtitle}
                    </span>
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {slide.title}
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-md" style={{ fontFamily: "'Inter', sans-serif" }}>
                      {slide.description}
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <Button size="lg" className="gap-2 rounded-full px-8 text-base">
                        Shop Now <ArrowRight className="h-4 w-4" />
                      </Button>
                      <Button size="lg" variant="outline" className="rounded-full px-8 text-base">
                        View Collections
                      </Button>
                    </div>
                  </div>

                  <div className="relative animate-in slide-in-from-right duration-700 fade-in delay-200">
                    <div className="aspect-square max-w-md mx-auto relative rounded-3xl overflow-hidden shadow-2xl">
                      <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent z-10" />
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="w-full h-full object-cover transform transition-transform duration-700 hover:scale-105"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-background/50 hover:bg-background backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={scrollPrev}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-background/50 hover:bg-background backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={scrollNext}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default HeroBanner;
