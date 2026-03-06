-- Referrals Table
CREATE TABLE IF NOT EXISTS referrals (
    id TEXT PRIMARY KEY,
    referrer_id TEXT NOT NULL, -- The user who shared the code
    referee_phone TEXT NOT NULL, -- The new user who used the code
    order_id TEXT NOT NULL, -- The order where code was used
    status TEXT DEFAULT 'completed', -- 'pending', 'completed'
    reward_points INTEGER DEFAULT 500,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (referrer_id) REFERENCES customers(id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
