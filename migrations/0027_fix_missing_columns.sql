-- Migration number: 0027 	 2024-04-05T00:00:00.000Z
ALTER TABLE products ADD COLUMN weight REAL DEFAULT 0;
ALTER TABLE products ADD COLUMN created_at TEXT;
ALTER TABLE products ADD COLUMN updated_at TEXT;
