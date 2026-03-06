/**
 * Meta Pixel (Facebook Pixel) Utility
 * 
 * This utility provides a wrapper for the `fbq` function to track standard
 * and custom events for Meta Pixel.
 */

declare global {
    interface Window {
        fbq: any;
        _fbq: any;
    }
}

// Pixel ID can be stored in environment variables if available
const PIXEL_ID = '1522385098990855';

/**
 * Initialize Meta Pixel
 * (Typically handled in index.html, but this can be used for dynamic initialization)
 */
export const initPixel = () => {
    if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('init', PIXEL_ID);
    }
};

/**
 * Track a standard Meta Pixel event
 * @param eventName Name of the standard event (e.g., 'PageView', 'AddToCart')
 * @param options Additional data to send with the event
 */
export const trackEvent = (eventName: string, options?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.fbq) {
        if (options) {
            window.fbq('track', eventName, options);
        } else {
            window.fbq('track', eventName);
        }
    } else {
        console.debug(`[Meta Pixel] Event tracked: ${eventName}`, options);
    }
};

/**
 * Standard Events Helpers
 */

export const trackPageView = () => trackEvent('PageView');

export const trackViewContent = (data: {
    content_ids: string[];
    content_name: string;
    content_type: 'product' | 'product_group';
    value?: number;
    currency?: string;
}) => trackEvent('ViewContent', data);

export const trackAddToCart = (data: {
    content_ids: string[];
    content_name: string;
    content_type: 'product';
    value: number;
    currency: string;
}) => trackEvent('AddToCart', data);

export const trackInitiateCheckout = (data: {
    content_ids: string[];
    num_items: number;
    value: number;
    currency: string;
}) => trackEvent('InitiateCheckout', data);

export const trackPurchase = (data: {
    content_ids: string[];
    content_type: 'product';
    value: number;
    currency: string;
    num_items: number;
    order_id?: string;
}) => trackEvent('Purchase', data);

export const trackSearch = (search_string: string) =>
    trackEvent('Search', { search_string });

export const trackContact = () => trackEvent('Contact');
