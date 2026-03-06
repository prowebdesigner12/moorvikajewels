interface Env {
    DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
    try {
        const admins = await env.DB.prepare("SELECT * FROM users WHERE role = 'admin' ORDER BY created_at DESC").all();
        return new Response(JSON.stringify(admins.results), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
    try {
        const { name, phone, email, password } = await request.json() as any;
        if (!name || !phone || !password) return new Response(JSON.stringify({ error: "Name, Phone and Password are required" }), { status: 400 });

        const id = crypto.randomUUID();
        const now = new Date().toISOString();

        // Check if phone exists
        const existing = await env.DB.prepare("SELECT * FROM users WHERE phone = ?").bind(phone).first();
        if (existing) {
            return new Response(JSON.stringify({ error: "Admin with this phone already exists" }), { status: 400 });
        }

        await env.DB.prepare(
            "INSERT INTO users (id, name, phone, email, password, role, status, created_at) VALUES (?, ?, ?, ?, ?, 'admin', 'approved', ?)"
        ).bind(id, name, phone, email || null, password, now).run();

        return new Response(JSON.stringify({ success: true, id }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}

export const onRequestDelete: PagesFunction<Env> = async ({ request, env }) => {
    try {
        const url = new URL(request.url);
        const id = url.searchParams.get("id");
        if (!id) return new Response("Missing id", { status: 400 });

        await env.DB.prepare("DELETE FROM users WHERE id = ? AND role = 'admin'").bind(id).run();

        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
