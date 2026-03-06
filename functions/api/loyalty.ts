interface Env {
    DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
    try {
        const url = new URL(request.url);
        const userId = url.searchParams.get('userId');

        if (!userId) {
            return new Response(JSON.stringify({ error: "User ID required" }), { status: 400 });
        }

        // Get total points
        const pointsResult: any = await env.DB.prepare(`
            SELECT SUM(CASE WHEN transaction_type = 'earned' THEN points ELSE -points END) as total_points
            FROM loyalty_points
            WHERE user_id = ?
        `).bind(userId).first();

        const totalPoints = pointsResult?.total_points || 0;

        // Get current tier
        const tier: any = await env.DB.prepare(`
            SELECT tier_name, discount_percent, benefits
            FROM loyalty_tiers
            WHERE min_points <= ? AND (max_points IS NULL OR max_points >= ?)
            ORDER BY min_points DESC
            LIMIT 1
        `).bind(totalPoints, totalPoints).first();

        // Get recent transactions
        const transactions: any = await env.DB.prepare(`
            SELECT * FROM loyalty_points
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT 10
        `).bind(userId).all();

        return new Response(JSON.stringify({
            totalPoints,
            tier: tier || { tier_name: 'Silver', discount_percent: 5 },
            transactions: transactions.results
        }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
    try {
        const { userId, points, type, orderId, description } = await request.json() as {
            userId: string;
            points: number;
            type: 'earned' | 'redeemed';
            orderId?: string;
            description?: string;
        };

        if (!userId || !points || !type) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
        }

        // Add points transaction
        await env.DB.prepare(`
            INSERT INTO loyalty_points (user_id, points, transaction_type, order_id, description)
            VALUES (?, ?, ?, ?, ?)
        `).bind(userId, points, type, orderId || null, description || null).run();

        return new Response(JSON.stringify({ success: true, message: `${points} points ${type}` }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};
