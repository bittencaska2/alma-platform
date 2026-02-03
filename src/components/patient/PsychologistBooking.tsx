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
    Clock,
    Award,
    AlertCircle,
    Loader2
} from 'lucide-react'
import { DateStrip } from '@/components/booking/DateStrip'
import { BookingSummaryCard } from '@/components/booking/BookingSummaryCard'
import { bookSlot } from '@/lib/actions/booking'
import {
    getNextAvailableDays,
    formatDateForStrip,
    CONSULTATION_PRICE,
    cn
} from '@/lib/utils'

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

const dayFullNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
const dayMap: { [key: string]: number } = {
    'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
    'thursday': 4, 'friday': 5, 'saturday': 6
}

export function PsychologistBooking({ psychologist, availableSlots, patientId }: PsychologistBookingProps) {
    const router = useRouter()
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

    // Calculate next 5 available days with 24h rule
    const availableDays = useMemo(() => {
        const today = new Date()
        const nextDays = getNextAvailableDays(today, availableSlots, 5, 24)

        return nextDays.map(date => {
            const { dayName, dayNumber, fullDate } = formatDateForStrip(date)
            const weekday = date.getDay()
            const dayNameKey = Object.keys(dayMap).find(key => dayMap[key] === weekday) || ''
            const hasSlotsAvailable = availableSlots.some(
                slot => slot.day_of_week.toLowerCase() === dayNameKey
            )

            return {
                date,
                dayName,
                dayNumber,
                fullDate,
                isAvailable: hasSlotsAvailable,
                hasSlotsAvailable
            }
        })
    }, [availableSlots])

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
        if (!selectedDate || !selectedSlot) return

        setIsBooking(true)
        setError(null)

        const bookingDate = selectedDate.toISOString().split('T')[0]

        const result = await bookSlot({
            psychologistId: psychologist.id,
            patientId: patientId,
            bookingDate: bookingDate,
            startTime: selectedSlot.start,
            endTime: selectedSlot.end,
            sessionPrice: psychologist.sessionPrice || CONSULTATION_PRICE
        })

        if (result.success && result.booking_id) {
            router.push(`/patient/checkout/${result.booking_id}`)
        } else {
            setError(result.error || 'Erro ao agendar horário')
            setIsBooking(false)
        }
    }

    const formatSelectedTime = () => {
        if (!selectedSlot) return null
        return `${selectedSlot.start.slice(0, 5)} - ${selectedSlot.end.slice(0, 5)}`
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

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Psychologist Info Card */}
                <Card className="border-0 shadow-lg mb-8">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            <Avatar className="w-20 h-20 border-2 border-alma-lilac-200">
                                <AvatarImage src={psychologist.photoUrl || undefined} />
                                <AvatarFallback className="bg-alma-lilac-200 text-xl font-semibold text-alma-blue-900">
                                    {initials}
                                </AvatarFallback>
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
                        </div>
                    </CardContent>
                </Card>

                {/* 2-Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Date & Time Selection (65%) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Date Strip */}
                        <Card className="border-0 shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-lg text-alma-blue-900">
                                    Escolha o dia da sua primeira sessão
                                </CardTitle>
                                <p className="text-sm text-alma-blue-700/70">
                                    Mostrando os próximos 5 dias disponíveis (mínimo 24h de antecedência)
                                </p>
                            </CardHeader>
                            <CardContent>
                                <DateStrip
                                    availableDays={availableDays}
                                    selectedDate={selectedDate}
                                    onSelectDate={handleDateSelect}
                                />
                            </CardContent>
                        </Card>

                        {/* Time Slots */}
                        {selectedDate && (
                            <Card className="border-0 shadow-lg">
                                <CardHeader>
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
                                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                            {slotsForSelectedDate.map(slot => {
                                                const isSelected = selectedSlot?.start === slot.start_time

                                                return (
                                                    <button
                                                        key={slot.id}
                                                        onClick={() => handleSlotSelect(slot)}
                                                        className={cn(
                                                            "p-4 rounded-xl text-center font-semibold transition-all duration-200",
                                                            isSelected
                                                                ? 'bg-[#8B5CF6] text-white shadow-md'
                                                                : 'bg-white text-gray-700 hover:bg-purple-50 border-2 border-gray-200 hover:border-purple-300'
                                                        )}
                                                    >
                                                        <Clock className={cn(
                                                            "w-4 h-4 mx-auto mb-1",
                                                            isSelected ? 'text-white' : 'text-gray-400'
                                                        )} />
                                                        <span className="text-sm block">
                                                            {slot.start_time.slice(0, 5)}
                                                        </span>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <Clock className="w-12 h-12 mx-auto mb-3 text-alma-lilac-300" />
                                            <p className="text-alma-blue-900/60">Nenhum horário disponível neste dia</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Error message */}
                        {error && (
                            <Card className="border-2 border-red-200 bg-red-50 shadow-lg">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3 text-red-700">
                                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                        <p className="font-medium">{error}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column - Sticky Summary Card (35%) */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-4">
                            <BookingSummaryCard
                                psychologist={{
                                    id: psychologist.id,
                                    fullName: psychologist.fullName,
                                    photoUrl: psychologist.photoUrl,
                                    crp: psychologist.crp,
                                    sessionPrice: psychologist.sessionPrice
                                }}
                                selectedDate={selectedDate}
                                selectedTime={formatSelectedTime()}
                                onConfirm={handleBooking}
                                isLoading={isBooking}
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
