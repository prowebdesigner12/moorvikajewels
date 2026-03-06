export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

export interface SMSOptions {
    to: string;
    message: string;
}

export interface WhatsAppOptions {
    to: string;
    type: 'otp' | 'order_confirmation' | 'order_update' | 'abandoned_cart_reminder';
    templateName: string;
    parameters: Array<{
        type: string;
        text?: string;
    }>;
}

/**
 * Send email using Brevo (Sendinblue) API
 */
export async function sendEmail(options: EmailOptions, apiKey: string) {
    if (!apiKey) {
        console.warn("BREVO_API_KEY is not set. Email not sent.");
        return false;
    }

    try {
        const res = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "api-key": apiKey,
            },
            body: JSON.stringify({
                sender: { name: "TopStore", email: "support@moorvikajewels.com" },
                to: [{ email: options.to }],
                subject: options.subject,
                htmlContent: options.html,
            }),
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error(`Brevo SMTP Error [${res.status}]:`, errorText);
            return false;
        }

        console.log(`Email successfully sent to ${options.to}`);
        return true;
    } catch (error) {
        console.error("Critical: Failed to send email via Brevo:", error);
        return false;
    }
}

/**
 * Send SMS using Twilio API (Mocked until credentials provided)
 */
export async function sendSMS(options: SMSOptions, env: any) {
    const accountSid = env.TWILIO_ACCOUNT_SID;
    const authToken = env.TWILIO_AUTH_TOKEN;
    const fromNumber = env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
        console.warn("Twilio credentials not set. SMS not sent.");
        // Log what would have been sent
        console.log(`[MOCK SMS] To: ${options.to}, Msg: ${options.message}`);
        return false;
    }

    try {
        const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
            method: "POST",
            headers: {
                "Authorization": `Basic ${btoa(`${accountSid}:${authToken}`)}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                To: options.to,
                From: fromNumber,
                Body: options.message,
            }),
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error(`Twilio Error [${res.status}]:`, errorText);
            return false;
        }

        console.log(`SMS successfully sent to ${options.to}`);
        return true;
    } catch (error) {
        console.error("Critical: Failed to send SMS via Twilio:", error);
        return false;
    }
}

/**
 * Send WhatsApp via Meta Cloud API or Local Bridge
 */
export async function sendWhatsAppMessage(
    db: D1Database,
    options: WhatsAppOptions,
    env: any
) {
    const token = env.WHATSAPP_TOKEN;
    const phoneId = env.WHATSAPP_PHONE_ID;
    const bridgeUrl = env.WHATSAPP_BRIDGE_URL; // Optional local bridge URL (e.g., http://localhost:3000)

    // Format phone number
    let cleanedPhone = options.to.replace(/\D/g, '');
    if (cleanedPhone.length === 10) {
        cleanedPhone = '91' + cleanedPhone;
    }

    // Try Local Bridge first if configured
    if (bridgeUrl) {
        try {
            console.log(`Sending WhatsApp via Local Bridge: ${bridgeUrl}/api/send`);
            const res = await fetch(`${bridgeUrl}/api/send`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    to: cleanedPhone,
                    templateName: options.templateName,
                    components: [
                        {
                            type: "body",
                            parameters: options.parameters
                        }
                    ]
                }),
            });

            if (res.ok) {
                console.log(`WhatsApp successfully sent via Local Bridge to ${cleanedPhone}`);
                return true;
            } else {
                console.warn(`Local Bridge failed with status ${res.status}. Falling back to direct Meta API.`);
            }
        } catch (bridgeErr) {
            console.error("Local Bridge connection error, falling back to direct Meta API:", bridgeErr);
        }
    }

    if (!token || !phoneId) {
        console.warn("WhatsApp credentials not set. WhatsApp message not sent.");
        console.log(`[MOCK WHATSAPP] To: ${cleanedPhone}, Type: ${options.type}`);
        return false;
    }

    try {
        const res = await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                to: cleanedPhone,
                type: "template",
                template: {
                    name: options.templateName,
                    language: {
                        code: "en_US"
                    },
                    components: [
                        {
                            type: "body",
                            parameters: options.parameters
                        }
                    ]
                }
            }),
        });

        const data = await res.json();
        const success = res.ok;

        if (!success) {
            console.error(`WhatsApp Error [${res.status}]:`, JSON.stringify(data));
        }

        // Log the message into D1 Database
        try {
            await db.prepare(`
                INSERT INTO whatsapp_logs (id, customer_phone, message_type, status, response_data, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            `).bind(
                crypto.randomUUID(),
                cleanedPhone,
                options.type,
                success ? 'sent' : 'failed',
                JSON.stringify(data),
                new Date().toISOString()
            ).run();
        } catch (dbErr) {
            console.error("Failed to insert WhatsApp log:", dbErr);
        }

        return success;
    } catch (error) {
        console.error("Critical: Failed to send WhatsApp message:", error);
        return false;
    }
}

/**
 * Log customer activity to DB
 */
export async function logActivity(
    db: D1Database,
    customerId: string,
    action: string,
    details: any = {}
) {
    try {
        const id = crypto.randomUUID();
        const date = new Date().toISOString();
        await db.prepare(
            "INSERT INTO activity_logs (id, customer_id, action, details, created_at) VALUES (?, ?, ?, ?, ?)"
        ).bind(id, customerId, action, JSON.stringify(details), date).run();
        return true;
    } catch (error) {
        console.error("Failed to log activity:", error);
        return false;
    }
}

// Templates
export const welcomeTemplate = (name: string) => `
  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
    <h2 style="color: #0F172A;">Welcome to TopStore, ${name}!</h2>
    <p>Thank you for joining us. We're excited to have you on board.</p>
    <div style="margin-top: 30px; padding: 20px; background: #F8FAFC; border-radius: 8px;">
      <p style="margin: 0;">Happy Shopping!</p>
      <p style="margin: 5px 0 0 0; font-weight: bold;">TopStore Team</p>
    </div>
  </div>
`;

export const orderConfirmationTemplate = (orderId: string, total: number) => `
  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
    <h2 style="color: #0F172A;">Thank you for your order!</h2>
    <p>We've received your order <strong>#${orderId}</strong> and are processing it.</p>
    <div style="margin: 20px 0; padding: 20px; background: #F8FAFC; border-radius: 8px;">
      <p style="margin: 0; font-size: 14px; color: #64748B;">Total Amount</p>
      <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #0F172A;">₹${total.toLocaleString()}</p>
    </div>
    <p>Track here: <a href="https://moorvikajewels.com/track-order?id=${orderId}">Track Order</a></p>
  </div>
`;

export const orderStatusTemplate = (orderId: string, status: string) => `
  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
    <h2 style="color: #0F172A;">Order Status Updated</h2>
    <p>Your order <strong>#${orderId}</strong> status is now: <strong>${status.toUpperCase()}</strong></p>
    <p>Check details: <a href="https://moorvikajewels.com/track-order?id=${orderId}">Track Order</a></p>
  </div>
`;

export const otpTemplate = (code: string) => `
  <div style="font-family: sans-serif; text-align: center; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
    <h2>Verification Code</h2>
    <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2563EB;">${code}</div>
    <p>Code expires in 10 minutes.</p>
  </div>
`;
