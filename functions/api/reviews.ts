interface Env {
    DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
    try {
        const url = new URL(request.url);
        const productId = url.searchParams.get("productId");
        const adminMode = url.searchParams.get("admin") === "true";

        // Admin: Get All Reviews with Product Names and Verification
        if (adminMode) {
            const reviews = await env.DB.prepare(`
                SELECT 
                    r.*, 
                    p.name as product_name,
                    EXISTS (
                        SELECT 1 FROM order_items oi
                        JOIN orders o ON o.id = oi.order_id
                        WHERE o.customer_email = r.customer_email 
                        AND oi.product_id = r.product_id
                    ) as is_verified
                FROM reviews r
                LEFT JOIN products p ON r.product_id = p.id
                ORDER BY r.created_at DESC
            `).all();
            return new Response(JSON.stringify(reviews.results), {
                headers: { "Content-Type": "application/json" },
            });
        }

        if (!productId) {
            return new Response(JSON.stringify({ error: "Product ID required" }), { status: 400 });
        }

        // Fetch Approved Reviews
        const reviews = await env.DB.prepare(`
            SELECT *, 
            EXISTS (
                SELECT 1 FROM order_items oi
                JOIN orders o ON o.id = oi.order_id
                WHERE o.customer_email = reviews.customer_email 
                AND oi.product_id = reviews.product_id
            ) as is_verified
            FROM reviews 
            WHERE product_id = ? AND status = 'approved' 
            ORDER BY created_at DESC
        `).bind(productId).all();

        return new Response(JSON.stringify(reviews.results), {
            headers: { "Content-Type": "application/json" },
        });

    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
    try {
        const data = await request.json() as any;
        const { productId, customerName, customerEmail, rating, comment } = data;

        if (!productId || !rating || !customerName) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
        }

        const id = crypto.randomUUID();
        const createdAt = new Date().toISOString();
        const status = 'approved';

        await env.DB.prepare(`
            INSERT INTO reviews (id, product_id, customer_name, customer_email, rating, comment, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            id,
            productId,
            customerName,
            customerEmail || null, // Store email if provided
            rating,
            comment,
            status,
            createdAt
        ).run();

        // Update Stats
        const allReviews = await env.DB.prepare("SELECT rating FROM reviews WHERE product_id = ?").bind(productId).all();
        const ratings = allReviews.results.map((r: any) => r.rating) as number[];
        const count = ratings.length;
        const avg = count > 0 ? ratings.reduce((a, b) => a + b, 0) / count : 0;

        await env.DB.prepare("UPDATE products SET rating = ?, reviews = ? WHERE id = ?")
            .bind(avg, count, productId).run();


        return new Response(JSON.stringify({ success: true, id }), {
            headers: { "Content-Type": "application/json" },
        });

    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};

export const onRequestPut: PagesFunction<Env> = async ({ request, env }) => {
    try {
        const data = await request.json() as any;
        const { id, status } = data;

        if (!id || !status) return new Response(JSON.stringify({ error: "ID and Status required" }), { status: 400 });

        await env.DB.prepare("UPDATE reviews SET status = ? WHERE id = ?").bind(status, id).run();

        return new Response(JSON.stringify({ success: true }), {
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

        if (!id) return new Response(JSON.stringify({ error: "ID required" }), { status: 400 });

        // Get product ID before deleting to update stats
        const review = await env.DB.prepare("SELECT product_id FROM reviews WHERE id = ?").bind(id).first();

        await env.DB.prepare("DELETE FROM reviews WHERE id = ?").bind(id).run();

        if (review && review.product_id) {
            // Update Stats
            const productId = review.product_id as string;
            const allReviews = await env.DB.prepare("SELECT rating FROM reviews WHERE product_id = ?").bind(productId).all();
            const ratings = allReviews.results.map((r: any) => r.rating) as number[];
            const count = ratings.length;
            const avg = count > 0 ? ratings.reduce((a, b) => a + b, 0) / count : 0;

            await env.DB.prepare("UPDATE products SET rating = ?, reviews = ? WHERE id = ?")
                .bind(avg, count, productId).run();
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};
