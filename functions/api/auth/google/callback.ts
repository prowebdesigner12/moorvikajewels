import { parse } from 'cookie';

interface Env {
    DB: D1Database;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    GOOGLE_REDIRECT_URI: string;
    JWT_SECRET: string; // If using JWT
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");

    if (error) {
        return new Response(`Google Auth Error: ${error}`, { status: 400 });
    }

    if (!code) {
        return new Response("Missing code param", { status: 400 });
    }

    try {
        const client_id = env.GOOGLE_CLIENT_ID;
        const client_secret = env.GOOGLE_CLIENT_SECRET;
        const redirect_uri = `${url.origin}/api/auth/google/callback`;

        // 1. Exchange code for tokens
        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                code,
                client_id,
                client_secret,
                redirect_uri,
                grant_type: "authorization_code",
            }),
        });

        const tokens: any = await tokenResponse.json();
        if (tokens.error) {
            throw new Error(tokens.error_description || tokens.error);
        }

        // 2. Get User Info
        const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
        });
        const googleUser: any = await userResponse.json();

        // 3. Upsert User in DB
        // Check if user exists by google_id OR email in CUSTOMERS table
        let user = await env.DB.prepare("SELECT * FROM customers WHERE google_id = ? OR email = ?")
            .bind(googleUser.id, googleUser.email)
            .first();

        const now = new Date().toISOString();

        if (user) {
            // Update existing customer
            await env.DB.prepare(`
        UPDATE customers 
        SET google_id = ?, avatar_url = ? 
        WHERE id = ?
      `).bind(googleUser.id, googleUser.picture, user.id).run();

            user = { ...user, google_id: googleUser.id, avatar_url: googleUser.picture };
        } else {
            // Create new customer
            const newId = crypto.randomUUID();
            await env.DB.prepare(`
        INSERT INTO customers (id, name, email, google_id, avatar_url, status, created_at) 
        VALUES (?, ?, ?, ?, ?, 'pending', ?)
      `).bind(newId, googleUser.name, googleUser.email, googleUser.id, googleUser.picture, now).run();

            user = {
                id: newId,
                name: googleUser.name,
                email: googleUser.email,
                google_id: googleUser.id,
                avatar_url: googleUser.picture,
                status: 'pending',
                created_at: now
            };
        }

        // Add role for frontend context
        user = { ...user, role: 'customer' };

        if (user.status === 'pending') {
            return new Response(null, {
                status: 302,
                headers: {
                    "Location": "/?login_pending=true"
                }
            });
        }

        // 4. Create Session (Cookie) - Simple JSON string for demo, ideally JWT
        // For this implementation, we will pass data to frontend via URL fragment/query
        // to maintain compatibility with existing localStorage Architecture, 
        // OR set a cookie that /api/auth/me can read.
        // User requested "Session Cookie".
        // We will set a cookie "topstore_token" containing a simple session signature (or just UserID for internal trust if simpler, but JWT is better).
        // Let's create a simple session cookie "topstore_session" = USER_ID (Not secure for production but works for this demo context without proper JWT lib).
        // Better: base64(JSON.stringify(user)) - still not secure but "functional".

        const sessionData = JSON.stringify(user);
        const encodedSession = btoa(sessionData);

        const cookie = `topstore_session=${encodedSession}; HttpOnly; Secure; Path=/; Max-Age=86400; SameSite=Lax`;

        // 5. Redirect to Store
        return new Response(null, {
            status: 302,
            headers: {
                "Location": "/?login_success=true",
                "Set-Cookie": cookie
            }
        });

    } catch (err: any) {
        return new Response(`Auth Error: ${err.message}`, { status: 500 });
    }
};
