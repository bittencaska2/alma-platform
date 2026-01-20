'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Heart, Calendar, Clock, Shield, CheckCircle2, Sparkles } from 'lucide-react'
import { formatCurrency, calculateMonthlyPackage, CONSULTATION_PRICE, SOCIAL_DONATION_RATE } from '@/lib/utils'

interface CheckoutCardProps {
    psychologist: {
        id: string
        fullName: string
        photoUrl?: string
        crp: string
    }
    selectedDate: Date
    selectedTime: string
    onConfirm: () => void
    onCancel: () => void
    isLoading?: boolean
}

export function CheckoutCard({
    psychologist,
    selectedDate,
    selectedTime,
    onConfirm,
    onCancel,
    isLoading = false,
}: CheckoutCardProps) {
    // Calculate package info based on selected month
    const packageInfo = useMemo(() => {
        return calculateMonthlyPackage(selectedDate.getFullYear(), selectedDate.getMonth())
    }, [selectedDate])

    const initials = psychologist.fullName
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()

    return (
        <Card className="border-0 shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-alma-blue-900 to-alma-magenta-800 p-6 text-white">
                <h3 className="text-lg font-semibold mb-1">Resumo do Agendamento</h3>
                <p className="text-white/70 text-sm">Confira os detalhes antes de confirmar</p>
            </div>

            <CardContent className="p-6 space-y-6">
                {/* Psychologist Info */}
                <div className="flex items-center gap-4 pb-4 border-b border-alma-lilac-100">
                    <Avatar className="w-16 h-16">
                        <AvatarImage src={psychologist.photoUrl} alt={psychologist.fullName} />
                        <AvatarFallback className="bg-alma-lilac-200 text-lg">{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h4 className="font-semibold text-alma-blue-900">{psychologist.fullName}</h4>
                        <p className="text-sm text-alma-blue-900/60">CRP {psychologist.crp}</p>
                        <Badge variant="success" className="mt-1 gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Verificado
                        </Badge>
                    </div>
                </div>

                {/* Appointment Details */}
                <div className="space-y-3">
                    <div className="flex items-center gap-3 text-alma-blue-900">
                        <div className="w-10 h-10 rounded-xl bg-alma-lilac-100 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-alma-blue-900" />
                        </div>
                        <div>
                            <p className="text-sm text-alma-blue-900/60">Data</p>
                            <p className="font-medium">
                                {selectedDate.toLocaleDateString('pt-BR', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                })}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-alma-blue-900">
                        <div className="w-10 h-10 rounded-xl bg-alma-lilac-100 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-alma-blue-900" />
                        </div>
                        <div>
                            <p className="text-sm text-alma-blue-900/60">Horário</p>
                            <p className="font-medium">{selectedTime} (50 minutos)</p>
                        </div>
                    </div>
                </div>

                {/* Pricing */}
                <div className="bg-alma-lilac-50 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-alma-blue-900/70">Valor da sessão</span>
                        <span className="font-semibold text-alma-blue-900">{formatCurrency(CONSULTATION_PRICE)}</span>
                    </div>

                    <hr className="border-alma-lilac-200" />

                    <div className="space-y-2">
                        <p className="text-sm font-medium text-alma-blue-900">
                            Pacote mensal ({packageInfo.weeks} semanas):
                        </p>
                        <div className="flex items-center justify-between">
                            <span className="text-alma-blue-900/70">{packageInfo.weeks}x sessões</span>
                            <span className="font-bold text-xl text-alma-blue-900">
                                {formatCurrency(packageInfo.totalAmount)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Social Impact Badge */}
                <div className="bg-gradient-to-r from-alma-magenta-700/10 to-alma-magenta-800/10 rounded-2xl p-4 border border-alma-magenta-200">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-alma-magenta-700 flex items-center justify-center flex-shrink-0">
                            <Heart className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-alma-magenta-800">Meraki Social</span>
                                <Sparkles className="w-4 h-4 text-alma-magenta-600" />
                            </div>
                            <p className="text-sm text-alma-magenta-700/80">
                                {formatCurrency(packageInfo.socialDonation)} serão destinados ao{' '}
                                <strong>Lar da Criança Padre Franz Neumair</strong> (Niterói/RJ)
                            </p>
                            <p className="text-xs text-alma-magenta-600/60 mt-1">
                                1% de cada consulta apoia crianças em vulnerabilidade
                            </p>
                        </div>
                    </div>
                </div>

                {/* Security Note */}
                <div className="flex items-center gap-2 text-sm text-alma-blue-900/60">
                    <Shield className="w-4 h-4" />
                    <span>Pagamento seguro e criptografado</span>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        Voltar
                    </Button>
                    <Button
                        className="flex-1"
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Processando...' : 'Confirmar Agendamento'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

// Simplified single session checkout
interface SingleSessionCheckoutProps {
    psychologist: {
        id: string
        fullName: string
        photoUrl?: string
        crp: string
    }
    selectedDate: Date
    startTime: string
    endTime: string
    onConfirm: () => void
    onCancel: () => void
    isLoading?: boolean
}

export function SingleSessionCheckout({
    psychologist,
    selectedDate,
    startTime,
    endTime,
    onConfirm,
    onCancel,
    isLoading = false,
}: SingleSessionCheckoutProps) {
    const socialDonation = CONSULTATION_PRICE * SOCIAL_DONATION_RATE

    const initials = psychologist.fullName
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()

    return (
        <Card className="border-0 shadow-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-alma-blue-900 to-alma-blue-800 text-white">
                <CardTitle className="text-lg">Confirmar Sessão</CardTitle>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
                {/* Psychologist */}
                <div className="flex items-center gap-4">
                    <Avatar className="w-14 h-14">
                        <AvatarImage src={psychologist.photoUrl} />
                        <AvatarFallback className="bg-alma-lilac-200">{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h4 className="font-semibold text-alma-blue-900">{psychologist.fullName}</h4>
                        <p className="text-sm text-alma-blue-900/60">CRP {psychologist.crp}</p>
                    </div>
                </div>

                {/* Details */}
                <div className="bg-alma-lilac-50 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-alma-blue-900/70">Data</span>
                        <span className="font-medium text-alma-blue-900">
                            {selectedDate.toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                            })}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-alma-blue-900/70">Horário</span>
                        <span className="font-medium text-alma-blue-900">{startTime} - {endTime}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-alma-blue-900/70">Duração</span>
                        <span className="font-medium text-alma-blue-900">50 minutos</span>
                    </div>
                    <hr className="border-alma-lilac-200 my-2" />
                    <div className="flex justify-between">
                        <span className="font-medium text-alma-blue-900">Total</span>
                        <span className="font-bold text-xl text-alma-blue-900">{formatCurrency(CONSULTATION_PRICE)}</span>
                    </div>
                </div>

                {/* Social Badge */}
                <div className="flex items-center gap-2 p-3 bg-alma-magenta-50 rounded-lg border border-alma-magenta-200">
                    <Heart className="w-5 h-5 text-alma-magenta-700" />
                    <p className="text-sm text-alma-magenta-800">
                        <strong>{formatCurrency(socialDonation)}</strong> para o Lar da Criança
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={onCancel} disabled={isLoading}>
                        Cancelar
                    </Button>
                    <Button className="flex-1" onClick={onConfirm} disabled={isLoading}>
                        {isLoading ? 'Processando...' : 'Pagar'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
