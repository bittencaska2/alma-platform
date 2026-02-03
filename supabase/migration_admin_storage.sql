-- =====================================================
-- FIX: ADMIN STORAGE POLICIES (Safe Version)
-- Run this in Supabase SQL Editor
-- =====================================================

-- NOTE: We removed "ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY"
-- because it requires superuser permissions. RLS is enabled by default on Supabase Storage.

DO $$
BEGIN
    -- 1. Drop existing policy if it exists to avoid conflicts
    DROP POLICY IF EXISTS "Admins can manage all avatars" ON storage.objects;
    
    -- 2. Create the policy for Admins
    -- check_expiration is not needed here, just simple role check
    CREATE POLICY "Admins can manage all avatars"
    ON storage.objects
    FOR ALL
    USING (
        bucket_id = 'avatars' 
        AND (auth.jwt() -> 'user_metadata' ->> 'user_type') = 'admin'
    );
    
    RAISE NOTICE 'Storage policy created successfully.';

EXCEPTION WHEN OTHERS THEN
    -- If this fails, it means even Policy creation is restricted via SQL Editor for this table.
    RAISE NOTICE 'Could not create policy via SQL (Error: %).', SQLERRM;
    RAISE NOTICE 'PLEASE ACTION: Go to Supabase Dashboard > Storage > Policies > Avatars Bucket and add a policy allowing ALL operations for user_type = admin';
END $$;
