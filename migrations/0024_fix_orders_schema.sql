-- Migration number: 0024 	 2024-05-20T00:00:00.000Z
-- Fix missing payment_status in orders table
ALTER TABLE orders ADD COLUMN payment_status TEXT DEFAULT 'pending';
