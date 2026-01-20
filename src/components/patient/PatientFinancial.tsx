'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Heart,
    ArrowLeft,
    CreditCard,
    DollarSign,
    Calendar,
    CheckCircle2,
    Clock,
    XCircle
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Transaction {
    id: string
    gross_amount: number
    social_donation: number
    payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
    payment_method: string | null
    package_weeks: number | null
    created_at: string
    psychologists: {
        profiles: {
            full_name: string
        }
    }
}

interface PatientFinancialProps {
    transactions: Transaction[]
}

const statusConfig = {
    pending: { label: 'Pendente', color: 'bg-amber-100 text-amber-800', icon: Clock },
    paid: { label: 'Pago', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
    failed: { label: 'Falhou', color: 'bg-red-100 text-red-800', icon: XCircle },
    refunded: { label: 'Reembolsado', color: 'bg-gray-100 text-gray-800', icon: DollarSign },
}

export function PatientFinancial({ transactions }: PatientFinancialProps) {
    const totalPaid = transactions
        .filter(t => t.payment_status === 'paid')
        .reduce((sum, t) => sum + t.gross_amount, 0)

    const totalDonated = transactions
        .filter(t => t.payment_status === 'paid')
        .reduce((sum, t) => sum + t.social_donation, 0)

    return (
        <div className="min-h-screen bg-gradient-to-br from-alma-lilac-50 via-white to-alma-lilac-100">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-alma-lilac-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center h-16 gap-4">
                        <Link href="/patient/dashboard" className="p-2 hover:bg-alma-lilac-100 rounded-lg transition-colors">
                            <ArrowLeft className="w-5 h-5 text-alma-blue-900" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-alma-blue-900 to-alma-magenta-800 flex items-center justify-center">
                                <Heart className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-bold text-alma-blue-900">Financeiro</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Summary Cards */}
                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-alma-blue-900/60">Total Investido</p>
                                    <p className="text-3xl font-bold text-alma-blue-900">{formatCurrency(totalPaid)}</p>
                                    <p className="text-xs text-alma-blue-900/50 mt-1">em sua saúde mental</p>
                                </div>
                                <div className="w-14 h-14 rounded-2xl bg-alma-blue-100 flex items-center justify-center">
                                    <CreditCard className="w-7 h-7 text-alma-blue-900" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-gradient-to-br from-alma-magenta-700 to-alma-magenta-800 text-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-white/70">Impacto Social</p>
                                    <p className="text-3xl font-bold">{formatCurrency(totalDonated)}</p>
                                    <p className="text-xs text-white/60 mt-1">doados via Meraki Social</p>
                                </div>
                                <Heart className="w-10 h-10 text-white/80" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Transaction History */}
                <Card className="border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-lg text-alma-blue-900 flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-amber-600" />
                            Histórico de Pagamentos
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {transactions.length > 0 ? (
                            <div className="space-y-3">
                                {transactions.map(transaction => {
                                    const StatusIcon = statusConfig[transaction.payment_status].icon

                                    return (
                                        <div
                                            key={transaction.id}
                                            className="flex items-center justify-between p-4 bg-alma-lilac-50 rounded-xl"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                                                    <CreditCard className="w-5 h-5 text-alma-blue-900" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-alma-blue-900">
                                                        {transaction.package_weeks
                                                            ? `Pacote ${transaction.package_weeks} semanas`
                                                            : 'Sessão avulsa'}
                                                    </p>
                                                    <p className="text-sm text-alma-blue-900/60">
                                                        {transaction.psychologists.profiles.full_name}
                                                    </p>
                                                    <div className="flex items-center gap-1 text-xs text-alma-blue-900/40 mt-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(transaction.created_at).toLocaleDateString('pt-BR')}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-alma-blue-900">
                                                    {formatCurrency(transaction.gross_amount)}
                                                </p>
                                                <Badge className={`mt-1 ${statusConfig[transaction.payment_status].color}`}>
                                                    <StatusIcon className="w-3 h-3 mr-1" />
                                                    {statusConfig[transaction.payment_status].label}
                                                </Badge>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <CreditCard className="w-12 h-12 mx-auto mb-3 text-alma-lilac-300" />
                                <p className="text-alma-blue-900/60">Nenhum pagamento realizado ainda</p>
                                <p className="text-sm text-alma-blue-900/40 mt-1">
                                    Seus pagamentos aparecerão aqui após agendar consultas
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
