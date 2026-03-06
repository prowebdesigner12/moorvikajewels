interface Env {
    DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
    try {
        const url = new URL(request.url);
        const phone = url.searchParams.get("phone");

        if (!phone) return new Response(JSON.stringify({ error: "Phone required" }), { status: 400 });

        const subs = await env.DB.prepare(`
            SELECT s.*, p.name as product_name, p.images as product_images
            FROM subscriptions s
            JOIN products p ON s.product_id = p.id
            WHERE s.customer_phone = ?
            ORDER BY s.created_at DESC
        `).bind(phone).all();

        const results = subs.results.map((s: any) => ({
            ...s,
            product_image: JSON.parse(s.product_images || '[]')[0] || null
        }));

        return new Response(JSON.stringify(results), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
    try {
        const { phone, productId, variantId, frequency } = await request.json() as any;

        const id = crypto.randomUUID();
        const now = new Date();
        const nextBilling = new Date();

        if (frequency === 'weekly') nextBilling.setDate(now.getDate() + 7);
        else if (frequency === 'monthly') nextBilling.setMonth(now.getMonth() + 1);
        else if (frequency === 'quarterly') nextBilling.setMonth(now.getMonth() + 3);

        await env.DB.prepare(`
            INSERT INTO subscriptions (id, customer_phone, product_id, variant_id, frequency, next_billing_date)
            VALUES (?, ?, ?, ?, ?, ?)
        `).bind(id, phone, productId, variantId || null, frequency, nextBilling.toISOString()).run();

        return new Response(JSON.stringify({ success: true, id }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};

export const onRequestPatch: PagesFunction<Env> = async ({ request, env }) => {
    try {
        const { id, status } = await request.json() as any;
        await env.DB.prepare("UPDATE subscriptions SET status = ? WHERE id = ?").bind(status, id).run();
        return new Response(JSON.stringify({ success: true }));
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};
