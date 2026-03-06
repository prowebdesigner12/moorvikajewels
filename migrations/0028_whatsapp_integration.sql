-- Migration number: 0028 	 2024-03-01T00:00:00.000Z

-- Add verification status to customers
ALTER TABLE customers ADD COLUMN is_verified INTEGER DEFAULT 0;

-- Set existing customers as verified so they don't get locked out
UPDATE customers SET is_verified = 1;

-- Create WhatsApp Logs table
CREATE TABLE IF NOT EXISTS whatsapp_logs (
    id TEXT PRIMARY KEY,
    customer_phone TEXT NOT NULL,
    message_type TEXT NOT NULL, -- e.g. 'otp', 'order_confirmation', 'order_update'
    status TEXT NOT NULL, -- 'sent', 'failed'
    response_data TEXT, -- Store JSON response from Meta API for debugging
    created_at TEXT NOT NULL
);
