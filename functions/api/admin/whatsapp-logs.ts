interface Env {
    DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
    try {
        const logs = await env.DB.prepare(`
            SELECT id, customer_phone, message_type, status, created_at
            FROM whatsapp_logs
            ORDER BY created_at DESC
        `).all();

        return new Response(JSON.stringify(logs.results || []), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
