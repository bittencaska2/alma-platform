import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, UserCog, Calendar, DollarSign } from 'lucide-react'

export default async function AdminDashboard() {
    const supabase = await createClient()

    // Parallel data fetching
    const [
        { count: patientsCount },
        { count: psychologistsCount },
        { count: appointmentsCount },
        { data: transactions }
    ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('user_type', 'patient'),
        supabase.from('psychologists').select('*', { count: 'exact', head: true }),
        supabase.from('appointments').select('*', { count: 'exact', head: true }).neq('status', 'cancelled'),
        supabase.from('transactions').select('gross_amount').eq('payment_status', 'paid')
    ])

    // Calculate revenue
    const totalRevenue = transactions?.reduce((sum, t) => sum + (Number(t.gross_amount) || 0), 0) || 0

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Pacientes</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{patientsCount || 0}</div>
                        <p className="text-xs text-muted-foreground">Cadastrados na plataforma</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Psicólogos</CardTitle>
                        <UserCog className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{psychologistsCount || 0}</div>
                        <p className="text-xs text-muted-foreground">Profissionais ativos</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Agendamentos</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{appointmentsCount || 0}</div>
                        <p className="text-xs text-muted-foreground">Consultas ativas/realizadas</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue)}
                        </div>
                        <p className="text-xs text-muted-foreground">Faturamento bruto confirmado</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Visão Geral</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                            Gráfico de Receita (Em breve)
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Atividades Recentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Placeholder for recent activities log */}
                            <p className="text-sm text-muted-foreground">Nenhuma atividade recente registrada.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
