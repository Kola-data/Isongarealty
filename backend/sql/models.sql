-- ==========================================================
-- SQLite schema for Real Estate: Users, Properties & Images
-- ==========================================================

-- -------------------------
-- Users Table
-- -------------------------
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user', -- user/admin
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------
-- Properties Table
-- -------------------------
CREATE TABLE IF NOT EXISTS properties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    type TEXT DEFAULT 'sale',        -- sale/rent
    status TEXT DEFAULT 'available', -- available/sold/rented
    bedrooms INTEGER DEFAULT 0,
    bathrooms INTEGER DEFAULT 0,
    garages INTEGER DEFAULT 0,
    area REAL DEFAULT 0,             -- in m²
    main_image TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------
-- Property Images Table
-- -------------------------
CREATE TABLE IF NOT EXISTS property_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(property_id) REFERENCES properties(id) ON DELETE CASCADE
);

-- DROP TABLE IF EXISTS requested_properties;

CREATE TABLE IF NOT EXISTS requested_properties (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  description TEXT,
  property_type TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  is_read INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);



-- -------------------------
-- Indexes for Performance
-- -------------------------
CREATE INDEX IF NOT EXISTS idx_images_property ON property_images(property_id);

-- ==========================================================
-- End of File
-- ==========================================================
