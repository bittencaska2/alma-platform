'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Heart,
    ArrowLeft,
    DollarSign,
    TrendingUp,
    Calendar,
    CheckCircle2,
    Clock,
    Users,
    ExternalLink,
    Info
} from 'lucide-react'

interface Transaction {
    id: string
    gross_amount: number
    psychologist_amount: number
    platform_amount: number
    social_donation: number
    payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
    created_at: string
    patients?: {
        profiles: {
            full_name: string
        }
    }
}

interface PsychologistFinancialProps {
    transactions: Transaction[]
}

const statusConfig = {
    pending: { label: 'Pendente', color: 'bg-amber-100 text-amber-800', icon: Clock },
    paid: { label: 'Pago', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
    failed: { label: 'Falhou', color: 'bg-red-100 text-red-800', icon: Clock },
    refunded: { label: 'Reembolsado', color: 'bg-gray-100 text-gray-800', icon: Clock },
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value)
}

export function PsychologistFinancial({ transactions }: PsychologistFinancialProps) {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    const monthlyTransactions = transactions.filter(t => {
        const date = new Date(t.created_at)
        return date.getMonth() === currentMonth &&
            date.getFullYear() === currentYear &&
            t.payment_status === 'paid'
    })

    const totalEarned = transactions
        .filter(t => t.payment_status === 'paid')
        .reduce((sum, t) => sum + t.psychologist_amount, 0)

    const monthlyEarned = monthlyTransactions.reduce((sum, t) => sum + t.psychologist_amount, 0)

    const totalDonated = transactions
        .filter(t => t.payment_status === 'paid')
        .reduce((sum, t) => sum + t.social_donation, 0)

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid sm:grid-cols-3 gap-4">
                <Card className="border-0 shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-alma-blue-900/60">Este Mês</p>
                                <p className="text-2xl font-bold text-alma-blue-900">{formatCurrency(monthlyEarned)}</p>
                                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                                    <TrendingUp className="w-3 h-3" />
                                    {monthlyTransactions.length} consultas
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-alma-blue-900/60">Total Recebido</p>
                                <p className="text-2xl font-bold text-alma-blue-900">{formatCurrency(totalEarned)}</p>
                                <p className="text-xs text-alma-blue-900/50 mt-1">80% das consultas</p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-alma-blue-100 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-alma-blue-900" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-alma-magenta-700 to-alma-magenta-800 text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-white/70">Impacto Social</p>
                                <p className="text-2xl font-bold">{formatCurrency(totalDonated)}</p>
                                <p className="text-xs text-white/60 mt-1">doados via seus atendimentos</p>
                            </div>
                            <Heart className="w-10 h-10 text-white/80" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Split Payment Transparency Notice */}
            <Card className="border-2 border-amber-200 bg-amber-50/50">
                <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                            <Info className="w-5 h-5 text-amber-700" />
                        </div>
                        <div>
                            <p className="font-medium text-amber-900">Transparência de Pagamentos</p>
                            <p className="text-sm text-amber-800/80 mt-1">
                                O valor das consultas (<strong>80%</strong>) é enviado automaticamente para sua conta Asaas.
                                Este painel é apenas demonstrativo. <strong>1%</strong> é destinado ao Lar da Criança Padre Franz Neumair.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Voluntary Donation Button */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-alma-lilac-50 to-white">
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-alma-magenta-100 flex items-center justify-center">
                                <Heart className="w-6 h-6 text-alma-magenta-700" />
                            </div>
                            <div>
                                <p className="font-semibold text-alma-blue-900">Quer contribuir mais?</p>
                                <p className="text-sm text-alma-blue-900/60">
                                    Faça uma doação voluntária para o Lar da Criança
                                </p>
                            </div>
                        </div>
                        <a
                            href="https://www.lardacrianca.org.br/doe"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button className="gap-2 bg-alma-magenta-700 hover:bg-alma-magenta-800">
                                <Heart className="w-4 h-4" />
                                Quero contribuir também
                                <ExternalLink className="w-3 h-3" />
                            </Button>
                        </a>
                    </div>
                </CardContent>
            </Card>

            {/* Transaction History */}
            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-lg text-alma-blue-900 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-alma-blue-900/40" />
                        Histórico de Recebimentos
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
                                                <Users className="w-5 h-5 text-alma-blue-900" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-alma-blue-900">
                                                    {transaction.patients?.profiles?.full_name || 'Paciente'}
                                                </p>
                                                <div className="flex items-center gap-1 text-xs text-alma-blue-900/40 mt-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(transaction.created_at).toLocaleDateString('pt-BR')}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-green-600">
                                                +{formatCurrency(transaction.psychologist_amount)}
                                            </p>
                                            <p className="text-xs text-alma-blue-900/40">
                                                de {formatCurrency(transaction.gross_amount)}
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
                            <DollarSign className="w-12 h-12 mx-auto mb-3 text-alma-lilac-300" />
                            <p className="text-alma-blue-900/60">Nenhum recebimento ainda</p>
                            <p className="text-sm text-alma-blue-900/40 mt-1">
                                Seus recebimentos aparecerão aqui após suas consultas
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
