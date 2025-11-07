-- Uploaddb Database Queries for pgAdmin4
-- ==========================================

-- 1. View all tables in the database
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. View structure of assets_asset table
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'assets_asset' 
ORDER BY ordinal_position;

-- 3. View all uploaded assets
SELECT 
    id,
    name,
    category,
    tags,
    file,
    uploaded_at,
    uploaded_by_id
FROM assets_asset 
ORDER BY uploaded_at DESC;

-- 4. Count assets by category
SELECT 
    category,
    COUNT(*) as count
FROM assets_asset 
GROUP BY category 
ORDER BY count DESC;

-- 5. View recent uploads (last 10)
SELECT 
    id,
    name,
    category,
    uploaded_at
FROM assets_asset 
ORDER BY uploaded_at DESC 
LIMIT 10;

-- 6. View all users
SELECT 
    id,
    username,
    email,
    is_superuser,
    date_joined
FROM auth_user 
ORDER BY date_joined;

-- 7. Check if any assets exist
SELECT COUNT(*) as total_assets FROM assets_asset;
