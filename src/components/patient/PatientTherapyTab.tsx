'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    Calendar,
    Clock,
    MessageCircle,
    Search,
    CheckCircle2,
    AlertCircle,
    Sparkles
} from 'lucide-react'

interface Appointment {
    id: string
    scheduled_date: string
    start_time: string
    end_time: string
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
}

interface ActivePackage {
    psychologist: {
        id: string
        fullName: string
        crp: string
        photoUrl?: string | null
    }
    sessionsRemaining: number
    totalSessions: number
    nextAppointment?: Appointment | null
}

interface PatientTherapyTabProps {
    activePackage?: ActivePackage | null
    appointmentHistory: Appointment[]
    psychologistName?: string
}

export function PatientTherapyTab({
    activePackage,
    appointmentHistory
}: PatientTherapyTabProps) {
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr + 'T00:00:00')
        return date.toLocaleDateString('pt-BR', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        })
    }

    const getStatusBadge = (status: string) => {
        const config: Record<string, { label: string; className: string }> = {
            pending: { label: 'Pendente', className: 'bg-amber-100 text-amber-800' },
            confirmed: { label: 'Confirmado', className: 'bg-green-100 text-green-800' },
            completed: { label: 'Realizado', className: 'bg-blue-100 text-blue-800' },
            cancelled: { label: 'Cancelado', className: 'bg-red-100 text-red-800' }
        }
        return config[status] || config.pending
    }

    return (
        <div className="space-y-6">
            {/* Active Package Card */}
            {activePackage ? (
                <Card className="border-0 shadow-lg bg-gradient-to-br from-alma-blue-900 to-alma-blue-800 text-white overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                            <Avatar className="w-16 h-16 border-2 border-white/30">
                                <AvatarImage src={activePackage.psychologist.photoUrl || undefined} />
                                <AvatarFallback className="bg-white/20 text-white text-lg">
                                    {activePackage.psychologist.fullName.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex-1">
                                <p className="text-white/70 text-sm">Seu Psicólogo</p>
                                <h3 className="text-xl font-semibold">{activePackage.psychologist.fullName}</h3>
                                <p className="text-white/60 text-sm">CRP {activePackage.psychologist.crp}</p>
                            </div>

                            <Link href={`/patient/chat`}>
                                <Button className="bg-white text-alma-blue-900 hover:bg-white/90 gap-2">
                                    <MessageCircle className="w-4 h-4" />
                                    Abrir Chat
                                </Button>
                            </Link>
                        </div>

                        {/* Sessions Counter */}
                        <div className="mt-6 pt-4 border-t border-white/20">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-amber-300" />
                                    <span className="text-white/80">Sessões restantes</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-3xl font-bold">{activePackage.sessionsRemaining}</span>
                                    <span className="text-white/60">/ {activePackage.totalSessions}</span>
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-amber-400 to-amber-300 rounded-full transition-all"
                                    style={{
                                        width: `${(activePackage.sessionsRemaining / activePackage.totalSessions) * 100}%`
                                    }}
                                />
                            </div>
                        </div>

                        {/* Next Appointment */}
                        {activePackage.nextAppointment && (
                            <div className="mt-4 p-3 bg-white/10 rounded-xl flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-white/70" />
                                <div>
                                    <p className="text-sm text-white/70">Próxima sessão</p>
                                    <p className="font-medium">
                                        {formatDate(activePackage.nextAppointment.scheduled_date)} às {activePackage.nextAppointment.start_time.slice(0, 5)}
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <Card className="border-0 shadow-lg">
                    <CardContent className="p-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-alma-lilac-100 flex items-center justify-center">
                            <Search className="w-8 h-8 text-alma-lilac-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-alma-blue-900 mb-2">
                            Nenhum pacote ativo
                        </h3>
                        <p className="text-alma-blue-900/60 mb-4">
                            Encontre o psicólogo ideal e comece sua jornada de autoconhecimento
                        </p>
                        <Link href="/patient/search">
                            <Button className="gap-2">
                                <Search className="w-4 h-4" />
                                Buscar Psicólogo
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            )}

            {/* Appointment History */}
            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-lg text-alma-blue-900 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-alma-magenta-700" />
                        Histórico de Consultas
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {appointmentHistory.length > 0 ? (
                        <div className="space-y-3">
                            {appointmentHistory.map((apt) => {
                                const statusConfig = getStatusBadge(apt.status)
                                return (
                                    <div
                                        key={apt.id}
                                        className="flex items-center justify-between p-3 bg-alma-lilac-50 rounded-xl"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                                                {apt.status === 'completed' ? (
                                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                                ) : apt.status === 'cancelled' ? (
                                                    <AlertCircle className="w-5 h-5 text-red-500" />
                                                ) : (
                                                    <Calendar className="w-5 h-5 text-alma-blue-900" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-alma-blue-900">
                                                    {formatDate(apt.scheduled_date)}
                                                </p>
                                                <p className="text-sm text-alma-blue-900/60">
                                                    {apt.start_time.slice(0, 5)} - {apt.end_time.slice(0, 5)}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge className={statusConfig.className}>
                                            {statusConfig.label}
                                        </Badge>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-alma-blue-900/60">
                            <Clock className="w-12 h-12 mx-auto mb-3 text-alma-lilac-300" />
                            <p>Nenhuma consulta realizada ainda</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
