-- Migration number: 0031 	 2024-03-03T00:00:00.000Z

-- Add missing columns to products table to support full Admin UI features
ALTER TABLE products ADD COLUMN track_quantity INTEGER DEFAULT 1;
ALTER TABLE products ADD COLUMN continue_selling_oos INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN status TEXT DEFAULT 'active';
ALTER TABLE products ADD COLUMN vendor TEXT;
ALTER TABLE products ADD COLUMN type TEXT;
ALTER TABLE products ADD COLUMN meta_title TEXT;
ALTER TABLE products ADD COLUMN meta_description TEXT;
ALTER TABLE products ADD COLUMN meta_keywords TEXT;
