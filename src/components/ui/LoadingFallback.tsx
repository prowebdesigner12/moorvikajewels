import { Loader2 } from "lucide-react";

export const LoadingFallback = () => {
    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-background gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground animate-pulse">Loading TopStore...</p>
        </div>
    );
};
