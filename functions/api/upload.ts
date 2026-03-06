interface Env {
    IMAGES: R2Bucket;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            console.error("Upload Error: No file found");
            return new Response(JSON.stringify({ error: "No file uploaded" }), { status: 400 });
        }

        console.log(`Uploading file: ${file.name}, size: ${file.size}`);

        const key = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;

        // Check if R2 binding exists
        if (!env.IMAGES) {
            console.warn("R2 Binding (IMAGES) not found. Mocking upload for local dev.");
            // Return a dummy placeholder or usage of a public placeholder service for testing
            // or just return the key and fail on GET later, but let's try to be helpful.
            return new Response(JSON.stringify({
                success: true,
                url: `https://placehold.co/600x400?text=${encodeURIComponent(file.name)}`, // Fallback for dev without R2
                mock: true
            }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        const arrayBuffer = await file.arrayBuffer();
        await env.IMAGES.put(key, arrayBuffer, {
            httpMetadata: { contentType: file.type }
        });

        // NOTE: This assumes R2 bucket is public or behind a custom domain.
        // In local dev `wrangler pages dev`, it might not serve directly easily without config.
        // For now, we return a constructed URL that would work in prod if configured, 
        // or we might need a GET handler to proxy the image if bucket is private.
        // Let's assume standard setup: /images/{key} if we mapped it, OR we just return the key 
        // and have a GET handler serve it.

        // Better approach for simplicity: Serve via this same Function on GET?
        // Or just return the key and let the frontend assume a path.
        // Let's return the key for now.

        return new Response(JSON.stringify({
            success: true,
            url: `/api/upload?key=${key}`
        }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (e: any) {
        console.error("Upload Exception:", e);
        return new Response(JSON.stringify({ error: e.message || "Server Error" }), { status: 500 });
    }
};

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
    const url = new URL(request.url);
    const key = url.searchParams.get("key");

    if (!key) return new Response("Key required", { status: 400 });

    const object = await env.IMAGES.get(key);

    if (!object) return new Response("Not found", { status: 404 });

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);

    return new Response(object.body, { headers });
}
