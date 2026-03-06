export interface ShiprocketOrder {
    order_id: string;
    order_date: string;
    pickup_location: string;
    billing_customer_name: string;
    billing_last_name?: string;
    billing_address: string;
    billing_address_2?: string;
    billing_city: string;
    billing_pincode: string;
    billing_state: string;
    billing_country: string;
    billing_email: string;
    billing_phone: string;
    shipping_is_billing: boolean;
    order_items: Array<{
        name: string;
        sku: string;
        units: number;
        selling_price: number;
        discount?: number;
        tax?: number;
        hsn?: number;
    }>;
    payment_method: 'Prepaid' | 'COD';
    sub_total: number;
    length: number;
    breadth: number;
    height: number;
    weight: number;
}

/**
 * Get Shiprocket Auth Token
 * Authenticates with standard API credentials (stored in env vars)
 */
export async function authenticateShiprocket(env: any): Promise<string | null> {
    const email = env.SHIPROCKET_EMAIL;
    const password = env.SHIPROCKET_PASSWORD;

    if (!email || !password) {
        console.warn("Missing Shiprocket credentials in environment variables.");
        return null; // The user hasn't configured them yet
    }

    try {
        const res = await fetch("https://apiv2.shiprocket.in/v1/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        if (!res.ok) {
            console.error("Shiprocket Login failed:", await res.text());
            return null;
        }

        const data: any = await res.json();
        return data.token;
    } catch (error) {
        console.error("Error authenticating to Shiprocket:", error);
        return null;
    }
}

/**
 * Creates an order in Shiprocket
 */
export async function createShiprocketOrder(token: string, orderData: ShiprocketOrder): Promise<any | null> {
    try {
        const res = await fetch("https://apiv2.shiprocket.in/v1/orders/create/adhoc", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(orderData)
        });

        if (!res.ok) {
            const errBody = await res.text();
            console.error(`Shiprocket Create Order Error [${res.status}]:`, errBody);
            throw new Error(`Shiprocket API Error: ${errBody}`);
        }

        return await res.json();
    } catch (error) {
        console.error("Failed to push order to Shiprocket:", error);
        return null;
    }
}
