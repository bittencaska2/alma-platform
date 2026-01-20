'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Clock, Check } from 'lucide-react'
import { cn, generateTimeSlots } from '@/lib/utils'

interface AvailabilitySlot {
    dayOfWeek: string
    startTime: string
    endTime: string
}

interface ScheduleSelectorProps {
    psychologistName: string
    availability: AvailabilitySlot[]
    onSelectSlot: (date: Date, startTime: string, endTime: string) => void
    selectedSlot?: { date: Date; startTime: string } | null
}

const WEEKDAYS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']
const WEEKDAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const WEEKDAYS_EN = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const MONTHS = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

export function ScheduleSelector({
    psychologistName,
    availability,
    onSelectSlot,
    selectedSlot,
}: ScheduleSelectorProps) {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)

    // Get calendar days for current month view
    const calendarDays = useMemo(() => {
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth()

        const firstDayOfMonth = new Date(year, month, 1)
        const lastDayOfMonth = new Date(year, month + 1, 0)

        const startDate = new Date(firstDayOfMonth)
        startDate.setDate(startDate.getDate() - startDate.getDay())

        const days: Date[] = []
        const current = new Date(startDate)

        while (current <= lastDayOfMonth || days.length % 7 !== 0) {
            days.push(new Date(current))
            current.setDate(current.getDate() + 1)
            if (days.length > 42) break // Safety limit
        }

        return days
    }, [currentDate])

    // Check if a date has available slots
    const hasAvailability = (date: Date): boolean => {
        const dayOfWeek = WEEKDAYS_EN[date.getDay()]
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        if (date < today) return false

        return availability.some(slot => slot.dayOfWeek === dayOfWeek)
    }

    // Get available time slots for selected date
    const availableSlots = useMemo(() => {
        if (!selectedDate) return []

        const dayOfWeek = WEEKDAYS_EN[selectedDate.getDay()]
        const daySlots = availability.filter(slot => slot.dayOfWeek === dayOfWeek)

        const allSlots: { start: string; end: string }[] = []

        daySlots.forEach(slot => {
            const timeSlots = generateTimeSlots(slot.startTime, slot.endTime, 50)
            timeSlots.forEach(timeRange => {
                const [start, end] = timeRange.split('-')
                allSlots.push({ start, end })
            })
        })

        return allSlots
    }, [selectedDate, availability])

    const goToPreviousMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
        setSelectedDate(null)
    }

    const goToNextMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
        setSelectedDate(null)
    }

    const isToday = (date: Date): boolean => {
        const today = new Date()
        return date.toDateString() === today.toDateString()
    }

    const isCurrentMonth = (date: Date): boolean => {
        return date.getMonth() === currentDate.getMonth()
    }

    const isSelected = (date: Date): boolean => {
        return selectedDate?.toDateString() === date.toDateString()
    }

    const isSlotSelected = (start: string): boolean => {
        if (!selectedSlot || !selectedDate) return false
        return (
            selectedSlot.date.toDateString() === selectedDate.toDateString() &&
            selectedSlot.startTime === start
        )
    }

    return (
        <Card className="border-0 shadow-xl">
            <CardHeader className="pb-4">
                <CardTitle className="text-xl text-alma-blue-900">
                    Agendar com {psychologistName}
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Calendar Header */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={goToPreviousMonth}
                        className="text-alma-blue-900"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Button>

                    <h3 className="font-semibold text-lg text-alma-blue-900">
                        {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h3>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={goToNextMonth}
                        className="text-alma-blue-900"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                </div>

                {/* Weekday headers */}
                <div className="grid grid-cols-7 gap-1">
                    {WEEKDAYS_SHORT.map(day => (
                        <div
                            key={day}
                            className="text-center text-sm font-medium text-alma-blue-900/60 py-2"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((date, index) => {
                        const available = hasAvailability(date)
                        const current = isCurrentMonth(date)
                        const today = isToday(date)
                        const selected = isSelected(date)

                        return (
                            <button
                                key={index}
                                onClick={() => available && setSelectedDate(date)}
                                disabled={!available}
                                className={cn(
                                    "aspect-square flex items-center justify-center rounded-lg text-sm transition-all",
                                    !current && "text-alma-blue-900/30",
                                    current && !available && "text-alma-blue-900/40",
                                    current && available && "text-alma-blue-900 hover:bg-alma-lilac-100 cursor-pointer",
                                    today && "ring-2 ring-alma-magenta-500 ring-offset-2",
                                    selected && "bg-alma-blue-900 text-white hover:bg-alma-blue-800",
                                    !available && "cursor-not-allowed"
                                )}
                            >
                                {date.getDate()}
                            </button>
                        )
                    })}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 text-xs text-alma-blue-900/60 pt-2 border-t border-alma-lilac-100">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-alma-blue-900"></div>
                        <span>Selecionado</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded ring-2 ring-alma-magenta-500"></div>
                        <span>Hoje</span>
                    </div>
                </div>

                {/* Time Slots */}
                {selectedDate && (
                    <div className="pt-4 border-t border-alma-lilac-100">
                        <h4 className="font-medium text-alma-blue-900 mb-4 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Horários disponíveis para {selectedDate.toLocaleDateString('pt-BR', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long'
                            })}
                        </h4>

                        {availableSlots.length > 0 ? (
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                {availableSlots.map(({ start, end }, index) => (
                                    <button
                                        key={index}
                                        onClick={() => onSelectSlot(selectedDate, start, end)}
                                        className={cn(
                                            "py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all",
                                            isSlotSelected(start)
                                                ? "border-alma-blue-900 bg-alma-blue-900 text-white"
                                                : "border-alma-lilac-200 text-alma-blue-900 hover:border-alma-blue-500 hover:bg-alma-lilac-50"
                                        )}
                                    >
                                        <div className="flex items-center justify-center gap-1">
                                            {isSlotSelected(start) && <Check className="w-4 h-4" />}
                                            {start}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-alma-blue-900/60 text-center py-4">
                                Nenhum horário disponível nesta data
                            </p>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
