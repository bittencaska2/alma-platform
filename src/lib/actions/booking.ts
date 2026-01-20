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
