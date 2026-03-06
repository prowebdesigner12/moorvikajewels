import { D1Database } from '@cloudflare/workers-types';
import { sendWhatsAppMessage } from '../../lib/notificationService';

interface Env {
    DB: D1Database;
    WHATSAPP_TOKEN: string;
    WHATSAPP_PHONE_ID: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
    try {
        // Shiprocket Webhook Payload
        const payload = await request.json() as any;

        // Ensure payload is valid
        if (!payload || !payload.order_id || !payload.current_status) {
            return new Response("Invalid Payload", { status: 400 });
        }

        const orderId = payload.order_id;
        let newStatus = payload.current_status.toLowerCase(); // e.g., 'shipped', 'delivered', 'canceled'

        // Optional: Map Shiprocket statues to TopStore ones if they differ
        // For example, Shiprocket sends 'IN TRANSIT', TopStore expects 'shipped'
        if (newStatus === 'in transit' || newStatus === 'shipped') {
            newStatus = 'shipped';
        } else if (newStatus.includes('delivered')) {
            newStatus = 'delivered';
        } else if (newStatus.includes('cancel')) {
            newStatus = 'cancelled';
        } else if (newStatus === 'rto initiated' || newStatus === 'rto delivered') {
            newStatus = 'returned';
        }

        // 1. Fetch existing order from DB
        const order: any = await env.DB.prepare("SELECT * FROM orders WHERE id = ?").bind(orderId).first();
        if (!order) {
            console.warn(`Shiprocket Webhook: Order ${orderId} not found in DB`);
            // We still return 200 so Shiprocket stops retrying
            return new Response("OK", { status: 200 });
        }

        // Avoid duplicate updates
        if (order.status === newStatus) {
            return new Response("OK - Status Unchanged", { status: 200 });
        }

        // 2. Update Order Status in Database
        await env.DB.prepare("UPDATE orders SET status = ? WHERE id = ?").bind(newStatus, orderId).run();

        // If delivered COD, auto-mark paid
        if (newStatus === 'delivered' && order.payment_method === 'cod' && order.payment_status !== 'paid') {
            await env.DB.prepare("UPDATE orders SET payment_status = 'paid' WHERE id = ?").bind(orderId).run();
        }

        // 3. Send WhatsApp Notification
        const trackingLink = `https://moorvikajewels.com/track-order?id=${orderId}`;
        if (order.customer_phone) {
            await sendWhatsAppMessage(env.DB, {
                to: order.customer_phone,
                type: 'order_update',
                templateName: 'order_status_update', // Meta Template
                parameters: [
                    { type: 'text', text: orderId },
                    { type: 'text', text: newStatus.toUpperCase() },
                    { type: 'text', text: trackingLink }
                ]
            }, env);
        }

        console.log(`Shiprocket Webhook processed for Order ${orderId}: changed to ${newStatus}`);
        return new Response(JSON.stringify({ success: true, newStatus }), { status: 200 });

    } catch (error: any) {
        console.error("Shiprocket Webhook Error:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
};
