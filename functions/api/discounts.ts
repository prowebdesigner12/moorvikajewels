interface Env {
    DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
    try {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");

        // If no code provided, return all discounts (Admin view)
        if (!code) {
            const { results } = await env.DB.prepare("SELECT * FROM discounts ORDER BY id DESC").all();
            return new Response(JSON.stringify(results), {
                headers: { "Content-Type": "application/json" },
            });
        }

        // 1. Check for standard discount code
        const discount: any = await env.DB.prepare("SELECT * FROM discounts WHERE code = ? AND status = 'active'").bind(code).first();

        if (discount) {
            // Check dates
            const now = new Date();
            if (discount.starts_at && new Date(discount.starts_at) > now) {
                return new Response(JSON.stringify({ error: "Discount not yet active" }), { status: 400 });
            }
            if (discount.ends_at && new Date(discount.ends_at) < now) {
                return new Response(JSON.stringify({ error: "Discount expired" }), { status: 400 });
            }
            if (discount.usage_limit && discount.used_count >= discount.usage_limit) {
                return new Response(JSON.stringify({ error: "Usage limit reached" }), { status: 400 });
            }

            return new Response(JSON.stringify(discount), {
                headers: { "Content-Type": "application/json" },
            });
        }

        // 2. Check for Referral Code (Format: Last4Digits + REF, e.g. 5678REF)
        if (code.endsWith("REF") && code.length >= 7) {
            const suffix = code.slice(0, -3); // Extract numbers
            // Find customer whose phone ends with this suffix
            // Find customer whose phone ends with this suffix
            const referrer: any = await env.DB.prepare("SELECT * FROM customers WHERE phone LIKE ?").bind(`%${suffix}`).first();

            if (referrer) {
                // Dynamic Referral Discount
                return new Response(JSON.stringify({
                    code: code.toUpperCase(),
                    type: 'fixed',
                    value: 100, // ₹100 OFF
                    min_amount: 500, // Min order ₹500
                    status: 'active',
                    is_referral: true,
                    referrer_id: referrer.id
                }), {
                    headers: { "Content-Type": "application/json" }
                });
            }
        }

        return new Response(JSON.stringify({ error: "Invalid discount code" }), { status: 404 });

    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
    try {
        const discount = await request.json() as any;
        const id = crypto.randomUUID();

        // Ensure unique code
        const existing = await env.DB.prepare("SELECT id FROM discounts WHERE code = ?").bind(discount.code).first();
        if (existing) {
            return new Response(JSON.stringify({ error: "Discount code already exists" }), { status: 400 });
        }

        await env.DB.prepare(`
            INSERT INTO discounts (id, code, type, value, status, usage_limit, min_amount, starts_at, ends_at, used_count)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
        `).bind(
            id,
            discount.code,
            discount.type,
            discount.value,
            discount.status || 'active',
            discount.usage_limit,
            discount.min_amount,
            discount.starts_at,
            discount.ends_at
        ).run();

        return new Response(JSON.stringify({ success: true, id }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};

export const onRequestPut: PagesFunction<Env> = async ({ request, env }) => {
    try {
        const url = new URL(request.url);
        const id = url.searchParams.get("id");
        if (!id) throw new Error("ID required for update");

        const discount = await request.json() as any;

        await env.DB.prepare(`
            UPDATE discounts 
            SET code=?, type=?, value=?, status=?, usage_limit=?, min_amount=?, starts_at=?, ends_at=?
            WHERE id=?
        `).bind(
            discount.code,
            discount.type,
            discount.value,
            discount.status,
            discount.usage_limit,
            discount.min_amount,
            discount.starts_at,
            discount.ends_at,
            id
        ).run();

        return new Response(JSON.stringify({ success: true, id }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};

export const onRequestDelete: PagesFunction<Env> = async ({ request, env }) => {
    try {
        const url = new URL(request.url);
        const id = url.searchParams.get("id");

        if (!id) throw new Error("ID required");

        await env.DB.prepare("DELETE FROM discounts WHERE id = ?").bind(id).run();

        return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};
