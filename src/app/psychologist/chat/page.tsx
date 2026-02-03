import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PsychologistChat } from '@/components/psychologist/PsychologistChat'

export default async function ChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get psychologist's chat rooms
  const { data: chatRooms } = await supabase
    .from('chat_rooms')
    .select(`
      id,
      is_active,
      last_message_at,
      patients!inner (
        id,
        profiles!inner (
          full_name,
          photo_url
        )
      )
    `)
    .eq('psychologist_id', user.id)
    .eq('is_active', true)
    .order('last_message_at', { ascending: false })

  return <PsychologistChat chatRooms={(chatRooms as any) || []} userId={user.id} />
}
