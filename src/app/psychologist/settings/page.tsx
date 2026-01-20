import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PsychologistSettings } from '@/components/psychologist/PsychologistSettings'

export default async function SettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    return (
        <PsychologistSettings
            user={{
                id: user.id,
                email: user.email || '',
                fullName: profile?.full_name || user.user_metadata?.full_name || '',
            }}
        />
    )
}
