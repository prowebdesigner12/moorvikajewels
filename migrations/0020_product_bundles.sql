-- Create Bundles Table
CREATE TABLE IF NOT EXISTS bundles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL, -- Total bundle price
    original_price INTEGER, -- Sum of individual product prices
    discount_label TEXT, -- e.g. "Save ₹200"
    status TEXT DEFAULT 'active', -- active, inactive
    type TEXT DEFAULT 'fixed_combo', -- fixed_combo, buy_x_get_y
    image TEXT, -- Main bundle image
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create Bundle Items Table (Mapping products to bundles)
CREATE TABLE IF NOT EXISTS bundle_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bundle_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    variant_id TEXT,
    quantity INTEGER DEFAULT 1,
    FOREIGN KEY (bundle_id) REFERENCES bundles(id) ON DELETE CASCADE
);
