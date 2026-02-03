'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Calendar, Clock, Info } from 'lucide-react'
import { cn, formatCurrency, calculateRemainingSessionsInMonth, CONSULTATION_PRICE } from '@/lib/utils'

interface BookingSummaryCardProps {
    psychologist: {
        id: string
        fullName: string
        photoUrl?: string | null
        crp?: string
        sessionPrice?: number
    }
    selectedDate: Date | null
    selectedTime: string | null
    onConfirm: () => void
    isLoading?: boolean
    className?: string
}

export function BookingSummaryCard({
    psychologist,
    selectedDate,
    selectedTime,
    onConfirm,
    isLoading = false,
    className
}: BookingSummaryCardProps) {
    // Calculate dynamic package based on selected weekday
    const packageDetails = useMemo(() => {
        if (!selectedDate) {
            return {
                sessionsCount: 0,
                totalPrice: 0,
                pricePerSession: psychologist.sessionPrice || CONSULTATION_PRICE,
                breakdown: ''
            }
        }

        const selectedWeekday = selectedDate.getDay()
        const sessionsCount = calculateRemainingSessionsInMonth(selectedDate, selectedWeekday)
        const pricePerSession = psychologist.sessionPrice || CONSULTATION_PRICE
        const totalPrice = sessionsCount * pricePerSession

        return {
            sessionsCount,
            totalPrice,
            pricePerSession,
            breakdown: `${sessionsCount} sessões até o fim do mês`
        }
    }, [selectedDate, psychologist.sessionPrice])

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()
    }

    const formatSelectedDate = (date: Date) => {
        return date.toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: '2-digit',
            month: 'long'
        })
    }

    const isReadyToConfirm = selectedDate && selectedTime

    return (
        <Card className={cn("border-0 shadow-lg bg-white", className)}>
            <CardHeader className="space-y-4 pb-4 border-b border-gray-100">
                {/* Psychologist Info */}
                <div className="flex items-center gap-3">
                    <Avatar className="w-16 h-16 border-2 border-purple-100">
                        <AvatarImage src={psychologist.photoUrl || undefined} alt={psychologist.fullName} />
                        <AvatarFallback className="bg-purple-100 text-purple-700 text-lg font-semibold">
                            {getInitials(psychologist.fullName)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-base truncate">
                            {psychologist.fullName}
                        </h3>
                        {psychologist.crp && (
                            <p className="text-sm text-gray-500">
                                CRP {psychologist.crp}
                            </p>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-5 pt-5">
                {/* Selected Date */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                        <Calendar className="w-4 h-4 text-purple-500" />
                        <span>Data Selecionada</span>
                    </div>
                    {selectedDate ? (
                        <p className="text-gray-900 font-medium capitalize pl-6 text-sm">
                            {formatSelectedDate(selectedDate)}
                        </p>
                    ) : (
                        <p className="text-gray-400 text-sm pl-6">Selecione uma data</p>
                    )}
                </div>

                {/* Selected Time */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                        <Clock className="w-4 h-4 text-purple-500" />
                        <span>Horário Selecionado</span>
                    </div>
                    {selectedTime ? (
                        <p className="text-gray-900 font-medium pl-6 text-sm">
                            {selectedTime}
                        </p>
                    ) : (
                        <p className="text-gray-400 text-sm pl-6">Selecione um horário</p>
                    )}
                </div>

                {/* Package Details */}
                {selectedDate && (
                    <div className="space-y-3 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                            <span>Pacote Mensal</span>
                        </div>

                        <div className="bg-purple-50 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between items-baseline">
                                <span className="text-sm text-gray-600">
                                    {packageDetails.breakdown}
                                </span>
                                <span className="text-lg font-bold text-purple-600">
                                    {formatCurrency(packageDetails.totalPrice)}
                                </span>
                            </div>
                            <div className="flex justify-between items-baseline text-xs text-gray-500">
                                <span>Valor por sessão</span>
                                <span>{formatCurrency(packageDetails.pricePerSession)}</span>
                            </div>
                        </div>

                        {/* Info notice */}
                        <div className="flex gap-2 text-xs text-gray-600 bg-blue-50 p-3 rounded-lg">
                            <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-500" />
                            <p className="flex-1">
                                O pacote é cobrado mensalmente e renova automaticamente no mesmo dia da semana.
                            </p>
                        </div>
                    </div>
                )}

                {/* CTA Button */}
                <Button
                    onClick={onConfirm}
                    disabled={!isReadyToConfirm || isLoading}
                    className={cn(
                        "w-full h-12 text-base font-semibold transition-all",
                        "bg-[#8B5CF6] hover:bg-[#7C3AED] text-white",
                        "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300",
                        isReadyToConfirm && "shadow-md hover:shadow-lg"
                    )}
                >
                    {isLoading ? (
                        <span className="flex items-center gap-2">
                            <span className="animate-spin">⏳</span>
                            Processando...
                        </span>
                    ) : isReadyToConfirm ? (
                        `Confirmar Agendamento • ${formatCurrency(packageDetails.totalPrice)}`
                    ) : (
                        'Selecione Data e Horário'
                    )}
                </Button>

                {/* Cancellation policy */}
                <p className="text-xs text-center text-gray-500 leading-relaxed">
                    Ao confirmar, você reserva o horário por 15 minutos.
                    O pagamento é seguro via Stripe.
                </p>
            </CardContent>
        </Card>
    )
}
