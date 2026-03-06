-- Migration number: 0001 	 2024-04-05T00:00:00.000Z

-- Create Inquiries Table
CREATE TABLE IF NOT EXISTS inquiries (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    mobile TEXT NOT NULL,
    date TEXT NOT NULL,
    initial_query TEXT,
    status TEXT NOT NULL DEFAULT 'New'
);

-- Create Products Table
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    original_price INTEGER,
    category TEXT NOT NULL,
    rating REAL DEFAULT 0,
    reviews INTEGER DEFAULT 0,
    images TEXT,  -- JSON Array of image URLs
    variants TEXT, -- JSON Array of variant objects
    tags TEXT,     -- JSON Array of tags
    slug TEXT,
    meta_title TEXT,
    meta_description TEXT,
    meta_keywords TEXT,
    status TEXT DEFAULT 'active', -- active, draft, archived
    vendor TEXT,
    type TEXT,
    weight REAL,
    track_quantity INTEGER DEFAULT 1,
    continue_selling_oos INTEGER DEFAULT 0
);

-- Create Collections Table
CREATE TABLE IF NOT EXISTS collections (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image TEXT,
    slug TEXT,
    type TEXT DEFAULT 'manual', -- manual, automated
    products TEXT -- JSON Array of Product IDs
);

-- Create Discounts Table
CREATE TABLE IF NOT EXISTS discounts (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL, -- percentage, fixed_amount
    value REAL NOT NULL, -- e.g. 20 (for 20% or $20)
    status TEXT DEFAULT 'active', -- active, expired
    usage_limit INTEGER,
    min_amount REAL,
    starts_at TEXT,
    ends_at TEXT,
    used_count INTEGER DEFAULT 0
);

-- Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    role TEXT DEFAULT 'customer', -- admin, customer
    created_at TEXT NOT NULL
);
