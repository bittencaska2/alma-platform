'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    Heart,
    ArrowLeft,
    Calendar,
    Clock,
    MessageCircle,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Video
} from 'lucide-react'

interface Appointment {
    id: string
    scheduled_date: string
    start_time: string
    end_time: string
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
    patients: {
        id: string
        profiles: {
            full_name: string
            photo_url: string | null
        }
    }
}

interface PsychologistAppointmentsProps {
    appointments: Appointment[]
}

const statusConfig = {
    pending: { label: 'Pendente', color: 'bg-amber-100 text-amber-800', icon: AlertCircle },
    confirmed: { label: 'Confirmado', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
    completed: { label: 'Realizado', color: 'bg-blue-100 text-blue-800', icon: CheckCircle2 },
    cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: XCircle },
}

export function PsychologistAppointments({ appointments }: PsychologistAppointmentsProps) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayStr = today.toISOString().split('T')[0]

    const todayAppointments = appointments.filter(apt =>
        apt.scheduled_date === todayStr && apt.status !== 'cancelled'
    )

    const upcomingAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.scheduled_date)
        return aptDate > today && apt.status !== 'cancelled'
    })

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr + 'T00:00:00')
        return date.toLocaleDateString('pt-BR', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        })
    }

    const AppointmentCard = ({ apt, showDate = false }: { apt: Appointment, showDate?: boolean }) => {
        const StatusIcon = statusConfig[apt.status].icon
        const initials = apt.patients.profiles.full_name
            .split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()

        return (
            <div className="flex items-center gap-4 p-4 bg-alma-lilac-50 rounded-xl">
                <Avatar className="w-14 h-14">
                    <AvatarImage src={apt.patients.profiles.photo_url || undefined} />
                    <AvatarFallback className="bg-alma-lilac-200">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <h4 className="font-semibold text-alma-blue-900">
                        {apt.patients.profiles.full_name}
                    </h4>
                    {showDate && (
                        <p className="text-sm text-alma-blue-900/60">
                            {formatDate(apt.scheduled_date)}
                        </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-4 h-4 text-alma-blue-900/40" />
                        <span className="text-sm text-alma-blue-900/60">
                            {apt.start_time.slice(0, 5)} - {apt.end_time.slice(0, 5)}
                        </span>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <Badge className={statusConfig[apt.status].color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConfig[apt.status].label}
                    </Badge>
                    {apt.status === 'confirmed' && (
                        <div className="flex gap-2">
                            <Link href={`/psychologist/chat?patient=${apt.patients.id}`}>
                                <Button size="sm" variant="outline">
                                    <MessageCircle className="w-4 h-4" />
                                </Button>
                            </Link>
                            <Button size="sm" variant="default">
                                <Video className="w-4 h-4 mr-1" />
                                Iniciar
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-alma-lilac-50 via-white to-alma-lilac-100">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-alma-lilac-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center h-16 gap-4">
                        <Link href="/psychologist/dashboard" className="p-2 hover:bg-alma-lilac-100 rounded-lg transition-colors">
                            <ArrowLeft className="w-5 h-5 text-alma-blue-900" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-alma-blue-900 to-alma-magenta-800 flex items-center justify-center">
                                <Heart className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-bold text-alma-blue-900">Minhas Consultas</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Today's Appointments */}
                <Card className="border-0 shadow-lg mb-6">
                    <CardHeader>
                        <CardTitle className="text-lg text-alma-blue-900 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-alma-magenta-700" />
                            Consultas de Hoje
                            <Badge variant="magenta">{todayAppointments.length}</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {todayAppointments.length > 0 ? (
                            <div className="space-y-4">
                                {todayAppointments.map(apt => (
                                    <AppointmentCard key={apt.id} apt={apt} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Calendar className="w-12 h-12 mx-auto mb-3 text-alma-lilac-300" />
                                <p className="text-alma-blue-900/60">Nenhuma consulta agendada para hoje</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Upcoming Appointments */}
                <Card className="border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-lg text-alma-blue-900 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-alma-blue-900/40" />
                            Próximas Consultas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {upcomingAppointments.length > 0 ? (
                            <div className="space-y-3">
                                {upcomingAppointments.map(apt => (
                                    <AppointmentCard key={apt.id} apt={apt} showDate />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Clock className="w-12 h-12 mx-auto mb-3 text-alma-lilac-300" />
                                <p className="text-alma-blue-900/60">Nenhuma consulta agendada</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
