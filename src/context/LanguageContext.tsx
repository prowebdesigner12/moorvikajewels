import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Language = 'en' | 'hi';

interface Translations {
    [key: string]: {
        [key in Language]: string;
    };
}

const translations: Translations = {
    'home': { en: 'Home', hi: 'होम' },
    'shop': { en: 'Shop', hi: 'शॉप' },
    'about': { en: 'About', hi: 'हमारे बारे में' },
    'contact': { en: 'Contact', hi: 'संपर्क' },
    'add_to_cart': { en: 'Add to Cart', hi: 'कार्ट में जोड़ें' },
    'subscribe_and_save': { en: 'Subscribe & Save', hi: 'सब्सक्राइब और बचाएं' },
    'one_time_purchase': { en: 'One-time purchase', hi: 'एक बार की खरीदारी' },
    'search_placeholder': { en: 'Search products...', hi: 'उत्पाद खोजें...' },
    'my_wishlist': { en: 'My Wishlist', hi: 'मेरी विशलिस्ट' },
    'my_orders': { en: 'My Orders', hi: 'मेरे ऑर्डर्स' },
    'my_profile': { en: 'My Profile', hi: 'मेरी प्रोफाइल' },
    'logout': { en: 'Log out', hi: 'लॉग आउट' },
    'refer_and_earn': { en: 'Refer & Earn', hi: 'रेफर करें और कमाएं' },
    'flash_sale': { en: 'FLASH SALE!', hi: 'फ्लैश सेल!' },
    'quantity': { en: 'Quantity', hi: 'मात्रा' },
    'new_arrivals': { en: 'New Arrivals', hi: 'नया आगमन' },
    'best_sellers': { en: 'Best Sellers', hi: 'सर्वाधिक बिकने वाले' },
    'curated_for_you': { en: 'Curated For You', hi: 'आपके लिए चयनित' },
    'trending_products': { en: 'Trending Products', hi: 'ट्रेंडिंग उत्पाद' },
    'my_account': { en: 'My Account', hi: 'मेरा खाता' },
    'profile_details': { en: 'Profile Details', hi: 'प्रोफ़ाइल विवरण' },
    'orders': { en: 'Orders', hi: 'ऑर्डर' },
    'addresses': { en: 'Addresses', hi: 'पते' },
    'my_subscriptions': { en: 'My Subscriptions', hi: 'मेरी सदस्यता' },
    'refer_and_earn_long': { en: 'Refer & Earn Rewards', hi: 'रेफर करें और पुरस्कार कमाएं' },
    'points': { en: 'Points', hi: 'पॉइंट्स' },
    'recent_orders': { en: 'Recent Orders', hi: 'हाल के ऑर्डर' },
    'view_all_orders': { en: 'View All Orders', hi: 'सभी ऑर्डर देखें' },
    'notification_preferences': { en: 'Notification Preferences', hi: 'सूचना प्राथमिकताएं' },
    'email_alerts': { en: 'Email Alerts', hi: 'ईमेल अलर्ट' },
    'sms_updates': { en: 'SMS Mobile Updates', hi: 'SMS मोबाइल अपडेट' },
    'active_subscriptions': { en: 'Active Subscriptions', hi: 'सक्रिय सदस्यता' },
    'cancel_plan': { en: 'Cancel Plan', hi: 'प्लान रद्द करें' },
    'refer_get_rewarded': { en: 'Refer & Get Rewarded', hi: 'रेफर करें और इनाम पाएं' },
    'invite_friends': { en: 'Invite your friends to shop and earn points!', hi: 'अपने दोस्तों को खरीदारी के लिए आमंत्रित करें और पॉइंट्स कमाएं!' },
    'your_code': { en: 'Your Unique Code', hi: 'आपका यूनिक कोड' },
    'share_link': { en: 'Share Link', hi: 'लिंक साझा करें' },
    'friends_shop': { en: 'Friends Shop', hi: 'दोस्त खरीदारी करते हैं' },
    'earn_points': { en: 'Earn Points', hi: 'पॉइंट्स कमाएं' },
    'copy_success': { en: 'Code copied to clipboard!', hi: 'कोड क्लिपबोर्ड पर कॉपी हो गया!' },
    'loading_orders': { en: 'Loading your orders...', hi: 'आपके ऑर्डर लोड हो रहे हैं...' },
    'no_orders': { en: 'No orders found yet.', hi: 'अभी तक कोई ऑर्डर नहीं मिला।' },
    'start_shopping': { en: 'Start Shopping', hi: 'खरीदारी शुरू करें' },
    'seo_title': { en: 'ShopHub - Premium E-Commerce Store', hi: 'शॉपहब - प्रीमियम ई-कॉमर्स स्टोर' },
    'seo_description': { en: 'Discover the best products at unbeatable prices.', hi: 'अपराजेय कीमतों पर सर्वोत्तम उत्पाद खोजें।' }
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguageState] = useState<Language>('en');

    useEffect(() => {
        const savedLang = localStorage.getItem('language') as Language;
        if (savedLang && (savedLang === 'en' || savedLang === 'hi')) {
            setLanguageState(savedLang);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('language', lang);
    };

    const t = (key: string) => {
        return translations[key]?.[language] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) throw new Error('useLanguage must be used within LanguageProvider');
    return context;
};
