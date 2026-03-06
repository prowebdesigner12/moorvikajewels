interface Env {
    GOOGLE_CLIENT_ID: string;
    GOOGLE_REDIRECT_URI: string;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
    const client_id = env.GOOGLE_CLIENT_ID;
    const url = new URL(request.url);
    const redirect_uri = `${url.origin}/api/auth/google/callback`;

    if (!client_id) {
        return new Response("Missing GOOGLE_CLIENT_ID env var", { status: 500 });
    }

    const scope = "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email";
    const state = crypto.randomUUID(); // Recommended for CSRF protection

    // In a real app, store 'state' in a cookie to verify on callback

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${client_id}&` +
        `redirect_uri=${encodeURIComponent(redirect_uri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(scope)}&` +
        `state=${state}&` +
        `access_type=offline&` +
        `prompt=consent`;

    return Response.redirect(authUrl, 302);
};
