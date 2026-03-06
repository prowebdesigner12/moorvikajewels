import { algoliasearch } from 'algoliasearch';

interface Env {
    DB: D1Database;
}

const ALGOLIA_ID = "149SUVKCWZ";
const ALGOLIA_KEY = "2b04beb301fe738a0dc4e8fe97605e77";

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
    try {
        // 1. Fetch all products from D1
        const res = await env.DB.prepare("SELECT * FROM products").all();
        const products = res.results || [];

        if (products.length === 0) {
            return new Response(JSON.stringify({ message: "No products found in DB" }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        // 2. Initialize Algolia
        const client = algoliasearch(ALGOLIA_ID, ALGOLIA_KEY);

        // 3. Prepare records
        const records = products.map((p: any) => {
            let images = [];
            try {
                images = JSON.parse(p.images || '[]');
            } catch (e) {
                images = [];
            }

            let tags = [];
            try {
                tags = JSON.parse(p.tags || '[]');
            } catch (e) {
                tags = [];
            }

            return {
                objectID: p.id,
                name: p.name,
                description: p.description,
                price: p.price,
                image: images.length > 0 ? images[0] : null,
                category: p.category,
                tags: tags,
                slug: p.slug || p.id,
                rating: p.rating || 0,
                reviews: p.reviews || 0,
                created_at: p.created_at
            };
        });

        // 4. Batch Save to Algolia
        await client.saveObjects({
            indexName: 'products',
            objects: records
        });

        return new Response(JSON.stringify({
            success: true,
            syncedCount: records.length,
            message: `Successfully synced ${records.length} products to Algolia.`
        }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};
