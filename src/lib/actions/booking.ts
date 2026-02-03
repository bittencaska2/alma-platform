'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface BookSlotParams {
    psychologistId: string
    patientId: string
    bookingDate: string // YYYY-MM-DD
    startTime: string   // HH:MM
    endTime: string     // HH:MM
    sessionPrice?: number
}

interface BookSlotResult {
    success: boolean
    booking_id?: string
    error?: string
    message?: string
}

interface LockSlotParams {
    psychologistId: string
    patientId: string
    date: Date
    startTime: string
    endTime: string
}

interface LockSlotResult {
    success: boolean
    lockId?: string
    error?: string
    expiresAt?: Date
}

/**
 * Lock a time slot temporarily (15 minutes) to prevent double-booking
 * This should be called when user selects a time slot, before payment
 */
export async function lockSlot(params: LockSlotParams): Promise<LockSlotResult> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.id !== params.patientId) {
        return { success: false, error: 'Não autorizado' }
    }

    const bookingDate = params.date.toISOString().split('T')[0]
    const lockExpiry = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes from now

    try {
        // First, try to clean up any expired locks (optional, don't fail if RPC doesn't exist)
        const { error: cleanupError } = await supabase.rpc('cleanup_expired_locks')
        if (cleanupError && !cleanupError.message.includes('function')) {
            console.log('Cleanup locks warning:', cleanupError)
        }

        // Check if slot is already locked or confirmed
        const { data: existing, error: checkError } = await supabase
            .from('appointments')
            .select('id, status_lock, lock_expires_at')
            .eq('psychologist_id', params.psychologistId)
            .eq('scheduled_date', bookingDate)
            .eq('start_time', params.startTime)
            .single()

        if (existing) {
            // If slot exists and is confirmed, it's unavailable
            if (existing.status_lock === 'confirmed' || existing.status_lock === 'completed') {
                return {
                    success: false,
                    error: 'Horário indisponível. Este horário já foi confirmado.'
                }
            }

            // If slot is on hold and not expired, it's unavailable
            if (existing.status_lock === 'holding' && existing.lock_expires_at) {
                const expiryDate = new Date(existing.lock_expires_at)
                if (expiryDate > new Date()) {
                    return {
                        success: false,
                        error: 'Horário indisponível. Aguarde alguns minutos e tente novamente.'
                    }
                }
            }

            // If we get here, slot exists but is available (expired hold or available)
            // Update it to holding
            const { data: updated, error: updateError } = await supabase
                .from('appointments')
                .update({
                    status_lock: 'holding',
                    locked_at: new Date().toISOString(),
                    locked_by: params.patientId,
                    lock_expires_at: lockExpiry.toISOString(),
                    patient_id: params.patientId
                })
                .eq('id', existing.id)
                .select('id')
                .single()

            if (updateError) {
                return { success: false, error: 'Erro ao reservar horário' }
            }

            return {
                success: true,
                lockId: updated.id,
                expiresAt: lockExpiry
            }
        }

        // Slot doesn't exist yet, create it with holding status
        const { data: created, error: createError } = await supabase
            .from('appointments')
            .insert({
                patient_id: params.patientId,
                psychologist_id: params.psychologistId,
                scheduled_date: bookingDate,
                start_time: params.startTime,
                end_time: params.endTime,
                status_lock: 'holding',
                locked_at: new Date().toISOString(),
                locked_by: params.patientId,
                lock_expires_at: lockExpiry.toISOString(),
                status: 'pending' // Default appointment status
            })
            .select('id')
            .single()

        if (createError) {
            console.error('Lock slot error:', createError)
            if (createError.code === '23505') { // Unique violation - race condition
                return {
                    success: false,
                    error: 'Horário indisponível. Alguém acabou de reservar este horário.'
                }
            }
            return { success: false, error: createError.message }
        }

        return {
            success: true,
            lockId: created.id,
            expiresAt: lockExpiry
        }
    } catch (e: any) {
        console.error('Lock slot exception:', e)
        return { success: false, error: e.message || 'Erro inesperado ao reservar horário' }
    }
}


// Book a slot using the RPC function
export async function bookSlot(params: BookSlotParams): Promise<BookSlotResult> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Não autorizado' }
    }

    if (user.id !== params.patientId) {
        return { success: false, error: 'Não autorizado' }
    }

    // Try to call the RPC function
    const { data, error } = await supabase.rpc('book_slot', {
        p_psychologist_id: params.psychologistId,
        p_patient_id: params.patientId,
        p_booking_date: params.bookingDate,
        p_start_time: params.startTime,
        p_end_time: params.endTime,
        p_session_price: params.sessionPrice || 160.00
    })

    if (error) {
        console.error('Book slot RPC error:', error)

        // Fallback: Try direct insert if RPC doesn't exist
        if (error.message.includes('function') || error.message.includes('does not exist')) {
            return await bookSlotFallback(params)
        }

        return { success: false, error: error.message }
    }

    // RPC returns JSON
    const result = data as BookSlotResult

    if (result.success) {
        revalidatePath('/patient/appointments')
        revalidatePath('/psychologist/appointments')
    }

    return result
}

