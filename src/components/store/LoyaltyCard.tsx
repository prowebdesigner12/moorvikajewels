import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Gift, Star, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface LoyaltyCardProps {
    userId: string;
}

export function LoyaltyCard({ userId }: LoyaltyCardProps) {
    const [loyaltyData, setLoyaltyData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLoyalty = async () => {
            try {
                const res = await fetch(`/api/loyalty?userId=${userId}`);
                if (res.ok) {
                    const data = await res.json();
                    setLoyaltyData(data);
                }
            } catch (error) {
                console.error("Failed to fetch loyalty data", error);
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchLoyalty();
        }
    }, [userId]);

    if (loading) {
        return (
            <Card className="bg-gradient-to-br from-purple-500 to-blue-600 text-white">
                <CardContent className="p-6">
                    <div className="animate-pulse">Loading...</div>
                </CardContent>
            </Card>
        );
    }

    if (!loyaltyData) return null;

    const { totalPoints, tier } = loyaltyData;
    const tierColors = {
        Silver: "from-gray-400 to-gray-600",
        Gold: "from-rose-400 to-pink-600",
        Platinum: "from-purple-500 to-blue-600"
    };

    const tierIcons = {
        Silver: Star,
        Gold: Crown,
        Platinum: Gift
    };

    const TierIcon = tierIcons[tier.tier_name as keyof typeof tierIcons] || Star;
    const gradientClass = tierColors[tier.tier_name as keyof typeof tierColors] || tierColors.Silver;

    // Calculate progress to next tier
    const nextTierThreshold = tier.tier_name === 'Silver' ? 501 : tier.tier_name === 'Gold' ? 2001 : null;
    const progress = nextTierThreshold ? Math.min((totalPoints / nextTierThreshold) * 100, 100) : 100;

    return (
        <Card className={`bg-gradient-to-br ${gradientClass} text-white border-none shadow-xl`}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                        <TierIcon className="h-6 w-6" />
                        {tier.tier_name} Member
                    </CardTitle>
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                        {tier.discount_percent}% OFF
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-5xl font-bold">{totalPoints}</span>
                        <span className="text-lg opacity-80">points</span>
                    </div>
                    <p className="text-sm opacity-90">Earn 10 points for every ₹100 spent</p>
                </div>

                {nextTierThreshold && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Progress to {tier.tier_name === 'Silver' ? 'Gold' : 'Platinum'}</span>
                            <span>{totalPoints} / {nextTierThreshold}</span>
                        </div>
                        <Progress value={progress} className="h-2 bg-white/20" />
                    </div>
                )}

                <div className="pt-4 border-t border-white/20">
                    <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Your Benefits:
                    </p>
                    <p className="text-xs opacity-90">{tier.benefits}</p>
                </div>
            </CardContent>
        </Card>
    );
}
