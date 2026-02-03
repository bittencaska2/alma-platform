import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PatientChat } from '@/components/patient/PatientChat'

export default async function ChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get patient's chat rooms
  const { data: chatRooms } = await supabase
    .from('chat_rooms')
    .select(`
      id,
      is_active,
      last_message_at,
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
    .eq('is_active', true)
    .order('last_message_at', { ascending: false })

  return <PatientChat chatRooms={(chatRooms as any) || []} userId={user.id} />
}
