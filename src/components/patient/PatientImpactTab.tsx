'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Heart,
    TrendingUp,
    CreditCard,
    Calendar,
    CheckCircle2,
    Clock,
    Sparkles
} from 'lucide-react'

interface Transaction {
    id: string
    gross_amount: number
    social_donation: number
    payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
    payment_method?: string
    package_weeks?: number
    created_at: string
    psychologist_name?: string
}

interface PatientImpactTabProps {
    transactions: Transaction[]
}

export function PatientImpactTab({ transactions }: PatientImpactTabProps) {
    // Calculate totals
    const paidTransactions = transactions.filter(t => t.payment_status === 'paid')
    const totalInvested = paidTransactions.reduce((sum, t) => sum + t.gross_amount, 0)
    const totalDonated = paidTransactions.reduce((sum, t) => sum + t.social_donation, 0)

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value)
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
    }

    const getStatusBadge = (status: string) => {
        const config: Record<string, { label: string; className: string; icon: any }> = {
            pending: { label: 'Pendente', className: 'bg-amber-100 text-amber-800', icon: Clock },
            paid: { label: 'Pago', className: 'bg-green-100 text-green-800', icon: CheckCircle2 },
            failed: { label: 'Falhou', className: 'bg-red-100 text-red-800', icon: Clock },
            refunded: { label: 'Estornado', className: 'bg-gray-100 text-gray-800', icon: Clock }
        }
        return config[status] || config.pending
    }

    const getPaymentMethodLabel = (method?: string) => {
        const labels: Record<string, string> = {
            'credit_card': 'Cartão de Crédito',
            'pix': 'PIX',
            'boleto': 'Boleto'
        }
        return labels[method || ''] || method || '-'
    }

    return (
        <div className="space-y-6">
            {/* Gamification Cards */}
            <div className="grid sm:grid-cols-2 gap-4">
                {/* Investment Card */}
                <Card className="border-0 shadow-lg bg-gradient-to-br from-alma-blue-900 to-alma-blue-800 text-white">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-white/70 text-sm flex items-center gap-1">
                                    <TrendingUp className="w-4 h-4" />
                                    Investimento em Mim
                                </p>
                                <p className="text-3xl font-bold mt-2">
                                    {formatCurrency(totalInvested)}
                                </p>
                                <p className="text-white/60 text-sm mt-1">
                                    Total investido no seu bem-estar
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                                <Sparkles className="w-6 h-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Social Impact Card */}
                <Card className="border-0 shadow-lg bg-gradient-to-br from-alma-magenta-700 to-alma-magenta-800 text-white">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-white/70 text-sm flex items-center gap-1">
                                    <Heart className="w-4 h-4" />
                                    Meu Impacto Social
                                </p>
                                <p className="text-3xl font-bold mt-2">
                                    {formatCurrency(totalDonated)}
                                </p>
                                <p className="text-white/60 text-sm mt-1 leading-tight">
                                    Você ajudou a doar para o Lar da Criança Padre Franz Neumair
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                                <Heart className="w-6 h-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Info Banner */}
            <div className="p-4 bg-alma-lilac-50 rounded-xl border border-alma-lilac-200">
                <p className="text-sm text-alma-blue-900/70 flex items-start gap-2">
                    <Heart className="w-4 h-4 mt-0.5 text-alma-magenta-700 flex-shrink-0" />
                    <span>
                        <strong>1% de cada consulta</strong> é automaticamente destinado para ajudar crianças em situação de vulnerabilidade.
                        Cuidar de você também é cuidar do próximo. 💜
                    </span>
                </p>
            </div>

            {/* Payment History */}
            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-lg text-alma-blue-900 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-amber-600" />
                        Extrato de Pagamentos
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {transactions.length > 0 ? (
                        <div className="space-y-3">
                            {transactions.map((transaction) => {
                                const statusConfig = getStatusBadge(transaction.payment_status)
                                const StatusIcon = statusConfig.icon

                                return (
                                    <div
                                        key={transaction.id}
                                        className="p-4 bg-alma-lilac-50 rounded-xl"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                                                    <Calendar className="w-5 h-5 text-alma-blue-900" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-alma-blue-900">
                                                        {transaction.package_weeks
                                                            ? `Pacote ${transaction.package_weeks} semanas`
                                                            : 'Pagamento'
                                                        }
                                                    </p>
                                                    <p className="text-sm text-alma-blue-900/60">
                                                        {formatDate(transaction.created_at)}
                                                    </p>
                                                    <p className="text-xs text-alma-blue-900/50 mt-1">
                                                        {getPaymentMethodLabel(transaction.payment_method)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-alma-blue-900">
                                                    {formatCurrency(transaction.gross_amount)}
                                                </p>
                                                <Badge className={`${statusConfig.className} mt-1`}>
                                                    <StatusIcon className="w-3 h-3 mr-1" />
                                                    {statusConfig.label}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-alma-blue-900/60">
                            <CreditCard className="w-12 h-12 mx-auto mb-3 text-alma-lilac-300" />
                            <p>Nenhum pagamento realizado ainda</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Payment Methods (UI only) */}
            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-lg text-alma-blue-900">
                        Formas de Pagamento
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-6 text-alma-blue-900/60">
                        <CreditCard className="w-10 h-10 mx-auto mb-3 text-alma-lilac-300" />
                        <p className="text-sm">
                            Os pagamentos são processados de forma segura no momento do agendamento.
                        </p>
                        <p className="text-xs text-alma-blue-900/50 mt-2">
                            Aceitamos PIX e Cartão de Crédito
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
