-- Create Wholesale Pricing Tiers Table
CREATE TABLE IF NOT EXISTS wholesale_tiers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id TEXT NOT NULL,
    min_quantity INTEGER NOT NULL,
    price INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Add B2B fields to orders table
ALTER TABLE orders ADD COLUMN company_name TEXT;
ALTER TABLE orders ADD COLUMN gst_number TEXT;
ALTER TABLE orders ADD COLUMN is_b2b INTEGER DEFAULT 0; -- 0 for Retail, 1 for B2B
