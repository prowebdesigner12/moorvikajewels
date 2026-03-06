interface Env {
    DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
    try {
        // 1. Total Revenue & Orders
        const todayStr = new Date().toISOString().split('T')[0];
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        const totals: any = await env.DB.prepare(`
            SELECT 
                COUNT(*) as total_orders, 
                SUM(CASE WHEN status != 'cancelled' THEN total_amount ELSE 0 END) as total_revenue,
                SUM(CASE WHEN status IN ('pending', 'processing') THEN 1 ELSE 0 END) as active_orders,
                SUM(CASE WHEN substr(created_at, 1, 10) = ? AND status != 'cancelled' THEN total_amount ELSE 0 END) as today_revenue,
                SUM(CASE WHEN substr(created_at, 1, 10) = ? THEN 1 ELSE 0 END) as today_orders,
                SUM(CASE WHEN substr(created_at, 1, 10) = ? AND status != 'cancelled' THEN total_amount ELSE 0 END) as yesterday_revenue,
                SUM(CASE WHEN substr(created_at, 1, 10) = ? THEN 1 ELSE 0 END) as yesterday_orders
            FROM orders
        `).bind(todayStr, todayStr, yesterdayStr, yesterdayStr).first();

        // 2. Payment Method Stats
        const paymentMethods: any = await env.DB.prepare(`
            SELECT payment_method, COUNT(*) as count 
            FROM orders 
            GROUP BY payment_method
        `).all();

        // 3. Sales Over Time (Last 7 Days)
        // Note: D1/SQLite date handling can be tricky. Assuming ISO string.
        const salesOverTime: any = await env.DB.prepare(`
            SELECT 
                substr(created_at, 1, 10) as date, 
                SUM(total_amount) as amount,
                COUNT(*) as count
            FROM orders 
            WHERE status != 'cancelled'
            GROUP BY date
            ORDER BY date DESC
            LIMIT 7
        `).all();

        // 4. Top Products (Need to join order_items)
        const topProducts: any = await env.DB.prepare(`
            SELECT 
                product_name, 
                SUM(quantity) as sold
            FROM order_items
            GROUP BY product_name
            ORDER BY sold DESC
            LIMIT 5
        `).all();

        // 5. Low Stock Alert
        const lowStock: any = await env.DB.prepare(`
            SELECT id, name, stock, image 
            FROM products 
            WHERE stock < 10 AND stock IS NOT NULL
            ORDER BY stock ASC
            LIMIT 5
        `).all();

        // 6. Customer Lifetime Value (Top 5 Spenders)
        const topCustomers: any = await env.DB.prepare(`
            SELECT customer_name, customer_phone, SUM(total_amount) as total_spend, COUNT(*) as order_count 
            FROM orders 
            WHERE status != 'cancelled' 
            GROUP BY customer_phone 
            ORDER BY total_spend DESC 
            LIMIT 5
        `).all();

        // 7. Regional Sales (By City)
        const regionalSales: any = await env.DB.prepare(`
            SELECT city, SUM(total_amount) as revenue, COUNT(*) as orders 
            FROM orders 
            WHERE status != 'cancelled' 
            GROUP BY city 
            ORDER BY revenue DESC 
            LIMIT 5
        `).all();

        // 8. Inventory Prediction (Fastest Selling)
        // Products with sales in last 7 days and low stock relative to velocity
        const inventoryVelocity: any = await env.DB.prepare(`
            SELECT 
                p.name, 
                p.stock,
                SUM(oi.quantity) as units_sold_7d
            FROM products p
            JOIN order_items oi ON p.id = oi.product_id
            JOIN orders o ON oi.order_id = o.id
            WHERE o.created_at >= date('now', '-7 days')
            AND o.status != 'cancelled'
            GROUP BY p.id
            ORDER BY units_sold_7d DESC
            LIMIT 5
        `).all();

        // 9. Recent Orders (Latest 5)
        const recentOrders: any = await env.DB.prepare(`
            SELECT id, customer_name, total_amount, status, substr(created_at, 1, 10) as date
            FROM orders
            ORDER BY created_at DESC
            LIMIT 5
        `).all();

        // 10. Monthly Sales (Current Year)
        const monthlySales: any = await env.DB.prepare(`
            SELECT 
                CASE substr(created_at, 6, 2)
                    WHEN '01' THEN 'Jan' WHEN '02' THEN 'Feb' WHEN '03' THEN 'Mar'
                    WHEN '04' THEN 'Apr' WHEN '05' THEN 'May' WHEN '06' THEN 'Jun'
                    WHEN '07' THEN 'Jul' WHEN '08' THEN 'Aug' WHEN '09' THEN 'Sep'
                    WHEN '10' THEN 'Oct' WHEN '11' THEN 'Nov' WHEN '12' THEN 'Dec'
                END as name,
                SUM(total_amount) as total
            FROM orders
            WHERE substr(created_at, 1, 4) = strftime('%Y', 'now')
            AND status != 'cancelled'
            GROUP BY name
            ORDER BY substr(created_at, 6, 2) ASC
        `).all();

        // 11. Simple Forecasting (Next 7 Days based on last 7 days avg)
        const salesResults = salesOverTime.results || [];
        const last7DaysTotal = salesResults.reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0);
        const last7DaysAvg = salesResults.length > 0 ? last7DaysTotal / 7 : 0;
        const forecastValue = last7DaysAvg * 7;

        return new Response(JSON.stringify({
            totals,
            paymentMethods: paymentMethods.results,
            salesOverTime: salesResults,
            topProducts: topProducts.results,
            lowStock: lowStock.results,
            topCustomers: topCustomers.results,
            regionalSales: regionalSales.results,
            inventoryVelocity: inventoryVelocity.results,
            recentOrders: recentOrders.results,
            monthlySales: monthlySales.results,
            forecast: {
                next7Days: Math.round(forecastValue),
                dailyAvg: Math.round(last7DaysAvg)
            }
        }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};
