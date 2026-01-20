import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PsychologistFinancial } from '@/components/psychologist/PsychologistFinancial'

export default async function FinancialPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Get psychologist's transactions
    const { data: transactions } = await supabase
        .from('transactions')
        .select(`
      id,
      gross_amount,
      psychologist_amount,
      platform_amount,
      social_donation,
      payment_status,
      created_at,
      patients!inner (
        profiles!inner (
          full_name
        )
      )
    `)
        .eq('psychologist_id', user.id)
        .order('created_at', { ascending: false })

    return <PsychologistFinancial transactions={transactions || []} />
}
