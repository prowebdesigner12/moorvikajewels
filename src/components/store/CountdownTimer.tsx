import { useEffect, useState } from "react";

interface CountdownTimerProps {
    endTime: string | Date;
    onExpire?: () => void;
}

export function CountdownTimer({ endTime, onExpire }: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const end = new Date(endTime).getTime();
            const now = new Date().getTime();
            const difference = end - now;

            if (difference <= 0) {
                setIsExpired(true);
                if (onExpire) onExpire();
                return { hours: 0, minutes: 0, seconds: 0 };
            }

            return {
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
            };
        };

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [endTime, onExpire]);

    if (isExpired) return null;

    return (
        <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1.5 rounded-lg border border-red-200">
            <span className="text-xs font-bold uppercase tracking-wide">Sale Ends In:</span>
            <div className="flex items-center gap-1 font-mono font-bold">
                <span className="bg-red-600 text-white px-2 py-0.5 rounded text-sm min-w-[28px] text-center">
                    {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span>:</span>
                <span className="bg-red-600 text-white px-2 py-0.5 rounded text-sm min-w-[28px] text-center">
                    {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span>:</span>
                <span className="bg-red-600 text-white px-2 py-0.5 rounded text-sm min-w-[28px] text-center">
                    {String(timeLeft.seconds).padStart(2, '0')}
                </span>
            </div>
        </div>
    );
}
