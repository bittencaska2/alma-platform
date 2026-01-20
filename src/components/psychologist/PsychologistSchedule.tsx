'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Heart,
    ArrowLeft,
    CalendarClock,
    Clock,
    Save,
    CheckCircle2
} from 'lucide-react'
import { updatePsychologistSchedule } from '@/lib/actions/profile'

interface Slot {
    id: string
    day_of_week: number
    start_time: string
    end_time: string
    is_available: boolean
}

interface PsychologistScheduleProps {
    slots: Slot[]
    psychologistId: string
}

const daysOfWeek = [
    { value: 0, label: 'Domingo' },
    { value: 1, label: 'Segunda-feira' },
    { value: 2, label: 'Terça-feira' },
    { value: 3, label: 'Quarta-feira' },
    { value: 4, label: 'Quinta-feira' },
    { value: 5, label: 'Sexta-feira' },
    { value: 6, label: 'Sábado' },
]

const defaultTimeSlots = [
    { start: '08:00', end: '08:50' },
    { start: '09:00', end: '09:50' },
    { start: '10:00', end: '10:50' },
    { start: '11:00', end: '11:50' },
    { start: '14:00', end: '14:50' },
    { start: '15:00', end: '15:50' },
    { start: '16:00', end: '16:50' },
    { start: '17:00', end: '17:50' },
    { start: '18:00', end: '18:50' },
    { start: '19:00', end: '19:50' },
]

