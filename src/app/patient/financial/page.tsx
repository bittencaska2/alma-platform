import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PatientFinancial } from '@/components/patient/PatientFinancial'

export default async function FinancialPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get patient's transactions
  const { data: transactions } = await supabase
    .from('transactions')
    .select(`
      id,
      gross_amount,
      social_donation,
      payment_status,
      payment_method,
      package_weeks,
      created_at,
      psychologists!inner (
        profiles!inner (
          full_name
        )
      )
    `)
    .eq('patient_id', user.id)
    .order('created_at', { ascending: false })

  return <PatientFinancial transactions={(transactions as any) || []} />
}
