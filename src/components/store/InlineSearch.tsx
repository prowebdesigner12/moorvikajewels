import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

// Local Search Component - Replaces Algolia to prevent "Unreachable hosts" error
const InlineSearch = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const { t } = useLanguage();

    // Local State
    const [query, setQuery] = useState("");
    const [products, setProducts] = useState<any[]>([]);
    const [results, setResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch Products Locally
    useEffect(() => {
        fetch('/api/products')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setProducts(data);
                }
            })
            .catch(err => console.error("Search failed to load products", err))
            .finally(() => setIsLoading(false));
    }, []);

    // Filter Products
    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        const lowerQuery = query.toLowerCase();
        const filtered = products.filter(p =>
            p.name.toLowerCase().includes(lowerQuery) ||
            (p.description && p.description.toLowerCase().includes(lowerQuery)) ||
            (p.category && p.category.toLowerCase().includes(lowerQuery))
        ).slice(0, 5); // Limit references

        setResults(filtered);
    }, [query, products]);

    // Handle outside click to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleChange = (val: string) => {
        setQuery(val);
        setIsOpen(!!val);
    };

    const handleFocus = () => {
        if (query) setIsOpen(true);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && query.trim()) {
            setIsOpen(false);
            navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
        }
    };

    return (
        <div ref={containerRef} className="relative w-full z-[100]">
            <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    value={query}
                    onChange={e => handleChange(e.target.value)}
                    onFocus={handleFocus}
                    onKeyDown={handleKeyDown}
                    placeholder={t('search_placeholder')}
                    className="pl-10 pr-10 h-10 w-full"
                />
                {query && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                        onClick={() => {
                            setQuery("");
                            setIsOpen(false);
                            setResults([]);
                        }}
                    >
                        <X className="h-4 w-4 text-muted-foreground" />
                    </Button>
                )}
            </div>

            {/* Results Dropdown */}
            {isOpen && query && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-2xl z-[100] max-h-[60vh] overflow-y-auto w-full min-w-[300px]">
                    <div className="p-2">
                        {isLoading ? (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                                <span className="animate-pulse">Loading products...</span>
                            </div>
                        ) : results.length > 0 ? (
                            results.map((hit: any) => (
                                <Link
                                    key={hit.id}
                                    to={`/product/${hit.id}`}
                                    className="flex items-center gap-4 p-2 hover:bg-muted/50 rounded-lg transition-colors"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <div className="h-12 w-12 rounded border overflow-hidden flex-shrink-0 bg-white">
                                        <img src={hit.images?.[0] || hit.image} alt={hit.name} className="h-full w-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-sm truncate text-foreground">
                                            {hit.name}
                                        </h4>
                                        <p className="text-xs text-muted-foreground capitalize">
                                            {hit.category}
                                        </p>
                                    </div>
                                    <div className="font-bold text-sm text-foreground">
                                        ₹{hit.price}
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="p-4 text-center space-y-2">
                                <p className="text-sm font-medium">No results found.</p>
                                <p className="text-xs text-muted-foreground">Try a different search term.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default InlineSearch;
