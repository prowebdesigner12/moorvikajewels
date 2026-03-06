-- Migration: Add Notification Preferences to Customers
ALTER TABLE customers ADD COLUMN email_notifications INTEGER DEFAULT 1; -- 1 for true, 0 for false
ALTER TABLE customers ADD COLUMN sms_notifications INTEGER DEFAULT 0;   -- Default to 0 until configured
