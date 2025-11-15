-- Migration: Add currency column to properties table
-- Date: 2024

-- Add currency column with default value 'RWF'
ALTER TABLE properties ADD COLUMN currency TEXT DEFAULT 'RWF';

-- Update existing records to have 'RWF' as default
UPDATE properties SET currency = 'RWF' WHERE currency IS NULL;


