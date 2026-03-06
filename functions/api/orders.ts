import { sendEmail, sendSMS, orderConfirmationTemplate, logActivity, orderStatusTemplate, sendWhatsAppMessage } from "../lib/notificationService";
import { authenticateShiprocket, createShiprocketOrder, ShiprocketOrder } from "../lib/shiprocket";

interface Env {
    DB: D1Database;
    BREVO_API_KEY: string;
    RAZORPAY_SECRET: string;
}

async function verifyRazorpaySignature(razorpayOrderId: string, razorpayPaymentId: string, signature: string, secret: string) {
    const data = razorpayOrderId + "|" + razorpayPaymentId;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign(
        "HMAC",
        key,
        encoder.encode(data)
    );
    const hashArray = Array.from(new Uint8Array(signatureBuffer));
    const generatedSignature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return generatedSignature === signature;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
    try {
        const url = new URL(request.url);
        const orderId = url.searchParams.get("id");
        const phone = url.searchParams.get("phone");
        const adminMode = url.searchParams.get("admin") === "true";

        // Case 1: Admin - Get All Orders
        if (!orderId && adminMode) {
            const orders = await env.DB.prepare("SELECT * FROM orders ORDER BY created_at DESC").all();
            return new Response(JSON.stringify(orders.results), {
                headers: { "Content-Type": "application/json" },
            });
        }

        // Case 2: Admin - Get Single Order Details (and Items)
        if (orderId && adminMode) {
            const order = await env.DB.prepare("SELECT * FROM orders WHERE id = ?").bind(orderId).first();
            if (!order) return new Response(JSON.stringify({ error: "Order not found" }), { status: 404 });
            const items = await env.DB.prepare("SELECT * FROM order_items WHERE order_id = ?").bind(orderId).all();
            return new Response(JSON.stringify({ ...order, items: items.results }), {
                headers: { "Content-Type": "application/json" },
            });
        }

        // Case 3: Customer Order History (Requires Phone)
        if (!orderId && phone && !adminMode) {
            const orders = await env.DB.prepare("SELECT * FROM orders WHERE customer_phone = ? ORDER BY created_at DESC").bind(phone).all();
            return new Response(JSON.stringify(orders.results), {
                headers: { "Content-Type": "application/json" },
            });
        }

        // Case 4: Public - Tracking (Requires ID + Phone)
        if (!orderId || !phone) {
            return new Response(JSON.stringify({ error: "Order ID and Mobile Number required for tracking" }), { status: 400 });
        }

        const order = await env.DB.prepare("SELECT * FROM orders WHERE id = ? AND customer_phone = ?").bind(orderId, phone).first();

        if (!order) {
            return new Response(JSON.stringify({ error: "Order not found" }), { status: 404 });
        }

        const items = await env.DB.prepare("SELECT * FROM order_items WHERE order_id = ?").bind(orderId).all();

        return new Response(JSON.stringify({ ...order, items: items.results }), {
            headers: { "Content-Type": "application/json" },
        });

    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
    try {
        const data = await request.json() as any;
        const { customer, items, paymentMethod, totalAmount, paymentId, razorpayOrderId, razorpaySignature, isReferral, referrerId } = data;

        // 1. Verify Razorpay Payment if Online
        if (paymentMethod === 'online') {
            if (!paymentId || !razorpayOrderId || !razorpaySignature) {
                return new Response(JSON.stringify({ error: "Missing payment verification details" }), { status: 400 });
            }
            // Use environment variable secret
            const secret = env.RAZORPAY_SECRET;
            if (!secret) {
                return new Response(JSON.stringify({ error: "Server Configuration Error: Razorpay Secret is missing" }), { status: 500 });
            }
            const isValid = await verifyRazorpaySignature(razorpayOrderId, paymentId, razorpaySignature, secret);
            if (!isValid) {
                console.error("Payment verification failed for Order:", razorpayOrderId);
                return new Response(JSON.stringify({ error: "Invalid payment signature. Transaction rejected." }), { status: 400 });
            }
        }

        const orderId = crypto.randomUUID().split('-')[0].toUpperCase(); // Short ID like 4A2B9C
        const createdAt = new Date().toISOString();

        // 2. Save Order to D1
        await env.DB.prepare(`
            INSERT INTO orders (id, customer_name, customer_email, customer_phone, address, city, pincode, total_amount, payment_method, payment_status, payment_id, is_b2b, company_name, gst_number, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            orderId,
            customer.fullName,
            customer.email,
            customer.phone,
            customer.address,
            customer.city,
            customer.pincode,
            totalAmount,
            paymentMethod,
            paymentMethod === 'online' ? 'paid' : 'pending',
            paymentId || null,
            data.isB2B ? 1 : 0,
            data.companyName || null,
            data.gstNumber || null,
            createdAt
        ).run();

        // Create Items Statement
        const stmt = env.DB.prepare(`
            INSERT INTO order_items (id, order_id, product_id, variant_id, product_name, quantity, price, image)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const item of items) {
            // Handle Bundle
            if (item.bundle) {
                await stmt.bind(
                    crypto.randomUUID(),
                    orderId,
                    item.bundle.id,
                    null, // No variant for bundle
                    item.bundle.name,
                    item.quantity || 1,
                    item.bundle.price,
                    item.bundle.image
                ).run();
                continue;
            }

            // Handle Regular Product
            if (item.product && item.variant) {
                await stmt.bind(
                    crypto.randomUUID(),
                    orderId,
                    item.product.id || 'unknown',
                    item.variant.id || null,
                    item.product.name || 'Unknown Product',
                    item.quantity || 1,
                    item.variant.price || 0,
                    (item.product.images && item.product.images.length > 0) ? item.product.images[0] : null
                ).run();
            }
        }

        // Award Loyalty Points (₹100 = 10 points)
        const pointsEarned = Math.floor(totalAmount / 100) * 10;
        if (pointsEarned > 0) {
            try {
                await env.DB.prepare(`
                    INSERT INTO loyalty_points (user_id, points, transaction_type, order_id, description)
                    VALUES (?, ?, 'earned', ?, ?)
                `).bind(
                    customer.phone,
                    pointsEarned,
                    orderId,
                    `Earned ${pointsEarned} points on order #${orderId}`
                ).run();
            } catch (loyaltyError) {
                console.error("Failed to award loyalty points:", loyaltyError);
                // Don't fail the order if loyalty points fail
            }
        }

        let dbCustomer: any = null;
        // --- ACCOUNT CREATION/UPDATE LOGIC ---
        try {
            // Upsert customer: Insert or Replace based on phone being a key profile identifier
            // We use phone as the unique key to match customers
            await env.DB.prepare(`
                INSERT INTO customers (id, name, email, phone, address, city, pincode, status, created_at, email_notifications, sms_notifications)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'approved', ?, 1, 1)
                ON CONFLICT(phone) DO UPDATE SET
                    name = excluded.name,
                    email = excluded.email,
                    address = excluded.address,
                    city = excluded.city,
                    pincode = excluded.pincode,
                    status = excluded.status
            `).bind(
                crypto.randomUUID(),
                customer.fullName,
                customer.email,
                customer.phone,
                customer.address,
                customer.city,
                customer.pincode,
                createdAt
            ).run();

            // Re-fetch customer ID for activity logging
            dbCustomer = await env.DB.prepare("SELECT * FROM customers WHERE phone = ?").bind(customer.phone).first();
            console.log(`Customer record syncronized for ${customer.phone}`);
        } catch (customerError) {
            console.error("Failed to sync customer account:", customerError);
            // Continue, don't block order
        }

        // Send Email & SMS Notifications
        try {
            // Re-fetch or use dbCustomer
            const brevoKey = env.BREVO_API_KEY;

            // Email Notification
            if (customer.email && (!dbCustomer || dbCustomer.email_notifications !== 0)) {
                await sendEmail({
                    to: customer.email,
                    subject: `Order Confirmation - #${orderId}`,
                    html: orderConfirmationTemplate(orderId, totalAmount)
                }, brevoKey);
            }

            // SMS Notification
            if (customer.phone && (!dbCustomer || dbCustomer.sms_notifications === 1)) {
                await sendSMS({
                    to: customer.phone,
                    message: `Thank you for your order #${orderId} at TopStore! Amount: ₹${totalAmount.toLocaleString()}. Track here: https://moorvikajewels.com/track-order?id=${orderId}`
                }, env);
            }

            // WhatsApp Notification
            if (customer.phone) {
                await sendWhatsAppMessage(env.DB, {
                    to: customer.phone,
                    type: 'order_confirmation',
                    templateName: 'order_confirmation', // Replace with your approved Meta template name
                    parameters: [
                        { type: 'text', text: orderId },
                        { type: 'text', text: totalAmount.toLocaleString() }
                    ]
                }, env);
            }

            // Log activity if customer exists
            if (dbCustomer) {
                await logActivity(env.DB, dbCustomer.id, "order_placed", { orderId, total: totalAmount });
            }
        } catch (notificationError) {
            console.error("Notification sending failed:", notificationError);
        }


        // -------------------------------------------------------------------------------- //
        // HANDLE SHIPROCKET SYNC
        // -------------------------------------------------------------------------------- //
        try {
            const shiprocketToken = await authenticateShiprocket(env);
            if (shiprocketToken) {
                // Map the TopStore order structure to Shiprocket API requirement
                const shiprocketOrderData: ShiprocketOrder = {
                    order_id: orderId,
                    order_date: new Date().toISOString(),
                    pickup_location: "Primary", // Requires a named location set in Shiprocket Dashboard
                    billing_customer_name: customer.fullName.split(' ')[0],
                    billing_last_name: customer.fullName.split(' ').slice(1).join(' ') || '',
                    billing_address: customer.address,
                    billing_city: customer.city,
                    billing_pincode: customer.pincode,
                    billing_state: "Maharashtra", // Simplification. In production, collect State on Checkout!
                    billing_country: "India",
                    billing_email: customer.email || "no-reply@moorvikajewels.com",
                    billing_phone: customer.phone,
                    shipping_is_billing: true,
                    order_items: items.map((item: any) => ({
                        name: item.bundle?.name || item.product?.name || 'Item',
                        sku: item.variant?.sku || item.product?.sku || item.bundle?.id || 'SKU-001',
                        units: item.quantity || 1,
                        selling_price: item.bundle?.price || item.variant?.price || 0,
                        discount: 0,
                    })),
                    payment_method: paymentMethod === 'online' ? 'Prepaid' : 'COD',
                    sub_total: totalAmount,
                    length: 10,  // Defaults for Jewellery
                    breadth: 10,
                    height: 5,
                    weight: 0.2
                };

                const shiprocketSyncResult = await createShiprocketOrder(shiprocketToken, shiprocketOrderData);
                if (shiprocketSyncResult) {
                    console.log(`Order ${orderId} synced to Shiprocket successfully:`, shiprocketSyncResult.order_id);
                }
            } else {
                console.log(`Order ${orderId} NOT synced. Shiprocket credentials missing or failed.`);
            }
        } catch (srError) {
            console.error("Critical: Failed to sync order to Shiprocket automatically:", srError);
            // We do NOT block the user's checkout if the external dashboard sync fails.
        }
        if (isReferral && referrerId) {
            try {
                // 1. Record Referral
                await env.DB.prepare(`
                    INSERT INTO referrals (id, referrer_id, referee_phone, order_id, status, reward_points)
                    VALUES (?, ?, ?, ?, 'completed', 500)
                `).bind(
                    crypto.randomUUID(),
                    referrerId,
                    customer.phone,
                    orderId
                ).run();

                // 2. Award Points to Referrer
                await env.DB.prepare(`
                    INSERT INTO loyalty_points (user_id, points, transaction_type, order_id, description)
                    VALUES (?, 500, 'earned', ?, ?)
                `).bind(
                    referrerId,
                    orderId,
                    `Referral Bonus for referring ${customer.fullName}`
                ).run();

            } catch (refError) {
                console.error("Referral processing failed:", refError);
                // Non-critical, continue
            }
        }

        return new Response(JSON.stringify({ success: true, orderId }), {
            headers: { "Content-Type": "application/json" },
        });

    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};

export const onRequestPatch: PagesFunction<Env> = async ({ request, env }) => {
    try {
        const { id, status } = await request.json() as any;
        if (!id || !status) throw new Error("ID and Status required");

        const order: any = await env.DB.prepare("SELECT * FROM orders WHERE id = ?").bind(id).first();
        if (!order) throw new Error("Order not found");

        await env.DB.prepare("UPDATE orders SET status = ? WHERE id = ?").bind(status, id).run();

        // Cascade: If delivered and COD, mark as paid
        if (status === 'delivered' && order.payment_method === 'cod' && order.payment_status !== 'paid') {
            await env.DB.prepare("UPDATE orders SET payment_status = 'paid' WHERE id = ?").bind(id).run();
            console.log(`Auto-marked order ${id} as PAID (COD Delivered)`);
        }

        // Send Status Update Notifications
        const brevoKey = env.BREVO_API_KEY;

        const dbCustomer: any = await env.DB.prepare("SELECT * FROM customers WHERE phone = ?").bind(order.customer_phone).first();

        // Email
        if (order.customer_email && (!dbCustomer || dbCustomer.email_notifications !== 0)) {
            await sendEmail({
                to: order.customer_email,
                subject: `Order Update - #${id}`,
                html: orderStatusTemplate(id, status)
            }, brevoKey);
        }

        // SMS
        if (order.customer_phone && (!dbCustomer || dbCustomer.sms_notifications === 1)) {
            await sendSMS({
                to: order.customer_phone,
                message: `Your TopStore order #${id} status has been updated to: ${status.toUpperCase()}. Track here: https://moorvikajewels.com/track-order?id=${id}`
            }, env);
        }

        // WhatsApp
        if (order.customer_phone) {
            const trackingLink = `https://moorvikajewels.com/track-order?id=${id}`;
            await sendWhatsAppMessage(env.DB, {
                to: order.customer_phone,
                type: 'order_update',
                templateName: 'order_status_update', // Replace with your approved Meta template name
                parameters: [
                    { type: 'text', text: id },
                    { type: 'text', text: status.toUpperCase() },
                    { type: 'text', text: trackingLink }
                ]
            }, env);
        }

        // Log Activity
        if (dbCustomer) {
            await logActivity(env.DB, dbCustomer.id, "status_change", { orderId: id, newStatus: status });
        }

        return new Response(JSON.stringify({ success: true }));
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};
