import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CheckoutPage } from '@/components/patient/CheckoutPage'

interface PageProps {
    params: Promise<{ bookingId: string }>
}

export default async function Checkout({ params }: PageProps) {
    const resolvedParams = await params
    const bookingId = resolvedParams.bookingId

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Try to get booking from database
    let booking: any = null

    try {
        const { data } = await supabase
            .from('booking_intents')
            .select('*')
            .eq('id', bookingId)
            .single()

        if (data) {
            booking = data

            // Get psychologist info
            try {
                const { data: psychProfile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', data.psychologist_id)
                    .single()

                if (psychProfile) {
                    booking.psychologist = {
                        fullName: psychProfile.full_name,
                        photoUrl: psychProfile.photo_url,
                    }
                }

                const { data: psychData } = await supabase
                    .from('psychologists')
                    .select('crp')
                    .eq('id', data.psychologist_id)
                    .single()

                if (psychData) {
                    booking.psychologist = {
                        ...booking.psychologist,
                        crp: psychData.crp,
                    }
                }
            } catch (e) {
                // Tables might not exist
            }
        }
    } catch (e) {
        // Table might not exist
    }

    // If booking not found in DB, check user metadata (fallback for demo)
    if (!booking) {
        const metadata = user.user_metadata || {}
        if (metadata.last_booking?.id === bookingId) {
            booking = metadata.last_booking
        }
    }

    // If still no booking, redirect back
    if (!booking) {
        redirect('/patient/dashboard')
    }

    // Check if user owns this booking
    if (booking.patient_id !== user.id) {
        redirect('/patient/dashboard')
    }

    return (
        <CheckoutPage
            booking={{
                id: booking.id,
                psychologistId: booking.psychologist_id,
                psychologistName: booking.psychologist?.fullName || 'Psicólogo',
                psychologistCrp: booking.psychologist?.crp || '',
                psychologistPhoto: booking.psychologist?.photoUrl || null,
                bookingDate: booking.booking_date,
                startTime: booking.start_time,
                endTime: booking.end_time,
                sessionPrice: booking.session_price || 160,
                status: booking.status,
                expiresAt: booking.expires_at,
            }}
        />
    )
}
