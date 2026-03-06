import { sendWhatsAppMessage } from "../../lib/notificationService";

interface Env {
    DB: D1Database;
    WHATSAPP_TOKEN: string;
    WHATSAPP_PHONE_ID: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
    try {
        const url = new URL(request.url);
        const admin = url.searchParams.get("admin");

        if (admin !== 'true') return new Response("Unauthorized", { status: 401 });

        const { cartId } = await request.json() as { cartId: string };

        if (!cartId) {
            return new Response(JSON.stringify({ error: "cartId is required" }), { status: 400 });
        }

        // 1. Fetch data from DB
        const cart = await env.DB.prepare("SELECT * FROM abandoned_checkouts WHERE id = ?").bind(cartId).first() as any;

        if (!cart) {
            return new Response(JSON.stringify({ error: "Cart not found" }), { status: 404 });
        }

        if (!cart.customer_phone) {
            return new Response(JSON.stringify({ error: "No customer phone available" }), { status: 400 });
        }

        // 2. Send WhatsApp Message
        // Template: abandoned_cart_reminder
        // Parameters: {{1}} = Customer Name, {{2}} = Checkout Link (Mocked for now)
        const checkoutLink = `https://moorvikajewels.com/checkout?id=${cart.id}`;

        const success = await sendWhatsAppMessage(
            env.DB,
            {
                to: cart.customer_phone,
                type: 'abandoned_cart_reminder',
                templateName: 'abandoned_cart_reminder',
                parameters: [
                    { type: "text", text: cart.customer_name || "there" },
                    { type: "text", text: checkoutLink }
                ]
            },
            env
        );

        if (!success) {
            return new Response(JSON.stringify({ error: "Failed to send WhatsApp message" }), { status: 500 });
        }

        // 3. Update DB tracking
        const now = new Date().toISOString();
        await env.DB.prepare(`
            UPDATE abandoned_checkouts 
            SET notification_sent_at = ?, 
                reminder_count = reminder_count + 1 
            WHERE id = ?
        `).bind(now, cart.id).run();

        return new Response(JSON.stringify({ success: true, sent_at: now }));
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};