export function PsychologistSchedule({ slots, psychologistId }: PsychologistScheduleProps) {
    const [selectedDays, setSelectedDays] = useState<number[]>(
        Array.from(new Set(slots.map(s => s.day_of_week)))
    )
    const [selectedSlots, setSelectedSlots] = useState<{ [key: string]: string[] }>(
        slots.reduce((acc, slot) => {
            const key = slot.day_of_week.toString()
            if (!acc[key]) acc[key] = []
            acc[key].push(`${slot.start_time.slice(0, 5)}-${slot.end_time.slice(0, 5)}`)
            return acc
        }, {} as { [key: string]: string[] })
    )
    const [isSaving, setIsSaving] = useState(false)
    const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const toggleDay = (day: number) => {
        if (selectedDays.includes(day)) {
            setSelectedDays(selectedDays.filter(d => d !== day))
            const newSlots = { ...selectedSlots }
            delete newSlots[day.toString()]
            setSelectedSlots(newSlots)
        } else {
            setSelectedDays([...selectedDays, day])
        }
    }

    const toggleSlot = (day: number, slot: string) => {
        const key = day.toString()
        const currentSlots = selectedSlots[key] || []

        if (currentSlots.includes(slot)) {
            setSelectedSlots({
                ...selectedSlots,
                [key]: currentSlots.filter(s => s !== slot)
            })
        } else {
            setSelectedSlots({
                ...selectedSlots,
                [key]: [...currentSlots, slot]
            })
        }
    }

    const handleSave = async () => {
        setIsSaving(true)
        setSaveMessage(null)

        // Build slots array for the server action
        const slotsToSave: { dayOfWeek: number; startTime: string; endTime: string }[] = []

        Object.entries(selectedSlots).forEach(([day, times]) => {
            times.forEach(time => {
                const [start, end] = time.split('-')
                slotsToSave.push({
                    dayOfWeek: parseInt(day),
                    startTime: start,
                    endTime: end
                })
            })
        })

        const result = await updatePsychologistSchedule(psychologistId, slotsToSave)

        if (result.error) {
            setSaveMessage({ type: 'error', text: result.error })
        } else {
            setSaveMessage({ type: 'success', text: 'Agenda salva com sucesso!' })
        }

        setIsSaving(false)
    }

    const getTotalSlots = () => {
        return Object.values(selectedSlots).reduce((sum, arr) => sum + arr.length, 0)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-alma-lilac-50 via-white to-alma-lilac-100">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-alma-lilac-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Link href="/psychologist/dashboard" className="p-2 hover:bg-alma-lilac-100 rounded-lg transition-colors">
                                <ArrowLeft className="w-5 h-5 text-alma-blue-900" />
                            </Link>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-alma-blue-900 to-alma-magenta-800 flex items-center justify-center">
                                    <Heart className="w-4 h-4 text-white" />
                                </div>
                                <span className="font-bold text-alma-blue-900">Gerenciar Agenda</span>
                            </div>
                        </div>
                        <Button onClick={handleSave} disabled={isSaving}>
                            <Save className="w-4 h-4 mr-2" />
                            {isSaving ? 'Salvando...' : 'Salvar'}
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Info Card */}
                <Card className="border-0 shadow-lg mb-6 bg-gradient-to-r from-alma-blue-900 to-alma-blue-800 text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <CalendarClock className="w-10 h-10" />
                            <div>
                                <h2 className="text-xl font-semibold">Configure seus horários de atendimento</h2>
                                <p className="text-white/70">
                                    Selecione os dias e horários que você está disponível para atender.
                                    Cada sessão tem <strong>50 minutos</strong> de duração.
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-4">
                            <Badge className="bg-white/20 text-white">
                                <Clock className="w-3 h-3 mr-1" />
                                {getTotalSlots()} slots configurados
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Save Feedback Message */}
                {saveMessage && (
                    <Card className={`border-0 shadow-lg mb-6 ${saveMessage.type === 'success' ? 'bg-green-50' : 'bg-red-50'
                        }`}>
                        <CardContent className="p-4">
                            <div className={`flex items-center gap-3 ${saveMessage.type === 'success' ? 'text-green-800' : 'text-red-800'
                                }`}>
                                <CheckCircle2 className="w-5 h-5" />
                                <p className="font-medium">{saveMessage.text}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Day Selection */}
                <Card className="border-0 shadow-lg mb-6">
                    <CardHeader>
                        <CardTitle className="text-lg text-alma-blue-900">Dias de Atendimento</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {daysOfWeek.map(day => (
                                <button
                                    key={day.value}
                                    onClick={() => toggleDay(day.value)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedDays.includes(day.value)
                                        ? 'bg-alma-blue-900 text-white'
                                        : 'bg-alma-lilac-100 text-alma-blue-900 hover:bg-alma-lilac-200'
                                        }`}
                                >
                                    {day.label}
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Time Slots per Day */}
                {selectedDays.sort((a, b) => a - b).map(day => {
                    const dayName = daysOfWeek.find(d => d.value === day)?.label
                    const daySlots = selectedSlots[day.toString()] || []

                    return (
                        <Card key={day} className="border-0 shadow-lg mb-4">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-md text-alma-blue-900 flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                    {dayName}
                                    <Badge variant="lilac" className="ml-2">
                                        {daySlots.length} horários
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                                    {defaultTimeSlots.map(slot => {
                                        const slotKey = `${slot.start}-${slot.end}`
                                        const isSelected = daySlots.includes(slotKey)

                                        return (
                                            <button
                                                key={slotKey}
                                                onClick={() => toggleSlot(day, slotKey)}
                                                className={`p-3 rounded-lg text-sm font-medium transition-all ${isSelected
                                                    ? 'bg-green-100 text-green-800 border-2 border-green-500'
                                                    : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:border-alma-lilac-300'
                                                    }`}
                                            >
                                                <Clock className={`w-4 h-4 mx-auto mb-1 ${isSelected ? 'text-green-600' : 'text-gray-400'}`} />
                                                {slot.start} - {slot.end}
                                            </button>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}

                {selectedDays.length === 0 && (
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-8 text-center">
                            <CalendarClock className="w-12 h-12 mx-auto mb-3 text-alma-lilac-300" />
                            <p className="text-alma-blue-900/60">Selecione os dias da semana acima para configurar seus horários</p>
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
    )
}
