interface Env {
    DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
    try {
        const url = new URL(request.url);
        const bundleId = url.searchParams.get("id");

        if (bundleId) {
            // Fetch single bundle with items
            const bundle: any = await env.DB.prepare("SELECT * FROM bundles WHERE id = ?").bind(bundleId).first();
            if (!bundle) return new Response(JSON.stringify({ error: "Bundle not found" }), { status: 404 });

            const items = await env.DB.prepare(`
                SELECT bi.quantity, p.* 
                FROM bundle_items bi
                JOIN products p ON bi.product_id = p.id
                WHERE bi.bundle_id = ?
            `).bind(bundleId).all();

            return new Response(JSON.stringify({ ...bundle, items: items.results }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        // Fetch all active bundles
        const bundles = await env.DB.prepare("SELECT * FROM bundles WHERE status = 'active' ORDER BY created_at DESC").all();

        // Populate items for each bundle (Simplified for listing)
        // In a real app, we might want to do this in one query with JSON_GROUP_ARRAY or similar if supported
        const bundlesWithItems = await Promise.all(bundles.results.map(async (bundle: any) => {
            const items = await env.DB.prepare("SELECT product_id, quantity FROM bundle_items WHERE bundle_id = ?")
                .bind(bundle.id)
                .all();
            return { ...bundle, items: items.results };
        }));

        return new Response(JSON.stringify(bundlesWithItems), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
    try {
        const data = await request.json() as any;
        const { id, name, description, price, originalPrice, discountLabel, items, image, type } = data;

        const bundleId = id || crypto.randomUUID();

        // 1. Save Bundle
        await env.DB.prepare(`
            INSERT INTO bundles (id, name, description, price, original_price, discount_label, image, type, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')
            ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            description = excluded.description,
            price = excluded.price,
            original_price = excluded.original_price,
            discount_label = excluded.discount_label,
            image = excluded.image,
            type = excluded.type
        `).bind(bundleId, name, description, price, originalPrice, discountLabel, image, type || 'fixed_combo').run();

        // 2. Clear existing items and re-insert
        await env.DB.prepare("DELETE FROM bundle_items WHERE bundle_id = ?").bind(bundleId).run();

        const stmt = env.DB.prepare("INSERT INTO bundle_items (bundle_id, product_id, variant_id, quantity) VALUES (?, ?, ?, ?)");
        for (const item of items) {
            await stmt.bind(bundleId, item.productId, item.variantId || null, item.quantity || 1).run();
        }

        return new Response(JSON.stringify({ success: true, bundleId }), {
            headers: { "Content-Type": "application/json" }
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

        await env.DB.prepare("DELETE FROM bundles WHERE id = ?").bind(id).run();
        await env.DB.prepare("DELETE FROM bundle_items WHERE bundle_id = ?").bind(id).run();

        return new Response(JSON.stringify({ success: true }));
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};
