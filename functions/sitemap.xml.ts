interface Env {
    DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
    try {
        const baseUrl = 'https://moorvikajewels.com';

        // Fetch products and collections
        const products: any = await env.DB.prepare('SELECT id, slug, updated_at FROM products').all();
        const collections: any = await env.DB.prepare('SELECT id, slug FROM collections').all();

        let urls = ``;

        // Static Pages
        const staticPages = ['', '/about', '/contact', '/track'];
        staticPages.forEach(page => {
            urls += `
   <url>
      <loc>${baseUrl}${page}</loc>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
   </url>`;
        });

        // Products
        if (products.results) {
            products.results.forEach((p: any) => {
                urls += `
   <url>
      <loc>${baseUrl}/product/${p.slug || p.id}</loc>
      <lastmod>${new Date(p.updated_at || Date.now()).toISOString()}</lastmod>
      <changefreq>daily</changefreq>
      <priority>1.0</priority>
   </url>`;
            });
        }

        // Collections
        if (collections.results) {
            collections.results.forEach((c: any) => {
                urls += `
   <url>
      <loc>${baseUrl}/collections/${c.slug || c.id}</loc>
      <changefreq>weekly</changefreq>
      <priority>0.9</priority>
   </url>`;
            });
        }

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
   ${urls}
</urlset>`;

        return new Response(sitemap, {
            headers: {
                "Content-Type": "application/xml",
                "Cache-Control": "public, max-age=3600"
            }
        });

    } catch (e: any) {
        return new Response(`Error generating sitemap: ${e.message}`, { status: 500 });
    }
};
