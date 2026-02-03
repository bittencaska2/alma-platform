import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PsychologistDashboard } from '@/components/psychologist/PsychologistDashboard'

export default async function PsychologistDashboardPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Read from user_metadata (primary source)
    const metadata = user.user_metadata || {}

    // Get profile data
    const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // Get psychologist data
    const { data: psychologistData } = await supabase
        .from('psychologists')
        .select('*')
        .eq('id', user.id)
        .single()

    // Get unique patients who have appointments with this psychologist
    const { data: appointmentsData } = await supabase
        .from('appointments')
        .select(`
            id,
            patient_id,
            scheduled_date,
            status,
            patients!inner (
                id,
                profiles!inner (
                    full_name,
                    photo_url
                )
            )
        `)
        .eq('psychologist_id', user.id)
        .order('scheduled_date', { ascending: false })

    // Transform appointments into unique patient list
    const patientMap = new Map()
    const today = new Date().toISOString().split('T')[0]

    if (appointmentsData) {
        for (const apt of appointmentsData as any[]) {
            const patientId = apt.patient_id
            if (!patientMap.has(patientId)) {
                patientMap.set(patientId, {
                    id: patientId,
                    fullName: apt.patients.profiles.full_name,
                    photoUrl: apt.patients.profiles.photo_url,
                    lastAppointment: null,
                    nextAppointment: null,
                    status: 'inactive' as const,
                    totalSessions: 0
                })
            }

            const patient = patientMap.get(patientId)
            patient.totalSessions++

            const aptDate = apt.scheduled_date
            if (apt.status === 'completed' || aptDate < today) {
                if (!patient.lastAppointment || aptDate > patient.lastAppointment) {
                    patient.lastAppointment = aptDate
                }
            }
            if ((apt.status === 'pending' || apt.status === 'confirmed') && aptDate >= today) {
                if (!patient.nextAppointment || aptDate < patient.nextAppointment) {
                    patient.nextAppointment = aptDate
                }
                patient.status = 'active'
            }
        }
    }

    const patients = Array.from(patientMap.values())

    // Get transactions
    const { data: transactionsData } = await supabase
        .from('transactions')
        .select(`
            id,
            gross_amount,
            psychologist_amount,
            platform_amount,
            social_donation,
            payment_status,
            created_at,
            patients!inner (
                profiles!inner (
                    full_name
                )
            )
        `)
        .eq('psychologist_id', user.id)
        .order('created_at', { ascending: false })

    return (
        <PsychologistDashboard
            user={{
                id: user.id,
                email: user.email || '',
                fullName: metadata.full_name || profileData?.full_name || 'Psicólogo',
                photoUrl: profileData?.photo_url,
                crp: metadata.crp || psychologistData?.crp || '',
                bio: psychologistData?.bio || null,
                education: psychologistData?.education || null,
                educationYear: psychologistData?.education_year || null,
                whatsapp: profileData?.whatsapp || null
            }}
            patients={patients}
            transactions={(transactionsData as any) || []}
        />
    )
}