// Fallback booking method if RPC doesn't exist
async function bookSlotFallback(params: BookSlotParams): Promise<BookSlotResult> {
    const supabase = await createClient()

    // Check for existing booking
    const { data: existing } = await supabase
        .from('booking_intents')
        .select('id')
        .eq('psychologist_id', params.psychologistId)
        .eq('booking_date', params.bookingDate)
        .eq('start_time', params.startTime)
        .in('status', ['pending_payment', 'confirmed'])
        .single()

    if (existing) {
        return {
            success: false,
            error: 'Horário indisponível. Alguém acabou de reservar este horário.'
        }
    }

    // Create booking
    const { data, error } = await supabase
        .from('booking_intents')
        .insert({
            patient_id: params.patientId,
            psychologist_id: params.psychologistId,
            booking_date: params.bookingDate,
            start_time: params.startTime,
            end_time: params.endTime,
            session_price: params.sessionPrice || 160.00,
            status: 'pending_payment',
            expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString()
        })
        .select('id')
        .single()

    if (error) {
        console.error('Fallback booking error:', error)
        if (error.code === '23505') { // Unique violation
            return {
                success: false,
                error: 'Horário indisponível. Este horário já foi reservado.'
            }
        }
        return { success: false, error: error.message }
    }

    return {
        success: true,
        booking_id: data.id,
        message: 'Horário reservado! Complete o pagamento em 15 minutos.'
    }
}

// Get booking intent details
export async function getBookingIntent(bookingId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Não autorizado' }
    }

    // Get from database
    const { data, error } = await supabase
        .from('booking_intents')
        .select('*')
        .eq('id', bookingId)
        .single()

    if (error || !data) {
        // If table doesn't exist, try user metadata for stored bookings
        const metadata = user.user_metadata || {}
        const lastBooking = metadata.last_booking

        if (lastBooking && lastBooking.id === bookingId) {
            return { data: lastBooking }
        }

        return { error: 'Reserva não encontrada' }
    }

    // Check ownership
    if (data.patient_id !== user.id && data.psychologist_id !== user.id) {
        return { error: 'Não autorizado' }
    }

    return { data }
}

// Cancel a pending booking
export async function cancelBooking(bookingId: string): Promise<BookSlotResult> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Não autorizado' }
    }

    // Try RPC first
    const { data, error } = await supabase.rpc('cancel_booking', {
        p_booking_id: bookingId
    })

    if (error) {
        // Fallback: direct update
        const { error: updateError } = await supabase
            .from('booking_intents')
            .update({ status: 'cancelled' })
            .eq('id', bookingId)
            .eq('patient_id', user.id)
            .eq('status', 'pending_payment')

        if (updateError) {
            return { success: false, error: updateError.message }
        }

        return { success: true, message: 'Reserva cancelada' }
    }

    return data as BookSlotResult
}

// Get psychologist's available slots for a specific date
export async function getPsychologistSlots(psychologistId: string, date: string) {
    const supabase = await createClient()

    // Get the day of week (0-6, Sunday-Saturday)
    const dateObj = new Date(date + 'T00:00:00')
    const dayOfWeek = dateObj.getDay()

    // Try to get from user metadata first (psychologist's saved schedule)
    const { data: { user: psychologist } } = await supabase.auth.admin?.getUserById?.(psychologistId) || { data: { user: null } }

    let slots: any[] = []

    // Try database table
    try {
        const dayMap: { [key: number]: string } = {
            0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday',
            4: 'thursday', 5: 'friday', 6: 'saturday'
        }

        const { data } = await supabase
            .from('availability_slots')
            .select('*')
            .eq('psychologist_id', psychologistId)
            .eq('day_of_week', dayMap[dayOfWeek])
            .eq('is_active', true)

        if (data && data.length > 0) {
            slots = data
        }
    } catch (e) {
        // Table might not exist
    }

    // Get existing bookings for this date to filter out unavailable slots
    try {
        const { data: bookings } = await supabase
            .from('booking_intents')
            .select('start_time')
            .eq('psychologist_id', psychologistId)
            .eq('booking_date', date)
            .in('status', ['pending_payment', 'confirmed'])

        if (bookings && bookings.length > 0) {
            const bookedTimes = bookings.map(b => b.start_time)
            slots = slots.filter(s => !bookedTimes.includes(s.start_time))
        }
    } catch (e) {
        // Table might not exist
    }

    return slots
}
