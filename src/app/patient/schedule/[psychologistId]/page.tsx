import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PsychologistBooking } from '@/components/patient/PsychologistBooking'

interface PageProps {
    params: Promise<{ psychologistId: string }>
}

export default async function SchedulePsychologistPage({ params }: PageProps) {
    const resolvedParams = await params
    const psychologistId = resolvedParams.psychologistId

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Get psychologist info
    let psychologist: any = null

    // Try database first
    try {
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', psychologistId)
            .single()

        if (profile) {
            psychologist = {
                id: psychologistId,
                fullName: profile.full_name,
                photoUrl: profile.photo_url,
                phone: profile.phone,
            }

            // Try to get psychologist-specific data
            const { data: psychData } = await supabase
                .from('psychologists')
                .select('*')
                .eq('id', psychologistId)
                .single()

            if (psychData) {
                psychologist = {
                    ...psychologist,
                    crp: psychData.crp,
                    bio: psychData.bio,
                    specialties: psychData.specialties || [],
                    sessionPrice: psychData.session_price || 160,
                    yearsOfExperience: psychData.years_of_experience,
                }
            }
        }
    } catch (e) {
        // Tables might not exist
    }

    // If no database data, use a fallback for demo
    if (!psychologist) {
        psychologist = {
            id: psychologistId,
            fullName: 'Psicólogo',
            crp: '',
            bio: '',
            specialties: [],
            sessionPrice: 160,
            photoUrl: null,
        }
    }

    // Get available slots for the psychologist
    let availableSlots: any[] = []

    try {
        const { data: slots } = await supabase
            .from('availability_slots')
            .select('*')
            .eq('psychologist_id', psychologistId)
            .eq('is_active', true)

        availableSlots = slots || []
    } catch (e) {
        // Table might not exist, use default schedule
    }

    // If no slots from database, create default ones for demo
    if (availableSlots.length === 0) {
        // Default: Monday to Friday, 9am to 6pm
        const defaultSlots = []
        const times = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00']
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']

        for (const day of days) {
            for (const time of times) {
                const [hour, min] = time.split(':')
                const endHour = parseInt(hour)
                defaultSlots.push({
                    id: `${day}-${time}`,
                    day_of_week: day,
                    start_time: time,
                    end_time: `${endHour}:50`,
                    is_active: true,
                })
            }
        }
        availableSlots = defaultSlots
    }

    return (
        <PsychologistBooking
            psychologist={psychologist}
            availableSlots={availableSlots}
            patientId={user.id}
        />
    )
}
