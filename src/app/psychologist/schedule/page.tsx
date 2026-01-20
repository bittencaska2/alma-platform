import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PsychologistSchedule } from '@/components/psychologist/PsychologistSchedule'

export default async function SchedulePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Read from user_metadata (primary source)
    const metadata = user.user_metadata || {}
    const metadataSlots = metadata.schedule_slots || []

    // Try to get from database as fallback
    let dbSlots: any[] = []
    try {
        const { data } = await supabase
            .from('availability_slots')
            .select('*')
            .eq('psychologist_id', user.id)
            .order('day_of_week', { ascending: true })
            .order('start_time', { ascending: true })
        dbSlots = data || []
    } catch (e) {
        // Table might not exist
    }

    // Convert metadata slots to the format expected by the component
    const slots = metadataSlots.length > 0
        ? metadataSlots.map((s: any) => ({
            id: `${s.dayOfWeek}-${s.startTime}`,
            day_of_week: s.dayOfWeek,
            start_time: s.startTime,
            end_time: s.endTime,
            is_available: true,
        }))
        : dbSlots

    return <PsychologistSchedule slots={slots} psychologistId={user.id} />
}

