-- =====================================================
-- ALMA PLATFORM - MIGRATION: Dashboard Restructure
-- Run this in Supabase SQL Editor
-- =====================================================

-- Add WhatsApp field to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(20);

-- Add terms acceptance tracking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS accepted_terms BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS accepted_terms_at TIMESTAMP WITH TIME ZONE;

-- Add education year to psychologists
ALTER TABLE psychologists ADD COLUMN IF NOT EXISTS education_year INTEGER;

-- Add photo_url to profiles (Fix for "Could not find column" error)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Add filled_slots for psychologist capacity management (if not exists)
ALTER TABLE psychologists ADD COLUMN IF NOT EXISTS filled_slots INTEGER DEFAULT 0;

-- Create index for faster whatsapp lookups
CREATE INDEX IF NOT EXISTS idx_profiles_whatsapp ON profiles(whatsapp);

-- =====================================================
-- STORAGE BUCKET POLICY (Run in Storage section)
-- User will create 'avatars' bucket manually
-- =====================================================

-- RLS Policy for avatars bucket (apply via Supabase Dashboard > Storage > Policies)
-- Policy Name: "Users can upload their own avatar"
-- Allowed operation: INSERT
-- Policy definition: (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1])

-- Policy Name: "Users can update their own avatar"
-- Allowed operation: UPDATE  
-- Policy definition: (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1])

-- Policy Name: "Avatars are publicly viewable"
-- Allowed operation: SELECT
-- Policy definition: (bucket_id = 'avatars')

-- =====================================================
-- UPDATE EXISTING DATA (Optional cleanup)
-- =====================================================

-- Set default values for existing records
UPDATE profiles SET accepted_terms = FALSE WHERE accepted_terms IS NULL;
UPDATE psychologists SET filled_slots = 0 WHERE filled_slots IS NULL;
