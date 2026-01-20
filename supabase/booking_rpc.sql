-- =====================================================
-- ALMA PLATFORM - BOOKING FLOW SQL
-- Execute this in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- BOOKING INTENTS TABLE (Pre-reservations)
-- =====================================================

CREATE TABLE IF NOT EXISTS booking_intents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    psychologist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'pending_payment' CHECK (status IN ('pending_payment', 'confirmed', 'cancelled', 'expired')),
    session_price DECIMAL(10, 2) DEFAULT 160.00,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '15 minutes'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent double booking for same psychologist, date, time
    CONSTRAINT unique_booking UNIQUE (psychologist_id, booking_date, start_time)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_booking_intents_patient ON booking_intents(patient_id);
CREATE INDEX IF NOT EXISTS idx_booking_intents_psychologist ON booking_intents(psychologist_id);
CREATE INDEX IF NOT EXISTS idx_booking_intents_status ON booking_intents(status);
CREATE INDEX IF NOT EXISTS idx_booking_intents_date ON booking_intents(booking_date);

-- Enable RLS
ALTER TABLE booking_intents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own bookings"
    ON booking_intents FOR SELECT
    USING (auth.uid() = patient_id OR auth.uid() = psychologist_id);

CREATE POLICY "Patients can create bookings"
    ON booking_intents FOR INSERT
    WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Users can update own bookings"
    ON booking_intents FOR UPDATE
    USING (auth.uid() = patient_id OR auth.uid() = psychologist_id);

-- =====================================================
-- BOOK_SLOT RPC FUNCTION
-- Handles race conditions with row-level locking
-- =====================================================

CREATE OR REPLACE FUNCTION book_slot(
    p_psychologist_id UUID,
    p_patient_id UUID,
    p_booking_date DATE,
    p_start_time TIME,
    p_end_time TIME,
    p_session_price DECIMAL DEFAULT 160.00
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_existing_booking UUID;
    v_new_booking_id UUID;
BEGIN
    -- Check if user is authenticated
    IF auth.uid() IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Não autorizado');
    END IF;
    
    -- Check if patient is booking for themselves
    IF auth.uid() != p_patient_id THEN
        RETURN json_build_object('success', false, 'error', 'Não autorizado');
    END IF;
    
    -- Check if booking date is in the future
    IF p_booking_date < CURRENT_DATE THEN
        RETURN json_build_object('success', false, 'error', 'Data inválida');
    END IF;
    
    -- Lock and check for existing active booking (prevents race condition)
    SELECT id INTO v_existing_booking
    FROM booking_intents
    WHERE psychologist_id = p_psychologist_id
      AND booking_date = p_booking_date
      AND start_time = p_start_time
      AND status IN ('pending_payment', 'confirmed')
    FOR UPDATE SKIP LOCKED;
    
    -- If slot is already booked
    IF v_existing_booking IS NOT NULL THEN
        RETURN json_build_object('success', false, 'error', 'Horário indisponível. Alguém acabou de reservar este horário.');
    END IF;
    
    -- Create the booking intent
    INSERT INTO booking_intents (
        patient_id,
        psychologist_id,
        booking_date,
        start_time,
        end_time,
        session_price,
        status,
        expires_at
    ) VALUES (
        p_patient_id,
        p_psychologist_id,
        p_booking_date,
        p_start_time,
        p_end_time,
        p_session_price,
        'pending_payment',
        NOW() + INTERVAL '15 minutes'
    )
    RETURNING id INTO v_new_booking_id;
    
    -- Return success with booking ID
    RETURN json_build_object(
        'success', true,
        'booking_id', v_new_booking_id,
        'message', 'Horário reservado! Complete o pagamento em 15 minutos.'
    );
    
EXCEPTION
    WHEN unique_violation THEN
        RETURN json_build_object('success', false, 'error', 'Horário indisponível. Este horário já foi reservado.');
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', 'Erro ao reservar horário. Tente novamente.');
END;
$$;

-- =====================================================
-- CANCEL_BOOKING FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION cancel_booking(p_booking_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_booking_patient_id UUID;
BEGIN
    -- Get booking patient
    SELECT patient_id INTO v_booking_patient_id
    FROM booking_intents
    WHERE id = p_booking_id;
    
    -- Check if booking exists
    IF v_booking_patient_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Reserva não encontrada');
    END IF;
    
    -- Check if user owns the booking
    IF auth.uid() != v_booking_patient_id THEN
        RETURN json_build_object('success', false, 'error', 'Não autorizado');
    END IF;
    
    -- Cancel the booking
    UPDATE booking_intents
    SET status = 'cancelled', updated_at = NOW()
    WHERE id = p_booking_id AND status = 'pending_payment';
    
    RETURN json_build_object('success', true, 'message', 'Reserva cancelada');
END;
$$;

-- =====================================================
-- AUTO-EXPIRE OLD BOOKINGS (Optional Cron Job)
-- Run: SELECT expire_old_bookings();
-- =====================================================

CREATE OR REPLACE FUNCTION expire_old_bookings()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE booking_intents
    SET status = 'expired', updated_at = NOW()
    WHERE status = 'pending_payment'
      AND expires_at < NOW();
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$;
