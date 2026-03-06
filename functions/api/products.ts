// Algolia Helper
import { algoliasearch } from 'algoliasearch';

// Admin API Key (Write Access)
const ALGOLIA_ID = "149SUVKCWZ";
const ALGOLIA_KEY = "2b04beb301fe738a0dc4e8fe97605e77";

interface Env {
    DB: D1Database;
}

const updateAlgolia = async (product: any, isDelete = false) => {
    try {
        const client = algoliasearch(ALGOLIA_ID, ALGOLIA_KEY);

        if (isDelete) {
            await client.deleteObject({
                indexName: 'products',
                objectID: product.id
            });
            console.log(`Deleted from Algolia: ${product.id}`);
            return;
        }

        // Format for Algolia
        const record = {
            objectID: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            image: product.images && product.images.length > 0 ? product.images[0] : null,
            category: product.category,
            tags: product.tags,
            slug: product.slug || product.id,
            rating: product.rating || 0,
            reviews: product.reviews || 0
        };

        await client.saveObject({
            indexName: 'products',
            body: record
        });
        console.log(`Synced to Algolia: ${product.name}`);
    } catch (err) {
        console.error("Algolia Sync Error:", err);
    }
};

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const slug = url.searchParams.get("slug");

    try {
        let results: any[] = [];

        if (id) {
            const res = await env.DB.prepare("SELECT * FROM products WHERE id = ?").bind(id).first();
            if (res) results.push(res);
        } else if (slug) {
            const res = await env.DB.prepare("SELECT * FROM products WHERE slug = ?").bind(slug).first();
            if (res) results.push(res);
        } else {
            const res = await env.DB.prepare("SELECT * FROM products ORDER BY id DESC").all();
            results = res.results || [];
        }

        const products = await Promise.all(results.map(async (p: any) => {
            const tiers = await env.DB.prepare("SELECT * FROM wholesale_tiers WHERE product_id = ? ORDER BY min_quantity ASC").bind(p.id).all();

            return {
                ...p,
                images: JSON.parse(p.images || '[]'),
                variants: JSON.parse(p.variants || '[]'),
                tags: JSON.parse(p.tags || '[]'),
                wholesale_tiers: tiers.results || [],
                subscription_plans: [
                    { id: 'sub_weekly', frequency: 'weekly', discount_percent: 15 },
                    { id: 'sub_monthly', frequency: 'monthly', discount_percent: 10 }
                ],
                flash_sale_end: p.id === '1' ? new Date(Date.now() + 86400000).toISOString() : null
            };
        }));

        // If specific product requested, return it directly
        if ((id || slug) && products.length === 1) {
            return new Response(JSON.stringify(products[0]), {
                headers: {
                    "Content-Type": "application/json",
                    "Cache-Control": "no-store, max-age=0"
                },
            });
        }

        return new Response(JSON.stringify(products), {
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
                "Pragma": "no-cache",
                "Expires": "0"
            },
        });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
    try {
        const product = await request.json() as any;
        const id = crypto.randomUUID();
        const now = new Date().toISOString();

        console.log("Creating product:", id, product);

        // 1. Insert into D1
        await env.DB.prepare(`
            INSERT INTO products (
                id, name, slug, description, price, original_price, category, images, stock, variants, tags, 
                rating, reviews, weight, track_quantity, continue_selling_oos, status, vendor, type,
                meta_title, meta_description, meta_keywords, created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            id,
            product.name,
            product.slug || id,
            product.description,
            product.price,
            product.originalPrice || 0,
            product.category,
            JSON.stringify(product.images || []),
            product.stock || 0,
            JSON.stringify(product.variants || []),
            JSON.stringify(product.tags || []),
            product.weight || 0.0,
            product.track_quantity ? 1 : 0,
            product.continue_selling_oos ? 1 : 0,
            product.status || 'active',
            product.vendor || null,
            product.type || null,
            product.meta_title || null,
            product.meta_description || null,
            product.meta_keywords || null,
            now,
            now
        ).run();

        // 2. Handle Wholesale Tiers if present
        if (product.wholesale_tiers && Array.isArray(product.wholesale_tiers)) {
            for (const tier of product.wholesale_tiers) {
                await env.DB.prepare(`
                    INSERT INTO wholesale_tiers (product_id, min_quantity, price)
                    VALUES (?, ?, ?)
                `).bind(id, tier.min_quantity, tier.price).run();
            }
        }

        // 3. Sync to Algolia
        await updateAlgolia({ ...product, id });

        return new Response(JSON.stringify({ success: true, id }), {
            headers: { "Content-Type": "application/json" },
        });

    } catch (e: any) {
        console.error("Create Error:", e);
        return new Response(JSON.stringify({ error: e.message, stack: e.stack }), { status: 500 });
    }
};

export const onRequestPut: PagesFunction<Env> = async ({ request, env }) => {
    try {
        const product = await request.json() as any;
        if (!product.id) return new Response("ID required", { status: 400 });

        console.log("Updating product:", product.id, product);

        const now = new Date().toISOString();

        // 1. Update D1 Products Table
        const res = await env.DB.prepare(`
            UPDATE products SET 
                name=?, slug=?, description=?, price=?, original_price=?, category=?, images=?, stock=?, variants=?, tags=?, 
                weight=?, track_quantity=?, continue_selling_oos=?, status=?, vendor=?, type=?,
                meta_title=?, meta_description=?, meta_keywords=?, updated_at=?
            WHERE id=?
        `).bind(
            product.name,
            product.slug,
            product.description,
            product.price,
            product.originalPrice,
            product.category,
            JSON.stringify(product.images || []),
            product.stock,
            JSON.stringify(product.variants || []),
            JSON.stringify(product.tags || []),
            product.weight || 0,
            product.track_quantity ? 1 : 0,
            product.continue_selling_oos ? 1 : 0,
            product.status || 'active',
            product.vendor || null,
            product.type || null,
            product.meta_title || null,
            product.meta_description || null,
            product.meta_keywords || null,
            now,
            product.id
        ).run();

        // 2. Update Wholesale Tiers
        if (product.wholesale_tiers && Array.isArray(product.wholesale_tiers)) {
            // Delete old tiers
            await env.DB.prepare("DELETE FROM wholesale_tiers WHERE product_id = ?").bind(product.id).run();

            // Insert new tiers
            for (const tier of product.wholesale_tiers) {
                await env.DB.prepare(`
                    INSERT INTO wholesale_tiers (product_id, min_quantity, price)
                    VALUES (?, ?, ?)
                `).bind(product.id, tier.min_quantity, tier.price).run();
            }
        }

        // 3. Sync Algolia
        await updateAlgolia(product);

        return new Response(JSON.stringify({ success: true, changes: res.meta.changes }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (e: any) {
        console.error("Update Error:", e);
        return new Response(JSON.stringify({ error: e.message, stack: e.stack }), { status: 500 });
    }
};

export const onRequestDelete: PagesFunction<Env> = async ({ request, env }) => {
    try {
        const url = new URL(request.url);
        const id = url.searchParams.get("id");

        if (!id) throw new Error("ID required");

        await env.DB.prepare("DELETE FROM products WHERE id = ?").bind(id).run();
        await updateAlgolia({ id }, true);

        return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};
