import { useState, useEffect } from "react";
import { algoliasearch } from "algoliasearch";
import {
    InstantSearch,
    SearchBox,
    Hits,
    Highlight,
    Configure,
    useSearchBox
} from "react-instantsearch";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

// Initialize Algolia Client
const searchClient = algoliasearch("149SUVKCWZ", "962efcba5952af2958070690e4f79995");

const CustomSearchBox = (props: any) => {
    const { query, refine } = useSearchBox(props);
    return (
        <div className="relative w-full">
            <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
                value={query}
                onChange={e => refine(e.target.value)}
                placeholder="Search products..."
                className="pl-9 h-10 w-full"
                autoFocus
            />
        </div>
    );
};

const ProductHit = ({ hit }: { hit: any }) => {
    return (
        <Link to={`/product/${hit.objectID}`} className="flex items-center gap-4 p-2 hover:bg-muted/50 rounded-lg transition-colors">
            <div className="h-12 w-12 rounded border overflow-hidden flex-shrink-0 bg-white">
                <img src={hit.image} alt={hit.name} className="h-full w-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">
                    <Highlight attribute="name" hit={hit} />
                </h4>
                <p className="text-xs text-muted-foreground capitalize">
                    {hit.category}
                </p>
            </div>
            <div className="font-bold text-sm">
                ₹{hit.price}
            </div>
        </Link>
    );
};

const AlgoliaSearch = ({ isOpen, onOpenChange }: { isOpen: boolean; onOpenChange: (open: boolean) => void }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl p-0 gap-0 overflow-hidden top-[20%] translate-y-0">
                <InstantSearch searchClient={searchClient} indexName="products" future={{ preserveSharedStateOnUnmount: true }}>
                    <div className="p-4 border-b">
                        <CustomSearchBox />
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto p-2">
                        <Hits hitComponent={ProductHit} />
                    </div>
                </InstantSearch>
            </DialogContent>
        </Dialog>
    );
};

export default AlgoliaSearch;
