import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useInquiries } from '@/context/InquiryContext'; // Import Context
import { useCart } from '@/context/CartContext'; // Import Cart
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { toast } from 'sonner';

// Initialize Gemini API (Fallback for production)
// Initialize Gemini API (Fallback for production)
const API_KEY = "AIzaSyCET7b5jpD_wl95pl7hvMLlfRfXYTiVKdI";
const genAI = new GoogleGenerativeAI(API_KEY);

interface Message {
    id: string;
    role: 'user' | 'bot';
    text: string;
}

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [activeProduct, setActiveProduct] = useState<any>(null);

    // Lead Gen State
    const { addInquiry } = useInquiries();
    const [isLeadCaptured, setIsLeadCaptured] = useState(() => {
        return localStorage.getItem('chat_lead_captured') === 'true';
    });
    const [leadForm, setLeadForm] = useState({ name: '', mobile: '' });
    const [showLeadFormModal, setShowLeadFormModal] = useState(false); // New Modal State

    const saveLeadData = (name: string, mobile: string) => {
        addInquiry({
            name,
            mobile,
            initialQuery: activeProduct ? `Viewing ${activeProduct.name}` : 'Chat Conversation'
        });
        localStorage.setItem('chat_lead_captured', 'true');
        localStorage.setItem('chat_lead_name', name);
        localStorage.setItem('chat_lead_mobile', mobile);
        setIsLeadCaptured(true);
        setLeadForm({ name, mobile });
    };

    const handleLeadSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!leadForm.name || !leadForm.mobile) return;

        saveLeadData(leadForm.name, leadForm.mobile);
        setShowLeadFormModal(false);

        // Notify Bot
        const userMessage = {
            id: Date.now().toString(),
            role: 'user' as const,
            text: `My details are: Name: ${leadForm.name}, Mobile: ${leadForm.mobile}. Please proceed.`
        };
        // We don't add this to UI, just send to background or trigger next bot action
        // For simplicity, we just add a bot confirmation
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'bot',
            text: `Thanks ${leadForm.name}! I've saved your details. How can I help you now?`
        }]);
    };

    // Cart Context for Behavioral Suggestions
    const { totalItems } = useCart();

    // State to track topics user has already asked about
    const [recentTopics, setRecentTopics] = useState<Set<string>>(new Set());

    // Context-aware suggestions
    const defaultSuggestions = ["Track my order", "Return policy", "Best sellers"];
    const [suggestions, setSuggestions] = useState<string[]>(defaultSuggestions);

    // State for AI-provided suggestions
    const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

    // Detect Context & Update Suggestions
    useEffect(() => {
        let newSuggestions: string[] = [];
        const path = location.pathname;

        // 1. Page Level Context
        if (path.includes('/product/')) {
            newSuggestions.push("Is this available?", "Is COD available?", "Delivery time?");
        } else if (path.includes('/cart')) {
            newSuggestions.push("Payment options", "Discount codes");
        } else {
            newSuggestions.push("Track my order", "Return policy", "Is COD available?");
        }

        // 2. Behavioral Context (Cart)
        if (totalItems > 0 && !path.includes('/cart')) {
            newSuggestions.unshift("Checkout now");
        }

        // 3. Learning (Remove recently asked) & AI Overrides
        // We prioritize AI suggestions if they exist and are fresh (last turn)
        let filteredSuggestions: string[] = [];

        if (aiSuggestions.length > 0) {
            // If AI provided explicit suggestions, use them primarily
            filteredSuggestions = [...aiSuggestions];
        } else {
            // Fallback to Context + Logic
            filteredSuggestions = newSuggestions; // .filter(s => !recentTopics.has(s)); // Keeping disabled as requested

            // 4. CONVERSATIONAL FLOW (Fallback Logic)
            // Look for the LAST USER MESSAGE (not just the absolute last message)
            const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');

            if (lastUserMsg) {
                const text = lastUserMsg.text.toLowerCase();
                const followUps: string[] = [];

                if (text.includes('price') || text.includes('cost') || text.includes('expensive')) {
                    followUps.push("Any discounts?", "EMI options available?");
                }
                else if (text.includes('delivery') || text.includes('shipping') || text.includes('reach')) {
                    followUps.push("track order", "Is COD available?");
                }
                else if (text.includes('cod') || text.includes('cash') || text.includes('pay')) {
                    followUps.push("Return policy", "How to return?");
                }
                else if (text.includes('return') || text.includes('refund') || text.includes('exchange')) {
                    followUps.push("Customer Support", "Warranty details");
                }
                else if (text.includes('stock') || text.includes('available')) {
                    followUps.push("Delivery time?", "Buy now");
                }

                if (followUps.length > 0) {
                    filteredSuggestions.unshift(...followUps);
                }
            }
        }

        // 5. Add 'Connect with Agent' at the BOTTOM (Always last)
        // Ensure regular defaults are present if AI list is short? 
        // No, clutter is bad. Just ensure "Connect" is there.
        if (!filteredSuggestions.includes("Connect with Agent")) {
            filteredSuggestions.push("Connect with Agent");
        }

        setSuggestions(Array.from(new Set(filteredSuggestions)));

        // ... (Existing Product Logic for Greeting) ...
        if (path.includes('/product/')) {
            const productId = path.split('/').pop();
            const productData = apiProducts.length > 0 ? apiProducts : [];
            const foundProduct = productData.find((p: any) => p.id.toString() === productId);
            if (foundProduct) {
                setActiveProduct(foundProduct);
                if (messages.length === 0) {
                    setMessages([{
                        id: '1',
                        role: 'bot',
                        text: `Hi! I see you're looking at the ${foundProduct.name}. How can I help you decide?`
                    }]);
                }
                return;
            }
        } else {
            setActiveProduct(null);
            if (messages.length === 0) {
                setMessages([{ id: '1', role: 'bot', text: 'Hi! I am your AI Shopping Assistant. How can I help you today?' }]);
            }
        }
    }, [location.pathname, totalItems, recentTopics, messages]); // Added 'messages' dependency

    // Fetch Products from API
    const [apiProducts, setApiProducts] = useState<any[]>([]);

    useEffect(() => {
        fetch('/api/products')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setApiProducts(data);
                }
            })
            .catch(err => console.error("ChatBot failed to load products", err));
    }, []);

    // ... scroll effect ...

    const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
        e?.preventDefault();

        // INTERCEPT "Connect with Agent"
        if (customText === "Connect with Agent") {
            setShowLeadFormModal(true);
            return;
        }

        const textToSend = customText || input;

        if (!textToSend.trim() || isLoading) return;

        // Add to recent topics if it matches a suggestion
        if (customText) {
            setRecentTopics(prev => new Set(prev).add(customText));
        }

        const userMessage = { id: Date.now().toString(), role: 'user' as const, text: textToSend };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Prepare context with product data
            // Use API products if available, fallback to empty array (not mock data to avoid confusion)
            const productData = apiProducts;

            const productContext = productData.slice(0, 50).map((p: any) => // Limit to top 50 to avoid token limits
                `- ${p.name} (${p.category}): ₹${p.price}. ${p.description || ''}`
            ).join('\n');

            // Current User Info
            const currentName = localStorage.getItem('chat_lead_name') || leadForm.name || "Unknown";
            const currentMobile = localStorage.getItem('chat_lead_mobile') || leadForm.mobile || "Unknown";
            const hasDetails = isLeadCaptured || (currentName !== "Unknown" && currentMobile !== "Unknown");

            let systemPrompt = `
                You are TopStore AI Assistant.
                User: ${currentName} (${currentMobile}).
                Details Captured: ${hasDetails ? "YES" : "NO"}.
                
                Product Info:
                ${productContext}             

                Instructions:
                1. Answer general questions.
                2. If the user asks for Call Back/Support and details not captured, output exactly: [SHOW_LEAD_FORM]
                3. End responses with logic for suggestions: [SUGGESTIONS: ["Question 1", "Question 2"]]
            `;

            // Add Specific Context if on a product page
            if (activeProduct) {
                systemPrompt += `
                CRITICAL CONTEXT: User is viewing "${activeProduct.name}" (₹${activeProduct.price}).
                `;
            }

            let text = "";
            const isLocal = window.location.hostname === 'localhost';

            // 1. Try Local Moltbot if on localhost
            if (isLocal) {
                try {
                    const response = await fetch('/v1/chat/completions', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            model: "google/gemini-3-flash-preview",
                            messages: [
                                { role: "system", content: systemPrompt },
                                ...messages.map(m => ({ role: m.role === 'bot' ? 'assistant' : 'user', content: m.text })),
                                { role: "user", content: textToSend }
                            ],
                            stream: false
                        })
                    });
                    if (response.ok) {
                        const data = await response.json();
                        text = data.choices?.[0]?.message?.content;
                    }
                } catch (e) {
                    console.warn("Local API unreachable, using SDK", e);
                }
            }

            // 2. Production: Call our new stable Cloudflare Backend Proxy
            if (!text) {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        messages,
                        textToSend,
                        systemPrompt: `${systemPrompt}\n(Context: User viewing ${activeProduct ? activeProduct.name : 'All Products'})`
                    })
                });

                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.error || "Backend connection error");
                }

                const data = await response.json();
                text = data.text;
            }

            // --- SMART LOGIC PROCESSING ---

            // 1. Check for [SHOW_LEAD_FORM]
            if (text.includes('[SHOW_LEAD_FORM]')) {
                setShowLeadFormModal(true);
                text = text.replace('[SHOW_LEAD_FORM]', '').trim() || "Sure! I need your contact details to proceed. Please fill the form below.";
            }

            // 2. Check for [CAPTURE_LEAD: ...]
            const captureRegex = /\[CAPTURE_LEAD:\s*({.*?})\]/s;
            const match = text.match(captureRegex);
            if (match && match[1]) {
                try {
                    const capturedData = JSON.parse(match[1]);
                    if (capturedData.name && capturedData.mobile) {
                        saveLeadData(capturedData.name, capturedData.mobile);
                        text = text.replace(match[0], '').trim(); // Remove the token
                        toast.success("Details saved successfully!");
                    }
                } catch (e) {
                    console.error("Failed to parse capture lead json", e);
                }
            }

            // 3. Process Suggestions token
            const suggestRegex = /\[SUGGESTIONS:\s*(\[.*?\])\]/s;
            const sMatch = text.match(suggestRegex);
            if (sMatch && sMatch[1]) {
                try {
                    setAiSuggestions(JSON.parse(sMatch[1]));
                    text = text.replace(sMatch[0], '').trim();
                } catch (e) { }
            }

            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'bot', text }]);
        } catch (error: any) {
            console.error("Chat Error:", error);
            const errorMessage = error.message || String(error);
            setMessages(prev => [...prev, { id: 'error', role: 'bot', text: `Sorry, I'm having trouble connecting. (Error: ${errorMessage}). Please check your internet or try again later.` }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Floating Action Button */}
            <Button
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl z-50 bg-primary hover:bg-primary/90 transition-transform active:scale-95"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
            </Button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 w-[90vw] md:w-[400px] h-[500px] bg-background border rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
                    {/* Header */}
                    <div className="bg-primary p-4 flex items-center gap-3 text-primary-foreground">
                        <div className="bg-white/20 p-2 rounded-full">
                            <Bot className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm leading-none flex items-center gap-2">
                                TopStore Assistant
                                <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">v1.3.5 FINAL</span>
                            </h3>
                            <p className="text-[10px] opacity-80 mt-1">
                                {activeProduct ? `Viewing: ${activeProduct.name}` : 'Multi-Protocol AI | Active'}
                            </p>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <ScrollArea className="flex-1 p-4 bg-secondary/50">
                        <div className="space-y-4">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex items-start gap-2 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-white border shadow-sm text-primary'
                                        }`}>
                                        {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                    </div>
                                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${message.role === 'user'
                                        ? 'bg-primary text-primary-foreground rounded-tr-none'
                                        : 'bg-background border shadow-sm rounded-tl-none dark:bg-card dark:text-gray-100'
                                        }`}>
                                        {message.text}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex items-start gap-2">
                                    <div className="w-8 h-8 rounded-full bg-white border shadow-sm text-primary flex items-center justify-center">
                                        <Bot className="h-4 w-4" />
                                    </div>
                                    <div className="bg-background border shadow-sm rounded-2xl rounded-tl-none px-4 py-3">
                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                    </div>
                                </div>
                            )}
                            <div ref={scrollRef} />
                        </div>
                    </ScrollArea>

                    {/* Inline Lead Form Modal Overlay */}
                    {showLeadFormModal && (
                        <div className="absolute inset-x-4 bottom-20 p-4 bg-background border shadow-lg rounded-xl z-10 animate-in fade-in slide-in-from-bottom-2">
                            <h4 className="font-semibold mb-2 text-sm">Please provide details to proceed</h4>
                            <form onSubmit={handleLeadSubmit} className="space-y-3">
                                <Input
                                    placeholder="Your Name"
                                    value={leadForm.name}
                                    onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                                    className="h-8 text-sm"
                                    required
                                />
                                <Input
                                    placeholder="Mobile Number"
                                    value={leadForm.mobile}
                                    onChange={(e) => setLeadForm({ ...leadForm, mobile: e.target.value })}
                                    className="h-8 text-sm"
                                    required
                                    type="tel"
                                />
                                <div className="flex gap-2">
                                    <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => setShowLeadFormModal(false)}>Cancel</Button>
                                    <Button type="submit" size="sm" className="flex-1">Submit</Button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Suggestions Chips - Conditional Layout */}
                    {/* Vertical for initial state, Horizontal for ongoing chat */}
                    {!showLeadFormModal && (
                        <div className={`px-4 py-2 bg-background/50 border-t flex gap-2 transition-all duration-300 ${messages.length <= 1
                            ? "flex-col items-end max-h-[200px] overflow-y-auto custom-scrollbar"
                            : "flex-row overflow-x-auto no-scrollbar items-center"
                            }`}>
                            {suggestions.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSendMessage(undefined, s)}
                                    disabled={isLoading}
                                    className={`text-xs border px-3 py-1.5 rounded-xl transition-all shadow-sm active:scale-95 
                                        bg-white text-primary border-primary/20 hover:bg-primary hover:text-white
                                        dark:bg-slate-800 dark:text-gray-100 dark:border-slate-700 dark:hover:bg-slate-700
                                        ${messages.length <= 1 ? "w-fit" : "flex-shrink-0"
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="p-4 bg-background">
                        <form onSubmit={(e) => handleSendMessage(e)} className="flex gap-2">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={activeProduct ? `Ask about ${activeProduct.name}...` : "Ask about products..."}
                                className="flex-1 rounded-full bg-secondary/50 focus:bg-background transition-colors"
                                disabled={isLoading}
                            />
                            <Button type="submit" size="icon" className="rounded-full" disabled={isLoading || !input.trim()}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatBot;
