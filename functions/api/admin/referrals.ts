interface Env {
    DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
    try {
        // Query to get all referrals with details
        // We join with customers twice: once for referrer, once for referee (if we had referee_id, but we store referee_phone)
        // Actually, we store referrer_id (UUID) and referee_phone (String).

        const results = await env.DB.prepare(`
            SELECT 
                r.id,
                r.created_at,
                r.status,
                r.reward_points,
                r.order_id,
                referrer.name as referrer_name,
                referrer.phone as referrer_phone,
                r.referee_phone
            FROM referrals r
            LEFT JOIN customers referrer ON r.referrer_id = referrer.id
            ORDER BY r.created_at DESC
        `).all();

        // Also get some stats
        const stats: any = await env.DB.prepare(`
            SELECT 
                COUNT(*) as total_referrals,
                SUM(reward_points) as total_points_distributed,
                COUNT(DISTINCT referrer_id) as active_referrers
            FROM referrals
        `).first();

        return new Response(JSON.stringify({
            referrals: results.results,
            stats: stats
        }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};
