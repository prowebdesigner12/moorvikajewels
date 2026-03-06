import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface CurrencyContextType {
    currency: string;
    symbol: string;
    rate: number;
    setCurrency: (currency: string) => void;
    convertPrice: (price: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const currencySymbols: Record<string, string> = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£'
};

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
    const [currency, setCurrencyState] = useState('INR');
    const [rates, setRates] = useState<Record<string, number>>({ INR: 1, USD: 0.012, EUR: 0.011, GBP: 0.0095 });

    useEffect(() => {
        // Load saved currency from localStorage
        const saved = localStorage.getItem('currency');
        if (saved && currencySymbols[saved]) {
            setCurrencyState(saved);
        }

        // Fetch live exchange rates (cached for 1 hour)
        const lastFetch = localStorage.getItem('rates_timestamp');
        const now = Date.now();

        if (!lastFetch || now - parseInt(lastFetch) > 3600000) {
            fetchRates();
        } else {
            const savedRates = localStorage.getItem('exchange_rates');
            if (savedRates) {
                setRates(JSON.parse(savedRates));
            }
        }
    }, []);

    const fetchRates = async () => {
        try {
            const res = await fetch('https://api.exchangerate-api.com/v4/latest/INR');
            if (res.ok) {
                const data = await res.json();
                const newRates = {
                    INR: 1,
                    USD: data.rates.USD,
                    EUR: data.rates.EUR,
                    GBP: data.rates.GBP
                };
                setRates(newRates);
                localStorage.setItem('exchange_rates', JSON.stringify(newRates));
                localStorage.setItem('rates_timestamp', Date.now().toString());
            }
        } catch (error) {
            console.error('Failed to fetch exchange rates:', error);
        }
    };

    const setCurrency = (newCurrency: string) => {
        setCurrencyState(newCurrency);
        localStorage.setItem('currency', newCurrency);
    };

    const convertPrice = (price: number): string => {
        const converted = price * rates[currency];
        return `${currencySymbols[currency]}${converted.toFixed(2)}`;
    };

    return (
        <CurrencyContext.Provider value={{
            currency,
            symbol: currencySymbols[currency],
            rate: rates[currency],
            setCurrency,
            convertPrice
        }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error('useCurrency must be used within CurrencyProvider');
    }
    return context;
};
