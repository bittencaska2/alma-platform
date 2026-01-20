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

    return (
        <PatientDashboard
            user={{
                id: user.id,
                email: user.email || '',
                fullName: profile?.full_name || user.user_metadata?.full_name || 'Paciente',
                photoUrl: profile?.photo_url,
            }}
        />
    )
}
