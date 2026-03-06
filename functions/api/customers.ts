interface Env {
    DB: D1Database;
}

// Get Customer Details (Aggregated from Orders)
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
    const url = new URL(request.url);
    const email = url.searchParams.get("email");
    const id = url.searchParams.get("id");
    const adminMode = url.searchParams.get("admin") === "true";

    // CHECKOUT MODE: Public Lookup (Address Only)
    // Security: Only return non-sensitive info if phone/email matches
    const isCheckout = url.searchParams.get("checkout") === "true";
    if (isCheckout) {
        if (!email && !url.searchParams.get("phone")) {
            return new Response(JSON.stringify({ error: "Email or Phone required" }), { status: 400 });
        }

        const phone = url.searchParams.get("phone");
        const customer = await env.DB.prepare(`
            SELECT 
                customer_name as fullName,
                customer_email as email,
                customer_phone as phone,
                address,
                city,
                pincode,
                company_name as companyName,
                gst_number as gstNumber
            FROM orders
            WHERE (? IS NOT NULL AND customer_email = ?) 
               OR (? IS NOT NULL AND REPLACE(REPLACE(REPLACE(customer_phone, ' ', ''), '-', ''), '+91', '') LIKE '%' || ?)
            ORDER BY created_at DESC
        `).bind(email, email, phone, phone).first();

        if (!customer) {
            return new Response(JSON.stringify({ found: false }), { status: 404 });
        }

        return new Response(JSON.stringify({ found: true, data: customer }), {
            headers: { "Content-Type": "application/json" }
        });
    }

    if (!adminMode) {
        return new Response("Unauthorized", { status: 401 });
    }

    // List All Customers (Grouped by Email)
    if (!email && !id) {
        const customers = await env.DB.prepare(`
            SELECT 
                customer_email as email,
                MAX(customer_name) as name,
                MAX(customer_phone) as phone,
                COUNT(id) as total_orders,
                SUM(total_amount) as total_spent,
                MAX(created_at) as last_order_date
            FROM orders
            GROUP BY customer_email
            ORDER BY last_order_date DESC
        `).all();

        return new Response(JSON.stringify(customers.results), {
            headers: { "Content-Type": "application/json" }
        });
    }

    // Get Single Customer Details
    const customer = await env.DB.prepare(`
        SELECT 
            customer_email as email,
            MAX(customer_name) as name,
            MAX(customer_phone) as phone,
            MAX(address) as address,
            MAX(city) as city,
            MAX(pincode) as pincode,
            COUNT(id) as total_orders,
            SUM(total_amount) as total_spent,
            MAX(created_at) as last_order_date
        FROM orders
        WHERE customer_email = ? OR customer_phone = (SELECT phone FROM customers WHERE id = ?)
    `).bind(email, id).first();

    if (!customer) {
        return new Response(JSON.stringify({ error: "Customer not found" }), { status: 404 });
    }

    // Get Orders History
    const orders = await env.DB.prepare(`
        SELECT * FROM orders 
        WHERE customer_email = ? OR customer_phone = (SELECT phone FROM customers WHERE id = ?)
        ORDER BY created_at DESC
    `).bind(email, id).all();

    // Get Purchased Products Stats
    const products = await env.DB.prepare(`
        SELECT 
            oi.product_name, 
            COUNT(*) as count,
            SUM(oi.quantity) as total_quantity,
            SUM(oi.price * oi.quantity) as total_spent
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        WHERE o.customer_email = ? OR o.customer_phone = (SELECT phone FROM customers WHERE id = ?)
        GROUP BY oi.product_name
        ORDER BY count DESC
        LIMIT 10
    `).bind(email, id).all();

    // Get Activity Logs
    const activities = await env.DB.prepare(`
        SELECT * FROM activity_logs 
        WHERE customer_id = (SELECT id FROM customers WHERE email = ? OR id = ?)
        ORDER BY created_at DESC
    `).bind(email, id).all();

    return new Response(JSON.stringify({
        ...customer,
        orders: orders.results,
        top_products: products.results,
        activities: activities.results
    }), {
        headers: { "Content-Type": "application/json" }
    });
};
