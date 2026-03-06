import { Suspense, lazy, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { InquiryProvider } from "@/context/InquiryContext";
import { AuthProvider } from "@/context/AuthContext";
import { NewsletterPopup } from "@/components/store/NewsletterPopup"; // Keep static if needed or lazy
import { ComparisonProvider } from "@/context/ComparisonContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/context/LanguageContext";
import { LoadingFallback } from "@/components/ui/LoadingFallback";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import SalesPopup from "@/components/store/SalesPopup";
import ChatBot from "@/components/store/ChatBot";
import { trackPageView } from '@/utils/meta-pixel';

// Track PageView on route changes
const PageViewTracker = () => {
  const location = useLocation();

  useEffect(() => {
    trackPageView();
  }, [location]);

  return null;
};

// Lazy Load Pages
const Index = lazy(() => import("./pages/Index"));
const Shop = lazy(() => import("./pages/Shop"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const PublicCollections = lazy(() => import("./pages/Collections"));
const CollectionDetails = lazy(() => import("./pages/CollectionDetails"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminLogin = lazy(() => import("./pages/admin/Login"));
const Profile = lazy(() => import("./pages/Profile"));
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const Products = lazy(() => import("./pages/admin/Products"));
const ProductEditor = lazy(() => import("./pages/admin/ProductEditor"));
const AdminOrders = lazy(() => import("./pages/admin/Orders"));
const Customers = lazy(() => import("./pages/admin/Customers"));
const Reviews = lazy(() => import("./pages/admin/Reviews"));
const Inventory = lazy(() => import("./pages/admin/Inventory"));
const Collections = lazy(() => import("./pages/admin/Collections"));
const CollectionEditor = lazy(() => import("./pages/admin/CollectionEditor"));
const Discounts = lazy(() => import("./pages/admin/Discounts"));
const DiscountEditor = lazy(() => import("./pages/admin/DiscountEditor"));
const Inquiries = lazy(() => import("./pages/admin/Inquiries"));
const Settings = lazy(() => import("./pages/admin/Settings"));
const AbandonedCarts = lazy(() => import("./pages/admin/AbandonedCarts"));
const WhatsAppLogs = lazy(() => import("./pages/admin/WhatsAppLogs"));
const Invoice = lazy(() => import("./pages/admin/Invoice"));
const Bundles = lazy(() => import("./pages/admin/Bundles"));
const BundleEditor = lazy(() => import("./pages/admin/BundleEditor"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Returns = lazy(() => import("./pages/Returns"));
const Shipping = lazy(() => import("./pages/Shipping"));
const Blog = lazy(() => import("./pages/Blog"));
const TrackOrder = lazy(() => import("./pages/TrackOrder"));
const Orders = lazy(() => import("./pages/Orders"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const SizeGuide = lazy(() => import("./pages/SizeGuide"));
const ReferralPage = lazy(() => import("./pages/Referral"));
const AdminReferrals = lazy(() => import("./pages/admin/Referrals"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <LanguageProvider>
        <AuthProvider>
          <CurrencyProvider>
            <CartProvider>
              <WishlistProvider>
                <ComparisonProvider>
                  <InquiryProvider>
                    <TooltipProvider>
                      <Toaster />
                      {/* <NewsletterPopup /> */}
                      <Sonner position="top-right" />
                      <BrowserRouter>
                        <PageViewTracker />
                        <Suspense fallback={<LoadingFallback />}>
                          <Routes>
                            <Route path="/" element={<Index />} />
                            <Route path="/shop" element={<Shop />} />
                            <Route path="/collections" element={<PublicCollections />} />
                            <Route path="/collections/:id" element={<CollectionDetails />} />
                            <Route path="/product/:id" element={<ProductDetails />} />
                            <Route path="/product/slug/:slug" element={<ProductDetails />} />
                            <Route path="/about" element={<About />} />
                            <Route path="/contact" element={<Contact />} />
                            <Route path="/faq" element={<FAQ />} />
                            <Route path="/referral" element={<ReferralPage />} />
                            <Route path="/checkout" element={<Checkout />} />
                            <Route path="/login" element={<Navigate to="/" replace />} />
                            <Route path="/signup" element={<Navigate to="/" replace />} />

                            <Route path="/admin/login" element={<AdminLogin />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/order-success" element={<OrderSuccess />} />

                            <Route path="/blog" element={<Blog />} />
                            <Route path="/track-order" element={<TrackOrder />} />
                            <Route path="/orders" element={<Orders />} />
                            <Route path="/wishlist" element={<Wishlist />} />
                            <Route path="/size-guide" element={<SizeGuide />} />

                            <Route path="/privacy" element={<Privacy />} />
                            <Route path="/terms" element={<Terms />} />
                            <Route path="/returns" element={<Returns />} />
                            <Route path="/shipping" element={<Shipping />} />

                            <Route
                              path="/admin"
                              element={
                                <ProtectedRoute requireAdmin={true}>
                                  <AdminLayout />
                                </ProtectedRoute>
                              }
                            >
                              <Route index element={<Dashboard />} />
                              <Route path="products" element={<Products />} />
                              <Route path="products/new" element={<ProductEditor />} />
                              <Route path="products/edit/:id" element={<ProductEditor />} />
                              <Route path="orders" element={<AdminOrders />} />
                              <Route path="customers" element={<Customers />} />
                              <Route path="reviews" element={<Reviews />} />
                              <Route path="inquiries" element={<Inquiries />} />
                              <Route path="inventory" element={<Inventory />} />
                              <Route path="collections" element={<Collections />} />
                              <Route path="collections/new" element={<CollectionEditor />} />
                              <Route path="collections/edit/:id" element={<CollectionEditor />} />
                              <Route path="discounts" element={<Discounts />} />
                              <Route path="discounts/new" element={<DiscountEditor />} />
                              <Route path="discounts/edit/:id" element={<DiscountEditor />} />
                              <Route path="bundles" element={<Bundles />} />
                              <Route path="bundles/new" element={<BundleEditor />} />
                              <Route path="bundles/edit/:id" element={<BundleEditor />} />
                              <Route path="settings" element={<Settings />} />
                              <Route path="abandoned" element={<AbandonedCarts />} />
                              <Route path="whatsapp-logs" element={<WhatsAppLogs />} />
                              <Route path="referrals" element={<AdminReferrals />} />
                            </Route>

                            <Route path="/invoice/:id" element={<Invoice />} />


                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </Suspense>
                        {/* <SalesPopup /> */}
                        {/* <NewsletterPopup /> commented out per user request */}
                        <ChatBot />
                      </BrowserRouter>
                    </TooltipProvider>
                  </InquiryProvider>
                </ComparisonProvider>
              </WishlistProvider>
            </CartProvider>
          </CurrencyProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
