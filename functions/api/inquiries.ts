interface Env {
    DB: D1Database;
    WHATSAPP_TOKEN: string;
    WHATSAPP_PHONE_ID: string;
}

import { sendWhatsAppMessage } from "../lib/notificationService";

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
    try {
        const data = await request.json();
        const { name, mobile, initialQuery } = data as any;

        const id = crypto.randomUUID();
        const date = new Date().toISOString();

        await env.DB.prepare(
            "INSERT INTO inquiries (id, name, mobile, date, initial_query, status) VALUES (?, ?, ?, ?, ?, 'New')"
        ).bind(id, name, mobile, date, initialQuery).run();

        // Send WhatsApp Notification for New Ticket
        if (mobile && name) {
            await sendWhatsAppMessage(
                env.DB,
                {
                    to: mobile,
                    type: 'order_confirmation', // repurposing type for logging
                    templateName: 'inquiry_received', // Replace with actual template name approved in Meta
                    parameters: [
                        { type: "text", text: name },
                        { type: "text", text: initialQuery || "General Inquiry" }
                    ]
                },
                env
            );
        }

        return new Response(JSON.stringify({ success: true, id }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
    const { results } = await env.DB.prepare("SELECT * FROM inquiries ORDER BY date DESC").all();
    return new Response(JSON.stringify(results), {
        headers: { "Content-Type": "application/json" },
    });
};

export const onRequestPut: PagesFunction<Env> = async ({ request, env }) => {
    try {
        const data = await request.json();
        const { id, status, adminNotes } = data as { id: string, status: string, adminNotes?: string };

        if (!id || !status) {
            return new Response(JSON.stringify({ error: "Missing id or status" }), { status: 400 });
        }

        // Fetch inquiry to get the user's mobile, name, and initial_query
        const inquiry: any = await env.DB.prepare("SELECT * FROM inquiries WHERE id = ?").bind(id).first();

        if (!inquiry) {
            return new Response(JSON.stringify({ error: "Inquiry not found" }), { status: 404 });
        }

        if (adminNotes !== undefined) {
            await env.DB.prepare(
                "UPDATE inquiries SET status = ?, admin_notes = ? WHERE id = ?"
            ).bind(status, adminNotes, id).run();
        } else {
            await env.DB.prepare(
                "UPDATE inquiries SET status = ? WHERE id = ?"
            ).bind(status, id).run();
        }

        // Send WhatsApp Notification for Status Update
        if (inquiry.mobile && inquiry.name) {
            await sendWhatsAppMessage(
                env.DB,
                {
                    to: inquiry.mobile,
                    type: 'order_update', // Repurposing type for logging
                    templateName: 'ticket_update', // Replace with actual template name approved in Meta
                    parameters: [
                        { type: "text", text: inquiry.name },
                        { type: "text", text: status },
                        { type: "text", text: inquiry.initial_query || "General Inquiry" },
                        { type: "text", text: adminNotes || "-" }
                    ]
                },
                env
            );
        }

        return new Response(JSON.stringify({ success: true, id, status, adminNotes }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};
