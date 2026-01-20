'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    Heart,
    ArrowLeft,
    Calendar,
    Clock,
    ChevronLeft,
    ChevronRight,
    Award,
    CheckCircle2,
    AlertCircle,
    Loader2,
    CreditCard,
    Package
} from 'lucide-react'
import { bookSlot } from '@/lib/actions/booking'
import { formatCurrency, calculateRemainingWeeksPackage, CONSULTATION_PRICE } from '@/lib/utils'

interface Psychologist {
    id: string
    fullName: string
    crp?: string
    bio?: string
    specialties?: string[]
    sessionPrice: number
    photoUrl?: string | null
    yearsOfExperience?: number
}

interface AvailableSlot {
    id: string
    day_of_week: string
    start_time: string
    end_time: string
    is_active: boolean
}

interface PsychologistBookingProps {
    psychologist: Psychologist
    availableSlots: AvailableSlot[]
    patientId: string
}

const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const dayFullNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
const dayMap: { [key: string]: number } = {
    'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
    'thursday': 4, 'friday': 5, 'saturday': 6
}

export function PsychologistBooking({ psychologist, availableSlots, patientId }: PsychologistBookingProps) {
    const router = useRouter()
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null)
    const [isBooking, setIsBooking] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const initials = psychologist.fullName
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()

    // Calculate package pricing based on selected date
    const packageInfo = useMemo(() => {
        if (!selectedDate) return null
        const dayOfWeek = selectedDate.getDay()
        return calculateRemainingWeeksPackage(selectedDate, dayOfWeek)
    }, [selectedDate])

    // Get available days of the week based on slots
    const availableDaysOfWeek = useMemo(() => {
        const days = new Set<number>()
        availableSlots.forEach(slot => {
            const dayIndex = dayMap[slot.day_of_week.toLowerCase()]
            if (dayIndex !== undefined) {
                days.add(dayIndex)
            }
        })
        return days
    }, [availableSlots])

    // Generate calendar days for current month
    const calendarDays = useMemo(() => {
        const year = currentMonth.getFullYear()
        const month = currentMonth.getMonth()
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const days: { date: Date; isCurrentMonth: boolean; isAvailable: boolean; isPast: boolean }[] = []

        // Add padding for first week
        const startPadding = firstDay.getDay()
        for (let i = startPadding - 1; i >= 0; i--) {
            const date = new Date(year, month, -i)
            days.push({ date, isCurrentMonth: false, isAvailable: false, isPast: true })
        }

        // Add days of current month
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const date = new Date(year, month, day)
            const dayOfWeek = date.getDay()
            const isPast = date < today
            const isAvailable = !isPast && availableDaysOfWeek.has(dayOfWeek)
            days.push({ date, isCurrentMonth: true, isAvailable, isPast })
        }

        // Add padding for last week
        const endPadding = 6 - lastDay.getDay()
        for (let i = 1; i <= endPadding; i++) {
            const date = new Date(year, month + 1, i)
            days.push({ date, isCurrentMonth: false, isAvailable: false, isPast: false })
        }

        return days
    }, [currentMonth, availableDaysOfWeek])

    // Get slots for selected date
    const slotsForSelectedDate = useMemo(() => {
        if (!selectedDate) return []

        const dayOfWeek = selectedDate.getDay()
        const dayName = Object.keys(dayMap).find(key => dayMap[key] === dayOfWeek) || ''

        return availableSlots
            .filter(slot => slot.day_of_week.toLowerCase() === dayName)
            .sort((a, b) => a.start_time.localeCompare(b.start_time))
    }, [selectedDate, availableSlots])

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date)
        setSelectedSlot(null)
        setError(null)
    }

    const handleSlotSelect = (slot: AvailableSlot) => {
        setSelectedSlot({ start: slot.start_time, end: slot.end_time })
        setError(null)
    }

    const handleBooking = async () => {
        if (!selectedDate || !selectedSlot || !packageInfo) return

        setIsBooking(true)
        setError(null)

        const bookingDate = selectedDate.toISOString().split('T')[0]

        const result = await bookSlot({
            psychologistId: psychologist.id,
            patientId: patientId,
            bookingDate: bookingDate,
            startTime: selectedSlot.start,
            endTime: selectedSlot.end,
            sessionPrice: packageInfo.totalAmount // Total do pacote mensal
        })

        if (result.success && result.booking_id) {
            router.push(`/patient/checkout/${result.booking_id}`)
        } else {
            setError(result.error || 'Erro ao agendar horário')
            setIsBooking(false)
        }
    }

    const formatSelectedDate = (date: Date) => {
        return date.toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        })
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-alma-lilac-50 via-white to-alma-lilac-100">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-alma-lilac-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center h-16 gap-4">
                        <Link href="/patient/search" className="p-2 hover:bg-alma-lilac-100 rounded-lg transition-colors">
                            <ArrowLeft className="w-5 h-5 text-alma-blue-900" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-alma-blue-900 to-alma-magenta-800 flex items-center justify-center">
                                <Heart className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-bold text-alma-blue-900">Agendar Consulta</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Psychologist Info */}
                <Card className="border-0 shadow-lg mb-6">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            <Avatar className="w-20 h-20">
                                <AvatarImage src={psychologist.photoUrl || undefined} />
                                <AvatarFallback className="bg-alma-lilac-200 text-xl">{initials}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <h2 className="text-xl font-semibold text-alma-blue-900">
                                    {psychologist.fullName}
                                </h2>
                                {psychologist.crp && (
                                    <Badge variant="magenta" className="mt-1">
                                        <Award className="w-3 h-3 mr-1" />
                                        CRP {psychologist.crp}
                                    </Badge>
                                )}
                                {psychologist.bio && (
                                    <p className="text-sm text-alma-blue-900/60 mt-2 line-clamp-2">
                                        {psychologist.bio}
                                    </p>
                                )}
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {psychologist.specialties?.slice(0, 3).map(spec => (
                                        <Badge key={spec} variant="lilac" className="text-xs">
                                            {spec}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-alma-blue-900">
                                    {formatCurrency(CONSULTATION_PRICE)}
                                </p>
                                <p className="text-xs text-alma-blue-900/50">por sessão semanal</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Package Info */}
                <Card className="border-0 shadow-lg mb-6 bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3 text-amber-800">
                            <Package className="w-5 h-5" />
                            <div>
                                <p className="font-medium">Como funciona o agendamento mensal</p>
                                <p className="text-sm text-amber-700">
                                    Você pagará pelas sessões restantes no mês atual. O valor é calculado com base
                                    no dia da semana escolhido × {formatCurrency(CONSULTATION_PRICE)} por sessão.
                                    A renovação é automática todo início de mês.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Calendar */}
                <Card className="border-0 shadow-lg mb-6">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg text-alma-blue-900 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-alma-magenta-700" />
                                Escolha o dia da semana para suas sessões
                            </CardTitle>
                            <div className="flex gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <span className="px-3 py-1 font-medium text-alma-blue-900 capitalize">
                                    {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-7 gap-1">
                            {/* Day headers */}
                            {dayNames.map(day => (
                                <div key={day} className="text-center text-xs font-medium text-alma-blue-900/50 py-2">
                                    {day}
                                </div>
                            ))}

                            {/* Calendar days */}
                            {calendarDays.map((day, index) => (
                                <button
                                    key={index}
                                    disabled={!day.isAvailable || !day.isCurrentMonth}
                                    onClick={() => day.isAvailable && handleDateSelect(day.date)}
                                    className={`
                                        aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all
                                        ${!day.isCurrentMonth ? 'text-gray-300' : ''}
                                        ${day.isPast ? 'text-gray-300 cursor-not-allowed' : ''}
                                        ${day.isAvailable && !selectedDate?.toDateString().includes(day.date.toDateString())
                                            ? 'bg-green-50 text-green-700 hover:bg-green-100 cursor-pointer'
                                            : ''
                                        }
                                        ${selectedDate?.toDateString() === day.date.toDateString()
                                            ? 'bg-alma-blue-900 text-white'
                                            : ''
                                        }
                                        ${!day.isAvailable && day.isCurrentMonth && !day.isPast
                                            ? 'text-gray-400'
                                            : ''
                                        }
                                    `}
                                >
                                    {day.date.getDate()}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-4 mt-4 text-xs text-alma-blue-900/60">
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded bg-green-100" />
                                <span>Disponível</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded bg-alma-blue-900" />
                                <span>Selecionado</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Time Slots */}
                {selectedDate && (
                    <Card className="border-0 shadow-lg mb-6">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg text-alma-blue-900 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-alma-magenta-700" />
                                Horários disponíveis
                                <span className="text-sm font-normal text-alma-blue-900/60">
                                    - {dayFullNames[selectedDate.getDay()]}s
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {slotsForSelectedDate.length > 0 ? (
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                                    {slotsForSelectedDate.map(slot => {
                                        const isSelected = selectedSlot?.start === slot.start_time

                                        return (
                                            <button
                                                key={slot.id}
                                                onClick={() => handleSlotSelect(slot)}
                                                className={`
                                                    p-3 rounded-xl text-center font-medium transition-all
                                                    ${isSelected
                                                        ? 'bg-alma-blue-900 text-white'
                                                        : 'bg-alma-lilac-50 text-alma-blue-900 hover:bg-alma-lilac-100'
                                                    }
                                                `}
                                            >
                                                <Clock className={`w-4 h-4 mx-auto mb-1 ${isSelected ? 'text-white' : 'text-alma-blue-900/40'}`} />
                                                <span className="text-sm">{slot.start_time.slice(0, 5)}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Clock className="w-10 h-10 mx-auto mb-2 text-alma-lilac-300" />
                                    <p className="text-alma-blue-900/60">Nenhum horário disponível neste dia</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Error message */}
                {error && (
                    <Card className="border-0 shadow-lg mb-6 border-red-200 bg-red-50">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3 text-red-700">
                                <AlertCircle className="w-5 h-5" />
                                <p className="font-medium">{error}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Booking Summary & Button */}
                {selectedDate && selectedSlot && packageInfo && (
                    <Card className="border-0 shadow-lg bg-gradient-to-r from-alma-blue-900 to-alma-blue-800 text-white">
                        <CardContent className="p-6">
                            <div className="mb-4">
                                <p className="text-white/70 text-sm">Resumo do agendamento</p>
                                <p className="font-semibold text-lg">
                                    {dayFullNames[selectedDate.getDay()]}s às {selectedSlot.start.slice(0, 5)}
                                </p>
                                <p className="text-sm text-white/70">
                                    Sessões semanais de 50 minutos com {psychologist.fullName}
                                </p>
                            </div>

                            {/* Package Calculation */}
                            <div className="bg-white/10 rounded-xl p-4 mb-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Package className="w-4 h-4" />
                                    <span className="font-medium">Pacote de {packageInfo.monthName}</span>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-white/70">{packageInfo.sessions} sessão(ões) × {formatCurrency(CONSULTATION_PRICE)}</span>
                                        <span>{formatCurrency(packageInfo.totalAmount)}</span>
                                    </div>
                                    <div className="flex justify-between text-white/60 text-xs">
                                        <span>💜 Doação Meraki Social (1%)</span>
                                        <span>{formatCurrency(packageInfo.socialDonation)}</span>
                                    </div>
                                </div>

                                <div className="border-t border-white/20 mt-3 pt-3">
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total</span>
                                        <span>{formatCurrency(packageInfo.totalAmount)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-xs text-white/60 mb-4 bg-white/5 rounded-lg p-3">
                                <p className="font-medium text-white/80 mb-1">ℹ️ Renovação automática</p>
                                <p>No próximo mês, você será cobrado automaticamente pelo pacote completo
                                    (4 ou 5 sessões, conforme o mês). Avisaremos 5 dias antes da renovação.</p>
                            </div>

                            <Button
                                onClick={handleBooking}
                                disabled={isBooking}
                                className="w-full bg-white text-alma-blue-900 hover:bg-white/90"
                                size="lg"
                            >
                                {isBooking ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Processando...
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className="w-4 h-4 mr-2" />
                                        Ir para Pagamento - {formatCurrency(packageInfo.totalAmount)}
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
    )
}
