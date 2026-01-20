import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PsychologistAppointments } from '@/components/psychologist/PsychologistAppointments'

export default async function AppointmentsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Get psychologist's appointments
    const { data: appointments } = await supabase
        .from('appointments')
        .select(`
      id,
      scheduled_date,
      start_time,
      end_time,
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
        .order('scheduled_date', { ascending: true })

    return <PsychologistAppointments appointments={appointments || []} />
}
