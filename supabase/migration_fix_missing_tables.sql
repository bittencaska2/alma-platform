-- =====================================================
-- ALMA PLATFORM - FINAL MIGRATION: Ensure All Tables Exist
-- Run this in Supabase SQL Editor to fix missing table errors
-- =====================================================

-- 1. Ensure PROFILES table exists
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    user_type user_type NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    photo_url TEXT,
    whatsapp VARCHAR(20),
    accepted_terms BOOLEAN DEFAULT FALSE,
    accepted_terms_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Ensure PATIENTS table exists
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    address TEXT,
    age INTEGER CHECK (age >= 18),
    emergency_contact VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Ensure PSYCHOLOGISTS table exists
CREATE TABLE IF NOT EXISTS psychologists (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    crp VARCHAR(20) NOT NULL UNIQUE,
    bio TEXT,
    specialties JSONB DEFAULT '[]'::jsonb,
    session_price DECIMAL(10, 2) DEFAULT 160.00,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    years_of_experience INTEGER,
    education TEXT,
    education_year INTEGER,
    approach TEXT,
    filled_slots INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Ensure AVAILABILITY_SLOTS table exists
CREATE TABLE IF NOT EXISTS availability_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    psychologist_id UUID NOT NULL REFERENCES psychologists(id) ON DELETE CASCADE,
    day_of_week day_of_week NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_time_range CHECK (start_time < end_time),
    CONSTRAINT unique_slot UNIQUE (psychologist_id, day_of_week, start_time, end_time)
);

-- 5. Ensure APPOINTMENTS table exists
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    psychologist_id UUID NOT NULL REFERENCES psychologists(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status appointment_status DEFAULT 'pending',
    notes TEXT,
    cancellation_reason TEXT,
    transaction_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT no_double_booking UNIQUE (psychologist_id, scheduled_date, start_time)
);

-- 6. Ensure TRANSACTIONS table exists
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    patient_id UUID NOT NULL REFERENCES patients(id),
    psychologist_id UUID NOT NULL REFERENCES psychologists(id),
    gross_amount DECIMAL(10, 2) NOT NULL,
    psychologist_amount DECIMAL(10, 2) NOT NULL,
    platform_amount DECIMAL(10, 2) NOT NULL,
    social_donation DECIMAL(10, 2) NOT NULL,
    payment_status payment_status DEFAULT 'pending',
    payment_method VARCHAR(50),
    asaas_payment_id VARCHAR(255),
    asaas_split_id VARCHAR(255),
    package_weeks INTEGER,
    is_package_payment BOOLEAN DEFAULT FALSE,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Ensure CHAT_ROOMS table exists
CREATE TABLE IF NOT EXISTS chat_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    psychologist_id UUID NOT NULL REFERENCES psychologists(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    last_message_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_chat_room UNIQUE (patient_id, psychologist_id)
);

-- 8. Ensure MESSAGES table exists
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- 9. Add any missing columns to existing tables (Safety Net)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(20);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS accepted_terms BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS accepted_terms_at TIMESTAMP WITH TIME ZONE;

-- Psychologist missing columns fix
ALTER TABLE psychologists ADD COLUMN IF NOT EXISTS education_year INTEGER;
ALTER TABLE psychologists ADD COLUMN IF NOT EXISTS filled_slots INTEGER DEFAULT 0;
ALTER TABLE psychologists ADD COLUMN IF NOT EXISTS education TEXT;
ALTER TABLE psychologists ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE psychologists ADD COLUMN IF NOT EXISTS approach TEXT;
ALTER TABLE psychologists ADD COLUMN IF NOT EXISTS years_of_experience INTEGER;
ALTER TABLE psychologists ADD COLUMN IF NOT EXISTS specialties JSONB DEFAULT '[]'::jsonb;
ALTER TABLE psychologists ADD COLUMN IF NOT EXISTS session_price DECIMAL(10, 2) DEFAULT 160.00;

-- 10. Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE psychologists ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 11. Create basic RLS policies (if they don't exist, this might error so we wrap in DO block or just let user run separately. 
-- For simplicity, we assume if tables didn't exist, policies don't either. If tables existed, these won't be created unless we use IF NOT EXISTS which Postgres doesn't support easily for policies.)
-- SKIPPING POLICIES FOR NOW TO AVOID ERRORS ON EXISTING TABLES. Use schema.sql for policies if needed.
