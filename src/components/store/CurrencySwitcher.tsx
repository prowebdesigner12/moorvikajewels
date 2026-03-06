import { Globe } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useCurrency } from "@/context/CurrencyContext";

export function CurrencySwitcher() {
    const { currency, setCurrency } = useCurrency();

    return (
        <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="w-[100px] h-9 gap-2">
                <Globe className="h-4 w-4" />
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="INR">INR ₹</SelectItem>
                <SelectItem value="USD">USD $</SelectItem>
                <SelectItem value="EUR">EUR €</SelectItem>
                <SelectItem value="GBP">GBP £</SelectItem>
            </SelectContent>
        </Select>
    );
}
