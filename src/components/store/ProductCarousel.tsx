import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCallback } from 'react';
import ProductCard from './ProductCard';
import { Product } from '@/types/product';

interface ProductCarouselProps {
    title?: string;
    products: Product[];
    onQuickView?: (product: Product) => void;
}

const ProductCarousel = ({ title, products = [], onQuickView }: ProductCarouselProps) => {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: false,
        align: 'start',
        skipSnaps: false,
        dragFree: true
    }, [Autoplay({ delay: 6000, stopOnInteraction: true })]);

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    return (
        <section className="py-6">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    {title && <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">{title}</h2>}
                    <div className="flex gap-2 ml-auto">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={scrollPrev}
                            className="rounded-full hover:bg-black hover:text-white transition-all duration-300 shadow-sm border-gray-200"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={scrollNext}
                            className="rounded-full hover:bg-black hover:text-white transition-all duration-300 shadow-sm border-gray-200"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="overflow-hidden" ref={emblaRef}>
                    <div className="flex gap-6">
                        {products.map((product) => (
                            <div key={product.id} className="flex-[0_0_85%] sm:flex-[0_0_45%] md:flex-[0_0_30%] lg:flex-[0_0_22%] min-w-0">
                                <ProductCard
                                    product={product}
                                    onQuickView={onQuickView}
                                    className="h-full"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProductCarousel;
