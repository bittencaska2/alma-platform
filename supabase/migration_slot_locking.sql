-- =====================================================
-- BOOKING SLOT LOCKING - DATABASE MIGRATION
-- Run this in Supabase SQL Editor
-- =====================================================

-- Add slot locking fields to appointments table
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS status_lock VARCHAR(20) DEFAULT 'available';
-- Possible values: 'available', 'holding', 'confirmed', 'completed', 'cancelled'

COMMENT ON COLUMN appointments.status_lock IS 'Lock status for preventing double-booking: available, holding (temp 15min), confirmed, completed, cancelled';

ALTER TABLE appointments ADD COLUMN IF NOT EXISTS locked_at TIMESTAMP WITH TIME ZONE;
COMMENT ON COLUMN appointments.locked_at IS 'Timestamp when the slot was locked/held';

ALTER TABLE appointments ADD COLUMN IF NOT EXISTS locked_by UUID REFERENCES profiles(id);
COMMENT ON COLUMN appointments.locked_by IS 'User ID who locked this slot';

ALTER TABLE appointments ADD COLUMN IF NOT EXISTS lock_expires_at TIMESTAMP WITH TIME ZONE;
COMMENT ON COLUMN appointments.lock_expires_at IS 'Expiration time for temporary holding locks (15 minutes from locked_at)';

-- Create index for efficient lock queries
CREATE INDEX IF NOT EXISTS idx_appointments_lock_status 
ON appointments(status_lock, lock_expires_at)
WHERE status_lock IN ('holding', 'available');

COMMENT ON INDEX idx_appointments_lock_status IS 'Efficient queries for checking available slots and cleaning expired locks';

-- Create index for patient lookups
CREATE INDEX IF NOT EXISTS idx_appointments_patient_status
ON appointments(patient_id, status_lock)
WHERE status_lock != 'cancelled';

-- Function to automatically clean up expired locks
CREATE OR REPLACE FUNCTION cleanup_expired_locks()
RETURNS VOID AS $$
BEGIN
    UPDATE appointments
    SET status_lock = 'available',
        locked_by = NULL,
        locked_at = NULL,
        lock_expires_at = NULL
    WHERE status_lock = 'holding'
    AND lock_expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_expired_locks IS 'Releases slots that have been held for more than 15 minutes without payment';

-- Optional: Create a scheduled job to clean up expired locks every 5 minutes
-- (This requires pg_cron extension - enable in Supabase dashboard if needed)
-- SELECT cron.schedule(
--     'cleanup-expired-booking-locks',
--     '*/5 * * * *',  -- Every 5 minutes
--     $$SELECT cleanup_expired_locks();$$
-- );

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
