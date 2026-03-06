-- Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    customer_phone TEXT NOT NULL,
    product_id TEXT NOT NULL,
    variant_id TEXT,
    frequency TEXT NOT NULL, -- 'weekly', 'monthly', 'quarterly'
    status TEXT DEFAULT 'active', -- 'active', 'paused', 'cancelled'
    discount_percent INTEGER DEFAULT 10,
    next_billing_date DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Add subscription_id to orders to link recurring orders
ALTER TABLE orders ADD COLUMN subscription_id TEXT;
