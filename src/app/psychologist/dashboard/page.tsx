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

    // Try to get from database as fallback
    let profileData: any = null
    let psychologistData: any = null
    let scheduleSlots: any[] = []

    try {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
        profileData = data
    } catch (e) {
        // Table might not exist
    }

    try {
        const { data } = await supabase
            .from('psychologists')
            .select('*')
            .eq('id', user.id)
            .single()
        psychologistData = data
    } catch (e) {
        // Table might not exist
    }

    // Get schedule slots from metadata or database
    const metadataSlots = metadata.schedule_slots || []

    if (metadataSlots.length > 0) {
        scheduleSlots = metadataSlots
    } else {
        try {
            const { data } = await supabase
                .from('availability_slots')
                .select('*')
                .eq('psychologist_id', user.id)
            scheduleSlots = data || []
        } catch (e) {
            // Table might not exist
        }
    }

    return (
        <PsychologistDashboard
            user={{
                id: user.id,
                email: user.email || '',
                fullName: metadata.full_name || profileData?.full_name || 'Psicólogo',
                photoUrl: profileData?.photo_url,
                crp: metadata.crp || psychologistData?.crp || '',
            }}
            scheduleSlots={scheduleSlots}
        />
    )
}
