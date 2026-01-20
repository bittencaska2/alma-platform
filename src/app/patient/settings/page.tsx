import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PatientSettings } from '@/components/patient/PatientSettings'

export default async function SettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Read from user_metadata (primary source) with fallback to database
    const metadata = user.user_metadata || {}

    // Try to get from database as fallback
    let profileData: any = null
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

    return (
        <PatientSettings
            user={{
                id: user.id,
                email: user.email || '',
                fullName: metadata.full_name || profileData?.full_name || '',
                phone: metadata.phone || profileData?.phone || '',
                photoUrl: profileData?.photo_url || '',
                address: metadata.address || '',
            }}
        />
    )
}

