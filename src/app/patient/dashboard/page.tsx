import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PatientDashboard } from '@/components/patient/PatientDashboard'

export default async function PatientDashboardPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Get patient profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // Get patient-specific data
    const { data: patientData } = await supabase
        .from('patients')
        .select('*')
        .eq('id', user.id)
        .single()

    // Get appointment history
    const { data: appointments } = await supabase
        .from('appointments')
        .select('id, scheduled_date, start_time, end_time, status')
        .eq('patient_id', user.id)
        .order('scheduled_date', { ascending: false })

    // Get transactions for financial tab
    const { data: transactions } = await supabase
        .from('transactions')
        .select('id, gross_amount, social_donation, payment_status, payment_method, package_weeks, created_at')
        .eq('patient_id', user.id)
        .order('created_at', { ascending: false })

    // Check for active package (confirmed appointments in the future)
    const today = new Date().toISOString().split('T')[0]
    const { data: activeAppointments } = await supabase
        .from('appointments')
        .select(`
            id,
            scheduled_date,
            start_time,
            end_time,
            status,
            psychologists!inner (
                id,
                crp,
                profiles!inner (
                    full_name,
                    photo_url
                )
            )
        `)
        .eq('patient_id', user.id)
        .in('status', ['pending', 'confirmed'])
        .gte('scheduled_date', today)
        .order('scheduled_date', { ascending: true })

    // Build active package data if there are future appointments
    let activePackage = null
    if (activeAppointments && activeAppointments.length > 0) {
        const firstAppointment = activeAppointments[0] as any
        const psychologist = firstAppointment.psychologists

        activePackage = {
            psychologist: {
                id: psychologist.id,
                fullName: psychologist.profiles.full_name,
                crp: psychologist.crp,
                photoUrl: psychologist.profiles.photo_url
            },
            sessionsRemaining: activeAppointments.length,
            totalSessions: 4, // Default package size
            nextAppointment: {
                id: firstAppointment.id,
                scheduled_date: firstAppointment.scheduled_date,
                start_time: firstAppointment.start_time,
                end_time: firstAppointment.end_time,
                status: firstAppointment.status
            }
        }
    }

    return (
        <PatientDashboard
            user={{
                id: user.id,
                email: user.email || '',
                fullName: profile?.full_name || user.user_metadata?.full_name || 'Paciente',
                photoUrl: profile?.photo_url,
                age: patientData?.age || null,
                whatsapp: profile?.whatsapp || null
            }}
            activePackage={activePackage}
            appointmentHistory={(appointments as any) || []}
            transactions={(transactions as any) || []}
        />
    )
}
