import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PatientAppointments } from '@/components/patient/PatientAppointments'

export default async function AppointmentsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Get patient's appointments
    const { data: appointments } = await supabase
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
        .order('scheduled_date', { ascending: true })

    return <PatientAppointments appointments={appointments || []} />
}
