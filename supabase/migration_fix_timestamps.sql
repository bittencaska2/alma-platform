-- =====================================================
-- FIX: ADD MISSING TIMESTAMPS TO PSYCHOLOGISTS
-- Run this in Supabase SQL Editor
-- =====================================================

DO $$
BEGIN
    -- Add created_at if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'psychologists' AND column_name = 'created_at') THEN
        ALTER TABLE psychologists ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    -- Add updated_at if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'psychologists' AND column_name = 'updated_at') THEN
        ALTER TABLE psychologists ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    -- Same check for patients table (just in case)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'created_at') THEN
        ALTER TABLE patients ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'updated_at') THEN
        ALTER TABLE patients ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

NOTIFY pgrst, 'reload schema';
