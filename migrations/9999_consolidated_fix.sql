-- Consolidated Migration to fix remote database missing information
-- This includes fixes for WhatsApp Logs, Abandoned Cart Automation, and Product Fields

-- 1. Fix Customers & WhatsApp Logs
ALTER TABLE customers ADD COLUMN is_verified INTEGER DEFAULT 0;
UPDATE customers SET is_verified = 1;

CREATE TABLE IF NOT EXISTS whatsapp_logs (
    id TEXT PRIMARY KEY,
    customer_phone TEXT NOT NULL,
    message_type TEXT NOT NULL,
    status TEXT NOT NULL,
    response_data TEXT,
    created_at TEXT NOT NULL
);

-- 2. Fix Abandoned Checkouts
ALTER TABLE abandoned_checkouts ADD COLUMN notification_sent_at TEXT;
ALTER TABLE abandoned_checkouts ADD COLUMN reminder_count INTEGER DEFAULT 0;

-- 3. Fix Product Columns
ALTER TABLE products ADD COLUMN track_quantity INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN continue_selling_oos INTEGER DEFAULT 0;
-- ALTER TABLE products ADD COLUMN status TEXT DEFAULT 'active'; -- Already exists
ALTER TABLE products ADD COLUMN vendor TEXT;
ALTER TABLE products ADD COLUMN type TEXT;
ALTER TABLE products ADD COLUMN meta_title TEXT;
ALTER TABLE products ADD COLUMN meta_description TEXT;
ALTER TABLE products ADD COLUMN meta_keywords TEXT;
