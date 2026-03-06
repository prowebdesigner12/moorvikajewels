-- Migration number: 0016 	 2024-05-01T00:00:00.000Z

CREATE TABLE IF NOT EXISTS abandoned_checkouts (
    id TEXT PRIMARY KEY,
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    items TEXT, -- JSON string of cart items
    total_amount REAL,
    status TEXT DEFAULT 'new', -- 'new', 'recovered', 'archived'
    c_count INTEGER DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
