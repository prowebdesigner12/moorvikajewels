-- Migration: Loyalty Program
-- Points: ₹100 spent = 10 points
-- Tiers: Silver (0-500), Gold (501-2000), Platinum (2001+)

CREATE TABLE IF NOT EXISTS loyalty_points (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    points INTEGER NOT NULL,
    transaction_type TEXT NOT NULL, -- 'earned', 'redeemed'
    order_id TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS loyalty_tiers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tier_name TEXT NOT NULL UNIQUE,
    min_points INTEGER NOT NULL,
    max_points INTEGER,
    discount_percent INTEGER NOT NULL,
    benefits TEXT
);

-- Insert default tiers
INSERT OR IGNORE INTO loyalty_tiers (tier_name, min_points, max_points, discount_percent, benefits) VALUES
('Silver', 0, 500, 5, 'Early access to sales, Birthday discount'),
('Gold', 501, 2000, 10, 'Free shipping, Priority support, Exclusive deals'),
('Platinum', 2001, NULL, 15, 'VIP support, Special gifts, Maximum discounts');

-- Add loyalty columns to users table (if not exists)
-- ALTER TABLE users ADD COLUMN total_points INTEGER DEFAULT 0;
-- ALTER TABLE users ADD COLUMN loyalty_tier TEXT DEFAULT 'Silver';
