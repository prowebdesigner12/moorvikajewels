import { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import SEO from '@/components/store/SEO';
import { Product } from '@/types/product';
import Header from '@/components/store/Header';
import HeroBanner from '@/components/store/HeroBanner';
import FeaturedCategories from '@/components/store/FeaturedCategories';
import PromotionalBanner from '@/components/store/PromotionalBanner';

import Testimonials from '@/components/store/Testimonials';
import TrustBadges from '@/components/store/TrustBadges';
import BrandStrip from '@/components/store/BrandStrip';
import FlashSale from '@/components/store/FlashSale';
import CategoryFilter from '@/components/store/CategoryFilter';
import ProductGrid from '@/components/store/ProductGrid';
import ProductCarousel from '@/components/store/ProductCarousel';
import ProductModal from '@/components/store/ProductModal';
import CartDrawer from '@/components/store/CartDrawer';
import Footer from '@/components/store/Footer';
import { RevealOnScroll } from '@/components/ui/RevealOnScroll';

const Index = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setProducts(data.filter((p: any) => p && (p.status === 'active' || !p.status)));
          } else {
            console.error("Invalid products data:", data);
            setProducts([]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch products", error);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      try {
        const viewedIds = JSON.parse(localStorage.getItem('topstore_viewed') || '[]');
        if (Array.isArray(viewedIds)) {
          const viewedProducts = viewedIds
            .map((id: string) => products.find(p => p.id === id))
            .filter(Boolean) as Product[];
          setRecentlyViewed(viewedProducts.slice(0, 4));
        }
      } catch (e) {
        console.warn("Failed to parse recently viewed items", e);
        // Reset if corrupted
        localStorage.setItem('topstore_viewed', '[]');
      }
    }
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesSearch = (product.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (product.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery, products]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <SEO
        title="Moorvika Jewels | Exquisite Handcrafted Indian Jewelry"
        description="Shop premium handcrafted Kundan, Polki & Bridal jewelry. Elegant mangalsutras, choker sets & earrings for every occasion."
        url="https://shop.prasantbagriya.online"
        schema={{
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Moorvika Jewels",
          "url": "https://shop.prasantbagriya.online",
          "logo": "https://shop.prasantbagriya.online/logo.png",
          "sameAs": [
            "https://facebook.com/moorvikajewels",
            "https://instagram.com/moorvikajewels"
          ],
          "description": "Exquisite handcrafted Indian jewelry for weddings, festivals & special occasions."
        }}
      />

      <Header
        onCartClick={() => setIsCartOpen(true)}
        onSearch={setSearchQuery}
      />

      <HeroBanner />

      <TrustBadges />

      <RevealOnScroll width="100%" direction="up">
        <FlashSale />
      </RevealOnScroll>

      <RevealOnScroll width="100%" direction="up" delay={0.2}>
        <FeaturedCategories onSelectCategory={setSelectedCategory} />
      </RevealOnScroll>

      <main className="min-h-screen bg-background pb-12">
        {/* New Arrivals Section */}
        <RevealOnScroll width="100%" direction="up">
          <div className="bg-secondary/20 -mt-12 pt-16 pb-8">
            <ProductCarousel
              title={t('new_arrivals')}
              products={products.slice(0, 8)}
              onQuickView={setSelectedProduct}
            />
          </div>
        </RevealOnScroll>

        {/* Best Sellers */}
        <RevealOnScroll width="100%" direction="up">
          <ProductCarousel
            title={t('best_sellers')}
            products={products.sort((a, b) => b.reviews - a.reviews).slice(0, 8)}
            onQuickView={setSelectedProduct}
          />
        </RevealOnScroll>

        {/* Main Trending Grid */}
        <div className="container px-4 py-8">
          <RevealOnScroll width="100%" direction="up">
            <div className="text-center mb-10">
              <span className="text-primary font-medium tracking-wider uppercase text-sm">{t('curated_for_you')}</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 font-playfair">{t('trending_products')}</h2>
              <div className="w-20 h-1 bg-primary mx-auto mt-4 rounded-full" />
            </div>
          </RevealOnScroll>

          <RevealOnScroll width="100%" direction="up" delay={0.2}>
            <CategoryFilter
              categories={['All', ...Array.from(new Set(products.map(p => p.category)))]}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </RevealOnScroll>

          <RevealOnScroll width="100%" direction="up" delay={0.3}>
            <ProductGrid
              products={filteredProducts}
              onQuickView={setSelectedProduct}
            />
          </RevealOnScroll>
        </div>
      </main>

      <RevealOnScroll width="100%" direction="up">
        <PromotionalBanner />
      </RevealOnScroll>

      <RevealOnScroll width="100%" direction="up">
        <BrandStrip />
      </RevealOnScroll>

      <RevealOnScroll width="100%" direction="up">
        <Testimonials />
      </RevealOnScroll>



      <Footer />

      <ProductModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </div>
  );
};

export default Index;
