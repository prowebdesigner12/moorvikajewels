-- Migration number: 0030 	 2024-03-03T00:00:00.000Z

-- Add tracking columns to abandoned_checkouts
ALTER TABLE abandoned_checkouts ADD COLUMN notification_sent_at TEXT;
ALTER TABLE abandoned_checkouts ADD COLUMN reminder_count INTEGER DEFAULT 0;
