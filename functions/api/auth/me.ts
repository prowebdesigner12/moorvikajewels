import { parse } from 'cookie';

interface Env {
    DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
    const cookieHeader = request.headers.get("Cookie");
    if (!cookieHeader) {
        return new Response(JSON.stringify({ user: null }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    const cookies = parse(cookieHeader);
    const sessionToken = cookies.topstore_session;

    if (!sessionToken) {
        return new Response(JSON.stringify({ user: null }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    try {
        // Decode session
        const userData = JSON.parse(atob(sessionToken));

        // In a real app, you would verify signature/JWT here. 
        // For now, we trust the cookie we set (assuming httpOnly prevents client tampering roughly, though not secure against forgery without signature).

        // Optional: Re-fetch from DB to ensure valid
        // const user = await env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(userData.id).first();

        return new Response(JSON.stringify({ user: userData }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (e) {
        return new Response(JSON.stringify({ user: null }), { status: 200, headers: { "Content-Type": "application/json" } });
    }
};
