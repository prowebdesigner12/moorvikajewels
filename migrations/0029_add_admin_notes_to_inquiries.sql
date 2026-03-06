-- Migration number: 0029 	 2024-05-15T00:00:00.000Z

-- Add admin_notes to Inquiries Table
ALTER TABLE inquiries ADD COLUMN admin_notes TEXT;
