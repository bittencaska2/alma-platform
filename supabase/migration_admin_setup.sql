-- =====================================================
-- ADMIN MASTER SETUP
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Update user_type ENUM
-- Postgres doesn't allow 'IF NOT EXISTS' for adding enum values easily in standard syntax, 
-- but we can use a DO block to prevent errors if it already exists.
DO $$
BEGIN
    ALTER TYPE user_type ADD VALUE 'admin';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Promote the Master Email to Admin
-- We need to update both the public profile and the auth metadata for RLS to work smoothly
DO $$
DECLARE
    target_email TEXT := 'projetomeraki.psi@gmail.com';
    user_id UUID;
BEGIN
    -- Get the User ID
    SELECT id INTO user_id FROM auth.users WHERE email = target_email;

    IF user_id IS NOT NULL THEN
        -- Update Profile
        UPDATE profiles 
        SET user_type = 'admin' 
        WHERE id = user_id;

        -- Update Auth Metadata (Crucial for efficient RLS)
        UPDATE auth.users 
        SET raw_user_meta_data = 
            COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"user_type": "admin"}'::jsonb
        WHERE id = user_id;
        
        RAISE NOTICE 'User % promoted to Admin via SQL', target_email;
    ELSE
        RAISE NOTICE 'User % not found. Please sign up first.', target_email;
    END IF;
END $$;

-- 3. Create Admin RLS Policies (Bypass rules)
-- We check jwt metadata to avoid recursion queries

-- PROFILES
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    USING ( (auth.jwt() -> 'user_metadata' ->> 'user_type') = 'admin' );

DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
CREATE POLICY "Admins can update all profiles"
    ON profiles FOR UPDATE
    USING ( (auth.jwt() -> 'user_metadata' ->> 'user_type') = 'admin' );

DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;
CREATE POLICY "Admins can delete profiles"
    ON profiles FOR DELETE
    USING ( (auth.jwt() -> 'user_metadata' ->> 'user_type') = 'admin' );

-- PATIENTS
DROP POLICY IF EXISTS "Admins can view all patients" ON patients;
CREATE POLICY "Admins can view all patients"
    ON patients FOR SELECT
    USING ( (auth.jwt() -> 'user_metadata' ->> 'user_type') = 'admin' );

DROP POLICY IF EXISTS "Admins can update all patients" ON patients;
CREATE POLICY "Admins can update all patients"
    ON patients FOR UPDATE
    USING ( (auth.jwt() -> 'user_metadata' ->> 'user_type') = 'admin' );

DROP POLICY IF EXISTS "Admins can delete patients" ON patients;
CREATE POLICY "Admins can delete patients"
    ON patients FOR DELETE
    USING ( (auth.jwt() -> 'user_metadata' ->> 'user_type') = 'admin' );

DROP POLICY IF EXISTS "Admins can insert patients" ON patients;
CREATE POLICY "Admins can insert patients"
    ON patients FOR INSERT
    WITH CHECK ( (auth.jwt() -> 'user_metadata' ->> 'user_type') = 'admin' );

-- PSYCHOLOGISTS
DROP POLICY IF EXISTS "Admins can view all psychologists" ON psychologists;
CREATE POLICY "Admins can view all psychologists"
    ON psychologists FOR SELECT
    USING ( (auth.jwt() -> 'user_metadata' ->> 'user_type') = 'admin' );

DROP POLICY IF EXISTS "Admins can update all psychologists" ON psychologists;
CREATE POLICY "Admins can update all psychologists"
    ON psychologists FOR UPDATE
    USING ( (auth.jwt() -> 'user_metadata' ->> 'user_type') = 'admin' );

DROP POLICY IF EXISTS "Admins can delete psychologists" ON psychologists;
CREATE POLICY "Admins can delete psychologists"
    ON psychologists FOR DELETE
    USING ( (auth.jwt() -> 'user_metadata' ->> 'user_type') = 'admin' );

DROP POLICY IF EXISTS "Admins can insert psychologists" ON psychologists;
CREATE POLICY "Admins can insert psychologists"
    ON psychologists FOR INSERT
    WITH CHECK ( (auth.jwt() -> 'user_metadata' ->> 'user_type') = 'admin' );

-- APPOINTMENTS
DROP POLICY IF EXISTS "Admins can view all appointments" ON appointments;
CREATE POLICY "Admins can view all appointments"
    ON appointments FOR SELECT
    USING ( (auth.jwt() -> 'user_metadata' ->> 'user_type') = 'admin' );

DROP POLICY IF EXISTS "Admins can manage all appointments" ON appointments;
CREATE POLICY "Admins can manage all appointments"
    ON appointments FOR ALL
    USING ( (auth.jwt() -> 'user_metadata' ->> 'user_type') = 'admin' );

-- NOTIFY RELOAD
NOTIFY pgrst, 'reload schema';
