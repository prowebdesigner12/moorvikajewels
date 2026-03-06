import { sendEmail, welcomeTemplate, logActivity, otpTemplate, sendSMS, sendWhatsAppMessage } from "../lib/notificationService";

interface Env {
    DB: D1Database;
    BREVO_API_KEY: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
    try {
        const url = new URL(request.url);
        const type = url.searchParams.get("action");
        const data = await request.json();
        const { name, phone, email, password, otp, newPassword } = data as any;

        const response = (data: any, status = 200) => new Response(JSON.stringify(data), {
            status,
            headers: {
                "Content-Type": "application/json",
                "X-Debug-Hit": "true"
            },
        });

        if (!phone) throw new Error("Phone number is required");

        if (type === "signup") {
            const id = crypto.randomUUID();
            const date = new Date().toISOString();

            // Check if phone/email exists in customers
            const existing = await env.DB.prepare("SELECT * FROM customers WHERE phone = ? OR email = ?").bind(phone, email || '').first();
            if (existing) {
                // If existing but unverified, allow sending a new OTP instead of blocking completely
                if (existing.is_verified === 0) {
                    return response({ success: false, require_otp: true, user_id: existing.id, message: "Account exists but is not verified. Please request a new OTP." }, 400);
                }
                return response({ error: "Customer with this phone or email already exists" }, 400);
            }

            await env.DB.prepare(
                "INSERT INTO customers (id, name, phone, email, password, status, created_at, is_verified) VALUES (?, ?, ?, ?, ?, 'approved', ?, 0)"
            ).bind(id, name, phone, email || null, password || null, date).run();

            // Log activity
            await logActivity(env.DB, id, "signup_initiated", { method: email ? "email" : "phone" });

            // Generate OTP
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 mins

            await env.DB.prepare(
                "INSERT INTO otps (id, customer_id, code, type, expires_at, created_at) VALUES (?, ?, ?, 'phone_verification', ?, ?)"
            ).bind(crypto.randomUUID(), id, code, expires, new Date().toISOString()).run();

            // Send WhatsApp OTP
            await sendWhatsAppMessage(env.DB, {
                to: phone,
                type: 'otp',
                templateName: 'otp_verify', // Ensure this matches your Meta template
                parameters: [
                    { type: 'text', text: code }
                ]
            }, env);

            return response({ success: true, require_otp: true, user_id: id, message: "OTP sent via WhatsApp" });
        }

        else if (type === "verify_phone") {
            const { userId, code } = data as any;
            if (!userId || !code) return response({ error: "User ID and OTP required" }, 400);

            const otpRecord: any = await env.DB.prepare(
                "SELECT * FROM otps WHERE customer_id = ? AND code = ? AND type = 'phone_verification' AND expires_at > ? ORDER BY created_at DESC"
            ).bind(userId, code, new Date().toISOString()).first();

            if (!otpRecord) return response({ error: "Invalid or expired OTP" }, 400);

            // Mark user as verified
            await env.DB.prepare("UPDATE customers SET is_verified = 1 WHERE id = ?").bind(userId).run();
            // Delete used OTP
            await env.DB.prepare("DELETE FROM otps WHERE customer_id = ? AND type = 'phone_verification'").bind(userId).run();

            // Fetch user
            const customer = await env.DB.prepare("SELECT * FROM customers WHERE id = ?").bind(userId).first() as any;

            // Log activity
            await logActivity(env.DB, userId, "signup_verified");

            // Send Welcome Email if email exists
            if (customer?.email) {
                const brevoKey = env.BREVO_API_KEY;
                await sendEmail({
                    to: customer.email,
                    subject: "Welcome to ShopHub!",
                    html: welcomeTemplate(customer.name)
                }, brevoKey);
            }

            return response({ success: true, user: { id: customer.id, name: customer.name, phone: customer.phone, email: customer.email, status: customer.status, role: 'customer' } });
        }

        else if (type === "resend_otp") {
            const { userId } = data as any;
            const customer: any = await env.DB.prepare("SELECT * FROM customers WHERE id = ?").bind(userId).first();

            if (!customer) return response({ error: "User not found" }, 404);
            if (customer.is_verified === 1) return response({ error: "Account already verified" }, 400);

            // Generate new OTP
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 mins

            await env.DB.prepare(
                "INSERT INTO otps (id, customer_id, code, type, expires_at, created_at) VALUES (?, ?, ?, 'phone_verification', ?, ?)"
            ).bind(crypto.randomUUID(), userId, code, expires, new Date().toISOString()).run();

            // Send WhatsApp OTP
            await sendWhatsAppMessage(env.DB, {
                to: customer.phone,
                type: 'otp',
                templateName: 'otp_verify',
                parameters: [
                    { type: 'text', text: code }
                ]
            }, env);

            return response({ success: true, message: "OTP resent via WhatsApp" });
        }

        else if (type === "login") {

            // 1. Try Customer Login
            let customer: any = await env.DB.prepare("SELECT * FROM customers WHERE phone = ?").bind(phone).first();

            if (customer) {
                if (customer.status === 'suspended') {
                    return response({ error: "Your account has been suspended." }, 403);
                }

                if (customer.is_verified === 0) {
                    return response({ error: "Please verify your phone number", require_otp: true, user_id: customer.id }, 403);
                }

                // Verify Password if set
                if (customer.password && customer.password !== (data as any).password) {
                    return response({ error: "Invalid password" }, 401);
                }

                // Log Activity
                await logActivity(env.DB, customer.id, "login");

                return response({ success: true, user: { ...customer, role: 'customer' } });
            }

            // 2. Try Admin Login (in users table)
            const admin: any = await env.DB.prepare("SELECT * FROM users WHERE phone = ?").bind(phone).first();

            if (admin) {
                // If the user has a password in DB (schema updated), checking it.
                // Note: allow login if DB has no password (migration fallback) or check matching
                // Since this is a simple app, we are doing direct comparison.
                const reqPassword = (data as any).password;

                // If admin has a password set, verify it. 
                // If legacy admin with no password (null), we might want to allow or force reset.
                // For now, if admin.password exists, we MUST match it.
                if (admin.password && admin.password !== reqPassword) {
                    return response({ error: "Invalid credentials" }, 401);
                }

                return response({ success: true, user: { ...admin, role: 'admin' } });
            }

            return response({ error: "User not found" }, 404);
        }

        else if (type === "forgot_password") {
            const customer: any = await env.DB.prepare("SELECT * FROM customers WHERE email = ?").bind(email).first();
            if (!customer) return response({ error: "Email not registered" }, 404);

            const code = Math.floor(100000 + Math.random() * 900000).toString();
            const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 mins

            await env.DB.prepare(
                "INSERT INTO otps (id, customer_id, code, type, expires_at, created_at) VALUES (?, ?, ?, 'password_reset', ?, ?)"
            ).bind(crypto.randomUUID(), customer.id, code, expires, new Date().toISOString()).run();

            const brevoKey = env.BREVO_API_KEY;
            await sendEmail({
                to: email,
                subject: "Reset your ShopHub password",
                html: otpTemplate(code)
            }, brevoKey);

            return response({ success: true, message: "OTP sent to your email" });
        }

        else if (type === "reset_password") {
            const customer: any = await env.DB.prepare("SELECT * FROM customers WHERE email = ?").bind(email).first();
            if (!customer) return response({ error: "Email not found" }, 404);

            const otpRecord: any = await env.DB.prepare(
                "SELECT * FROM otps WHERE customer_id = ? AND code = ? AND type = 'password_reset' AND expires_at > ? ORDER BY created_at DESC"
            ).bind(customer.id, otp, new Date().toISOString()).first();

            if (!otpRecord) return response({ error: "Invalid or expired OTP" }, 400);

            await env.DB.prepare("UPDATE customers SET password = ? WHERE id = ?").bind(newPassword, customer.id).run();
            await env.DB.prepare("DELETE FROM otps WHERE customer_id = ?").bind(customer.id).run();

            await logActivity(env.DB, customer.id, "password_reset");

            return response({ success: true, message: "Password reset successful" });
        }

        return response({ error: "Invalid action" }, 400);

    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};
