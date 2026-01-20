import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PsychologistProfile } from '@/components/psychologist/PsychologistProfile'

export default async function ProfilePage() {
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

    return (
        <PsychologistProfile
            user={{
                id: user.id,
                email: user.email || '',
                fullName: metadata.full_name || profileData?.full_name || '',
                phone: metadata.phone || profileData?.phone || '',
                photoUrl: profileData?.photo_url || '',
                crp: metadata.crp || psychologistData?.crp || '',
                bio: metadata.bio || psychologistData?.bio || '',
                specialties: metadata.specialties || psychologistData?.specialties || [],
                sessionPrice: psychologistData?.session_price || 160,
                yearsOfExperience: metadata.years_of_experience || psychologistData?.years_of_experience || null,
            }}
        />
    )
}

