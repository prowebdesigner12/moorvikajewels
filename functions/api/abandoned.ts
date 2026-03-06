interface Env {
    DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
    try {
        const data: any = await request.json();
        const { id, name, email, phone, items, totalAmount } = data;

        // Check if exists
        let existing: any = null;
        if (id) {
            existing = await env.DB.prepare("SELECT * FROM abandoned_checkouts WHERE id = ?").bind(id).first();
        } else if (email || phone) {
            // Try to find by email/phone created within last 24 hours to update it instead of creating new
            existing = await env.DB.prepare(`
                SELECT * FROM abandoned_checkouts 
                WHERE (customer_email = ? OR customer_phone = ?) 
                AND created_at > datetime('now', '-1 day')
                AND status != 'recovered'
            `).bind(email || '', phone || '').first();
        }

        const now = new Date().toISOString();

        if (existing) {
            await env.DB.prepare(`
                UPDATE abandoned_checkouts 
                SET customer_name = COALESCE(?, customer_name),
                    customer_email = COALESCE(?, customer_email),
                    customer_phone = COALESCE(?, customer_phone),
                    items = ?,
                    total_amount = ?,
                    updated_at = ?
                WHERE id = ?
            `).bind(name, email, phone, JSON.stringify(items), totalAmount, now, existing.id).run();
            return new Response(JSON.stringify({ success: true, id: existing.id }));
        } else {
            const newId = crypto.randomUUID();
            await env.DB.prepare(`
                INSERT INTO abandoned_checkouts (id, customer_name, customer_email, customer_phone, items, total_amount, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(newId, name, email, phone, JSON.stringify(items), totalAmount, now, now).run();
            return new Response(JSON.stringify({ success: true, id: newId }));
        }
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
    try {
        const url = new URL(request.url);
        const admin = url.searchParams.get("admin");

        if (admin !== 'true') return new Response("Unauthorized", { status: 401 });

        const results = await env.DB.prepare("SELECT * FROM abandoned_checkouts ORDER BY updated_at DESC LIMIT 50").all();
        return new Response(JSON.stringify(results.results), { headers: { "Content-Type": "application/json" } });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};
