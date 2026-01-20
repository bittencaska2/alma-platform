'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    Heart,
    ArrowLeft,
    Calendar,
    Clock,
    Award,
    CheckCircle2,
    CreditCard,
    AlertCircle,
    Timer,
    XCircle
} from 'lucide-react'
import { cancelBooking } from '@/lib/actions/booking'
import { formatCurrency, calculateSplit } from '@/lib/utils'

interface BookingData {
    id: string
    psychologistId: string
    psychologistName: string
    psychologistCrp: string
    psychologistPhoto: string | null
    bookingDate: string
    startTime: string
    endTime: string
    sessionPrice: number
    status: string
    expiresAt: string
}

interface BookingSummaryProps {
    booking: BookingData
}

export function BookingSummary({ booking }: BookingSummaryProps) {
    const router = useRouter()
    const [timeLeft, setTimeLeft] = useState<number>(0)
    const [isCancelling, setIsCancelling] = useState(false)

    const initials = booking.psychologistName
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()

    const split = calculateSplit(booking.sessionPrice)

    // Timer countdown
    useEffect(() => {
        const expiresAt = new Date(booking.expiresAt).getTime()

        const updateTimer = () => {
            const now = Date.now()
            const diff = Math.max(0, Math.floor((expiresAt - now) / 1000))
            setTimeLeft(diff)

            if (diff === 0) {
                router.push('/patient/dashboard')
            }
        }

        updateTimer()
        const interval = setInterval(updateTimer, 1000)

        return () => clearInterval(interval)
    }, [booking.expiresAt, router])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const formatBookingDate = (dateStr: string) => {
        const date = new Date(dateStr + 'T00:00:00')
        return date.toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
    }

    const handleCancel = async () => {
        setIsCancelling(true)
        await cancelBooking(booking.id)
        router.push('/patient/dashboard')
    }

    const handlePayment = () => {
        // TODO: Redirect to payment gateway (Asaas)
        alert('Integração com pagamento será implementada em breve!')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-alma-lilac-50 via-white to-alma-lilac-100">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-alma-lilac-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Link href="/patient/dashboard" className="p-2 hover:bg-alma-lilac-100 rounded-lg transition-colors">
                                <ArrowLeft className="w-5 h-5 text-alma-blue-900" />
                            </Link>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-alma-blue-900 to-alma-magenta-800 flex items-center justify-center">
                                    <Heart className="w-4 h-4 text-white" />
                                </div>
                                <span className="font-bold text-alma-blue-900">Confirmar Reserva</span>
                            </div>
                        </div>

                        {/* Timer */}
                        {booking.status === 'pending_payment' && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-800 rounded-full">
                                <Timer className="w-4 h-4" />
                                <span className="font-mono font-medium">{formatTime(timeLeft)}</span>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Success Message */}
                <Card className="border-0 shadow-lg mb-6 bg-green-50">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3 text-green-800">
                            <CheckCircle2 className="w-6 h-6" />
                            <div>
                                <p className="font-semibold">Horário reservado com sucesso!</p>
                                <p className="text-sm text-green-700">Complete o pagamento para confirmar sua consulta.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Timer Warning */}
                {timeLeft <= 300 && timeLeft > 0 && (
                    <Card className="border-0 shadow-lg mb-6 bg-amber-50 border-amber-200">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3 text-amber-800">
                                <AlertCircle className="w-5 h-5" />
                                <p className="text-sm">
                                    Atenção! Você tem <strong>{formatTime(timeLeft)}</strong> para completar o pagamento.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Booking Details */}
                <Card className="border-0 shadow-lg mb-6">
                    <CardHeader>
                        <CardTitle className="text-lg text-alma-blue-900">Detalhes da Consulta</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Psychologist */}
                        <div className="flex items-center gap-4 p-4 bg-alma-lilac-50 rounded-xl">
                            <Avatar className="w-14 h-14">
                                <AvatarImage src={booking.psychologistPhoto || undefined} />
                                <AvatarFallback className="bg-alma-lilac-200">{initials}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="font-semibold text-alma-blue-900">{booking.psychologistName}</h3>
                                {booking.psychologistCrp && (
                                    <Badge variant="magenta" className="mt-1">
                                        <Award className="w-3 h-3 mr-1" />
                                        CRP {booking.psychologistCrp}
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Date & Time */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-3 bg-alma-lilac-50 rounded-xl">
                                <Calendar className="w-5 h-5 text-alma-magenta-700" />
                                <div>
                                    <p className="text-xs text-alma-blue-900/50">Data</p>
                                    <p className="font-medium text-alma-blue-900 capitalize">
                                        {formatBookingDate(booking.bookingDate)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-alma-lilac-50 rounded-xl">
                                <Clock className="w-5 h-5 text-alma-magenta-700" />
                                <div>
                                    <p className="text-xs text-alma-blue-900/50">Horário</p>
                                    <p className="font-medium text-alma-blue-900">
                                        {booking.startTime.slice(0, 5)} - {booking.endTime.slice(0, 5)}
                                    </p>
                                    <p className="text-xs text-alma-blue-900/50">50 minutos</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Price Breakdown */}
                <Card className="border-0 shadow-lg mb-6">
                    <CardHeader>
                        <CardTitle className="text-lg text-alma-blue-900">Resumo do Pagamento</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-alma-blue-900/70">Sessão de terapia (50 min)</span>
                                <span className="font-medium text-alma-blue-900">{formatCurrency(booking.sessionPrice)}</span>
                            </div>

                            <div className="border-t border-alma-lilac-200 pt-3">
                                <div className="flex justify-between text-lg">
                                    <span className="font-semibold text-alma-blue-900">Total</span>
                                    <span className="font-bold text-alma-blue-900">{formatCurrency(booking.sessionPrice)}</span>
                                </div>
                            </div>

                            {/* Social Impact */}
                            <div className="p-3 bg-alma-magenta-50 rounded-xl mt-4">
                                <div className="flex items-center gap-2">
                                    <Heart className="w-4 h-4 text-alma-magenta-700" />
                                    <span className="text-sm text-alma-magenta-800">
                                        <strong>{formatCurrency(split.socialDonation)}</strong> desta consulta será doado
                                        para o <strong>Lar da Criança Padre Franz Neumair</strong> via Meraki Social 💜
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <Button
                        onClick={handlePayment}
                        className="w-full bg-gradient-to-r from-alma-blue-900 to-alma-magenta-800"
                        size="lg"
                    >
                        <CreditCard className="w-5 h-5 mr-2" />
                        Pagar {formatCurrency(booking.sessionPrice)}
                    </Button>

                    <Button
                        onClick={handleCancel}
                        variant="outline"
                        className="w-full border-red-200 text-red-600 hover:bg-red-50"
                        disabled={isCancelling}
                    >
                        <XCircle className="w-5 h-5 mr-2" />
                        {isCancelling ? 'Cancelando...' : 'Cancelar Reserva'}
                    </Button>
                </div>

                {/* Payment Methods */}
                <div className="mt-8 text-center">
                    <p className="text-xs text-alma-blue-900/50 mb-2">Formas de pagamento aceitas</p>
                    <div className="flex justify-center gap-4">
                        <Badge variant="outline">Cartão de Crédito</Badge>
                        <Badge variant="outline">PIX</Badge>
                    </div>
                </div>
            </main>
        </div>
    )
}
