-- =====================================================
-- FIX V3: ADMIN MASTER SETUP (Syntax Corrected)
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Handle user_type column constraints (Public Schema - Safe)
DO $$
BEGIN
    BEGIN
        ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_user_type_check;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    BEGIN
        ALTER TABLE profiles 
        ADD CONSTRAINT profiles_user_type_check 
        CHECK (user_type IN ('patient', 'psychologist', 'admin'));
    EXCEPTION WHEN OTHERS THEN 
        RAISE NOTICE 'Could not add check constraint, possibly incompatible data or column type.';
    END;
END $$;

-- 2. Promote the Master Email to Admin (Data Update - Safe)
DO $$
DECLARE
    target_email TEXT := 'projetomeraki.psi@gmail.com';
    user_id UUID;
BEGIN
    SELECT id INTO user_id FROM auth.users WHERE email = target_email;

    IF user_id IS NOT NULL THEN
        UPDATE profiles 
        SET user_type = 'admin' 
        WHERE id = user_id;

        UPDATE auth.users 
        SET raw_user_meta_data = 
            COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"user_type": "admin"}'::jsonb
        WHERE id = user_id;
        
        RAISE NOTICE 'SUCCESS: User % promoted to Admin.', target_email;
    ELSE
        RAISE NOTICE 'WARNING: User % not found. Please create the account first.', target_email;
    END IF;
END $$;

-- 3. Create Admin RLS Policies (Public Schema - Safe)

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

-- 4. STORAGE POLICIES
-- Wrapped in DO block to handle errors gracefully (Syntax Fixed)
DO $$
BEGIN
    BEGIN
        DROP POLICY IF EXISTS "Admins can manage all avatars" ON storage.objects;
        CREATE POLICY "Admins can manage all avatars"
        ON storage.objects
        FOR ALL
        USING (
            bucket_id = 'avatars' 
            AND (auth.jwt() -> 'user_metadata' ->> 'user_type') = 'admin'
        );
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Skipped Storage Policy: Permission denied or bucket issue. Please configure via Dashboard.';
    END;
END $$;

NOTIFY pgrst, 'reload schema';
