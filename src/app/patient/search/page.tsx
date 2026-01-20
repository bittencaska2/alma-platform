import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SearchPsychologists } from '@/components/patient/SearchPsychologists'

export default async function SearchPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  let psychologists: any[] = []

  // Try to get from database tables first
  try {
    const { data } = await supabase
      .from('psychologists')
      .select(`
                id,
                crp,
                bio,
                specialties,
                session_price,
                is_verified,
                years_of_experience,
                profiles!inner (
                    full_name,
                    photo_url
                )
            `)
      .eq('is_active', true)

    if (data && data.length > 0) {
      psychologists = data
    }
  } catch (e) {
    // Tables might not exist
  }

  // If no data from tables, get all users with psychologist type from auth
  if (psychologists.length === 0) {
    // Get all users who are psychologists from profiles table
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_type', 'psychologist')

      if (profiles && profiles.length > 0) {
        psychologists = profiles.map(p => ({
          id: p.id,
          crp: '',
          bio: '',
          specialties: [],
          session_price: 160,
          is_verified: false,
          years_of_experience: null,
          profiles: {
            full_name: p.full_name,
            photo_url: p.photo_url
          }
        }))
      }
    } catch (e) {
      // Table might not exist
    }
  }

  // Fallback: Create demo listing from current user if they're a psychologist
  // This allows testing the flow even without database tables
  if (psychologists.length === 0) {
    const metadata = user.user_metadata || {}
    if (metadata.user_type === 'psychologist') {
      psychologists = [{
        id: user.id,
        crp: metadata.crp || 'Não informado',
        bio: metadata.bio || 'Psicólogo(a) disponível para atendimento.',
        specialties: metadata.specialties || ['Terapia Cognitivo-Comportamental'],
        session_price: 160,
        is_verified: false,
        years_of_experience: metadata.years_of_experience || null,
        profiles: {
          full_name: metadata.full_name || 'Psicólogo(a)',
          photo_url: null
        }
      }]
    }
  }

  // If still empty, show a demo psychologist for testing
  if (psychologists.length === 0) {
    psychologists = [{
      id: 'demo-psychologist',
      crp: '05/12345',
      bio: 'Psicóloga clínica especializada em Terapia Cognitivo-Comportamental, com experiência em tratamento de ansiedade, depressão e relacionamentos.',
      specialties: ['Ansiedade', 'Depressão', 'Terapia de Casal'],
      session_price: 160,
      is_verified: true,
      years_of_experience: 8,
      profiles: {
        full_name: 'Dra. Maria Silva (Demo)',
        photo_url: null
      }
    }]
  }

  return <SearchPsychologists psychologists={psychologists} />
}
