interface Env {
    DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
    try {
        const { results } = await env.DB.prepare("SELECT * FROM collections ORDER BY id DESC").all();
        const collections = results.map((c: any) => ({
            ...c,
            products: JSON.parse(c.products || '[]')
        }));

        return new Response(JSON.stringify(collections), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
    try {
        const collection = await request.json() as any;
        const id = crypto.randomUUID();

        await env.DB.prepare(`
            INSERT INTO collections (id, title, description, image, slug, type, products)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(
            id,
            collection.title,
            collection.description,
            collection.image,
            collection.slug,
            collection.type || 'manual',
            JSON.stringify(collection.products || [])
        ).run();

        return new Response(JSON.stringify({ success: true, id }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};

export const onRequestPut: PagesFunction<Env> = async ({ request, env }) => {
    try {
        const url = new URL(request.url);
        const id = url.searchParams.get("id");
        if (!id) throw new Error("ID required for update");

        const collection = await request.json() as any;

        await env.DB.prepare(`
            UPDATE collections 
            SET title=?, description=?, image=?, slug=?, type=?, products=?
            WHERE id=?
        `).bind(
            collection.title,
            collection.description,
            collection.image,
            collection.slug,
            collection.type,
            JSON.stringify(collection.products || []),
            id
        ).run();

        return new Response(JSON.stringify({ success: true, id }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};

export const onRequestDelete: PagesFunction<Env> = async ({ request, env }) => {
    try {
        const url = new URL(request.url);
        const id = url.searchParams.get("id");

        if (!id) throw new Error("ID required");

        await env.DB.prepare("DELETE FROM collections WHERE id = ?").bind(id).run();

        return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};
