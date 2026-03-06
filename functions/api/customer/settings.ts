interface Env {
    DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
    try {
        const data = await request.json() as any;
        const { phone, email_notifications, sms_notifications } = data;

        if (!phone) {
            return new Response(JSON.stringify({ error: "Phone number required" }), { status: 400 });
        }

        // Update notification preferences
        await env.DB.prepare(`
            UPDATE customers 
            SET email_notifications = ?, sms_notifications = ?
            WHERE phone = ?
        `).bind(
            email_notifications === undefined ? 1 : (email_notifications ? 1 : 0),
            sms_notifications === undefined ? 0 : (sms_notifications ? 1 : 0),
            phone
        ).run();

        return new Response(JSON.stringify({ success: true, message: "Settings updated" }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
    try {
        const url = new URL(request.url);
        const phone = url.searchParams.get("phone");

        if (!phone) {
            return new Response(JSON.stringify({ error: "Phone required" }), { status: 400 });
        }

        const customer = await env.DB.prepare("SELECT email_notifications, sms_notifications FROM customers WHERE phone = ?")
            .bind(phone)
            .first();

        return new Response(JSON.stringify(customer), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
