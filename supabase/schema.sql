-- =====================================================
-- ALMA PLATFORM - SUPABASE DATABASE SCHEMA
-- Marketplace de Terapia Online
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE user_type AS ENUM ('patient', 'psychologist');
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE day_of_week AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');

-- =====================================================
-- PROFILES TABLE (Common user data)
-- =====================================================

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    user_type user_type NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PATIENTS TABLE (Patient-specific data)
-- =====================================================

CREATE TABLE patients (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    address TEXT,
    age INTEGER CHECK (age >= 18),
    emergency_contact VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PSYCHOLOGISTS TABLE (Psychologist-specific data)
-- =====================================================

CREATE TABLE psychologists (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    crp VARCHAR(20) NOT NULL UNIQUE, -- CRP obrigatório e único
    bio TEXT,
    specialties JSONB DEFAULT '[]'::jsonb, -- Array of specialties
    session_price DECIMAL(10, 2) DEFAULT 160.00, -- Valor fixo R$160
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    years_of_experience INTEGER,
    education TEXT,
    approach TEXT, -- Abordagem terapêutica
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- AVAILABILITY SLOTS (Psychologist availability)
-- =====================================================

CREATE TABLE availability_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    psychologist_id UUID NOT NULL REFERENCES psychologists(id) ON DELETE CASCADE,
    day_of_week day_of_week NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure start time is before end time
    CONSTRAINT valid_time_range CHECK (start_time < end_time),
    -- Unique constraint for psychologist + day + time
    CONSTRAINT unique_slot UNIQUE (psychologist_id, day_of_week, start_time, end_time)
);

-- =====================================================
-- APPOINTMENTS TABLE
-- =====================================================

CREATE TABLE appointments (
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
    
    -- Prevent double booking
    CONSTRAINT no_double_booking UNIQUE (psychologist_id, scheduled_date, start_time)
);

-- =====================================================
-- TRANSACTIONS TABLE (Financial with Split)
-- =====================================================

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    patient_id UUID NOT NULL REFERENCES patients(id),
    psychologist_id UUID NOT NULL REFERENCES psychologists(id),
    
    -- Valores financeiros
    gross_amount DECIMAL(10, 2) NOT NULL, -- Valor bruto (ex: R$160)
    psychologist_amount DECIMAL(10, 2) NOT NULL, -- 80% para psicólogo (R$128)
    platform_amount DECIMAL(10, 2) NOT NULL, -- 20% para plataforma (R$32)
    social_donation DECIMAL(10, 2) NOT NULL, -- 1% para doação (R$1.60)
    
    -- Status e métodos
    payment_status payment_status DEFAULT 'pending',
    payment_method VARCHAR(50), -- pix, credit_card, etc
    
    -- Integração Asaas
    asaas_payment_id VARCHAR(255),
    asaas_split_id VARCHAR(255),
    
    -- Metadata
    package_weeks INTEGER, -- 4 ou 5 semanas
    is_package_payment BOOLEAN DEFAULT FALSE,
    
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CHAT ROOMS TABLE
-- =====================================================

CREATE TABLE chat_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    psychologist_id UUID NOT NULL REFERENCES psychologists(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    last_message_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- One room per patient-psychologist pair
    CONSTRAINT unique_chat_room UNIQUE (patient_id, psychologist_id)
);

-- =====================================================
-- MESSAGES TABLE (Chat Messages)
-- =====================================================

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_profiles_user_type ON profiles(user_type);
CREATE INDEX idx_profiles_email ON profiles(email);

CREATE INDEX idx_psychologists_crp ON psychologists(crp);
CREATE INDEX idx_psychologists_specialties ON psychologists USING GIN(specialties);
CREATE INDEX idx_psychologists_is_active ON psychologists(is_active);

CREATE INDEX idx_availability_psychologist ON availability_slots(psychologist_id);
CREATE INDEX idx_availability_day ON availability_slots(day_of_week);

CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_psychologist ON appointments(psychologist_id);
CREATE INDEX idx_appointments_date ON appointments(scheduled_date);
CREATE INDEX idx_appointments_status ON appointments(status);

CREATE INDEX idx_transactions_patient ON transactions(patient_id);
CREATE INDEX idx_transactions_psychologist ON transactions(psychologist_id);
CREATE INDEX idx_transactions_status ON transactions(payment_status);

CREATE INDEX idx_messages_room ON messages(room_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_sent_at ON messages(sent_at);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to calculate split amounts
CREATE OR REPLACE FUNCTION calculate_split(gross DECIMAL)
RETURNS TABLE (
    psychologist_amount DECIMAL,
    platform_amount DECIMAL,
    social_donation DECIMAL
) AS $$
BEGIN
    RETURN QUERY SELECT 
        gross * 0.80 as psychologist_amount,
        gross * 0.20 as platform_amount,
        gross * 0.01 as social_donation;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_psychologists_updated_at
    BEFORE UPDATE ON psychologists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE psychologists ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Psychologists policies (public viewing for search)
CREATE POLICY "Anyone can view active psychologists"
    ON psychologists FOR SELECT
    USING (is_active = true);

CREATE POLICY "Psychologists can update own record"
    ON psychologists FOR UPDATE
    USING (auth.uid() = id);

-- Availability policies
CREATE POLICY "Anyone can view availability"
    ON availability_slots FOR SELECT
    USING (is_active = true);

CREATE POLICY "Psychologists can manage own availability"
    ON availability_slots FOR ALL
    USING (auth.uid() = psychologist_id);

-- Appointments policies
CREATE POLICY "Users can view own appointments"
    ON appointments FOR SELECT
    USING (auth.uid() = patient_id OR auth.uid() = psychologist_id);

CREATE POLICY "Patients can create appointments"
    ON appointments FOR INSERT
    WITH CHECK (auth.uid() = patient_id);

-- Chat policies
CREATE POLICY "Users can view own chat rooms"
    ON chat_rooms FOR SELECT
    USING (auth.uid() = patient_id OR auth.uid() = psychologist_id);

CREATE POLICY "Users can view messages in their rooms"
    ON messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM chat_rooms 
            WHERE chat_rooms.id = messages.room_id 
            AND (chat_rooms.patient_id = auth.uid() OR chat_rooms.psychologist_id = auth.uid())
        )
    );

CREATE POLICY "Users can send messages in their rooms"
    ON messages FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM chat_rooms 
            WHERE chat_rooms.id = room_id 
            AND (chat_rooms.patient_id = auth.uid() OR chat_rooms.psychologist_id = auth.uid())
        )
    );

-- =====================================================
-- SAMPLE DATA FOR TESTING
-- =====================================================

-- Note: Run this after creating users in auth.users
-- This is just a template for inserting test data

/*
-- Insert sample psychologist profile
INSERT INTO profiles (id, user_type, full_name, email, phone)
VALUES ('uuid-here', 'psychologist', 'Dr. Maria Silva', 'maria@example.com', '21999999999');

INSERT INTO psychologists (id, crp, bio, specialties, session_price)
VALUES (
    'uuid-here', 
    '05/12345', 
    'Psicóloga clínica com 10 anos de experiência...',
    '["Ansiedade", "Depressão", "Terapia de Casal"]'::jsonb,
    160.00
);

-- Insert availability
INSERT INTO availability_slots (psychologist_id, day_of_week, start_time, end_time)
VALUES 
    ('uuid-here', 'monday', '09:00', '17:00'),
    ('uuid-here', 'wednesday', '09:00', '17:00'),
    ('uuid-here', 'friday', '09:00', '17:00');
*/
