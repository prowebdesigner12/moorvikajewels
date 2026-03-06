interface Env {
    RAZORPAY_KEY_ID: string;
    RAZORPAY_SECRET: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
    try {
        const { amount, currency = "INR" } = await request.json() as any;

        // Use environment variables
        const keyId = env.RAZORPAY_KEY_ID;
        const secret = env.RAZORPAY_SECRET;

        const auth = btoa(`${keyId}:${secret}`);

        if (!amount || amount <= 0) {
            return new Response(JSON.stringify({ error: "Invalid amount" }), { status: 400 });
        }

        const res = await fetch("https://api.razorpay.com/v1/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Basic ${auth}`
            },
            body: JSON.stringify({
                amount: Math.round(amount * 100), // convert to paise
                currency: currency,
                receipt: `receipt_${crypto.randomUUID().split('-')[0]}`
            })
        });

        if (!res.ok) {
            const err = await res.text();
            console.error("Razorpay Order API Error:", err);
            return new Response(JSON.stringify({ error: "Failed to create Razorpay order" }), { status: 500 });
        }

        const data = await res.json();
        return new Response(JSON.stringify(data), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
};
