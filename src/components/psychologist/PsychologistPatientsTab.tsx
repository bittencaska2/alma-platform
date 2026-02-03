'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
    Users,
    MessageCircle,
    Calendar,
    ChevronRight,
    Clock
} from 'lucide-react'

interface Patient {
    id: string
    fullName: string
    photoUrl?: string | null
    lastAppointment?: string | null
    nextAppointment?: string | null
    status: 'active' | 'pending' | 'inactive'
    totalSessions: number
}

interface PsychologistPatientsTabProps {
    patients: Patient[]
}

export function PsychologistPatientsTab({ patients }: PsychologistPatientsTabProps) {
    // Sort patients alphabetically
    const sortedPatients = [...patients].sort((a, b) =>
        a.fullName.localeCompare(b.fullName, 'pt-BR')
    )

    const getStatusBadge = (status: string) => {
        const config: Record<string, { label: string; className: string }> = {
            active: { label: 'Ativo', className: 'bg-green-100 text-green-800' },
            pending: { label: 'Pendente', className: 'bg-amber-100 text-amber-800' },
            inactive: { label: 'Inativo', className: 'bg-gray-100 text-gray-600' }
        }
        return config[status] || config.inactive
    }

    const formatDate = (dateStr?: string | null) => {
        if (!dateStr) return null
        return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short'
        })
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()
    }

    return (
        <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg text-alma-blue-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-alma-magenta-700" />
                    Meus Pacientes
                    {patients.length > 0 && (
                        <Badge variant="lilac" className="ml-2">{patients.length}</Badge>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {sortedPatients.length > 0 ? (
                    <div className="space-y-4">
                        {/* Desktop: Horizontal cards */}
                        <div className="hidden md:grid md:grid-cols-1 lg:grid-cols-2 gap-4">
                            {sortedPatients.map((patient) => {
                                const statusConfig = getStatusBadge(patient.status)
                                return (
                                    <Link
                                        key={patient.id}
                                        href={`/psychologist/chat?patient=${patient.id}`}
                                        className="block"
                                    >
                                        <div className="flex items-stretch bg-white border border-alma-lilac-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-alma-magenta-300 transition-all group h-32">
                                            {/* Photo Section */}
                                            <div className="w-32 bg-gradient-to-br from-alma-lilac-100 to-alma-lilac-50 flex items-center justify-center p-4 flex-shrink-0">
                                                <Avatar className="w-20 h-20 border-4 border-white shadow-md">
                                                    <AvatarImage src={patient.photoUrl || undefined} />
                                                    <AvatarFallback className="bg-alma-blue-900 text-white text-xl font-semibold">
                                                        {getInitials(patient.fullName)}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </div>

                                            {/* Info Section */}
                                            <div className="flex-1 p-4 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex items-start justify-between">
                                                        <h3 className="font-semibold text-alma-blue-900 text-lg group-hover:text-alma-magenta-700 transition-colors">
                                                            {patient.fullName}
                                                        </h3>
                                                        <Badge className={statusConfig.className}>
                                                            {statusConfig.label}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-alma-blue-900/60 mt-1">
                                                        {patient.totalSessions} sessões realizadas
                                                    </p>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4 text-xs text-alma-blue-900/50">
                                                        {patient.nextAppointment && (
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="w-3 h-3" />
                                                                Próx: {formatDate(patient.nextAppointment)}
                                                            </span>
                                                        )}
                                                        {patient.lastAppointment && (
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                Últ: {formatDate(patient.lastAppointment)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-alma-magenta-700 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <MessageCircle className="w-4 h-4" />
                                                        <ChevronRight className="w-4 h-4" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>

                        {/* Mobile: Vertical compact cards */}
                        <div className="md:hidden space-y-3">
                            {sortedPatients.map((patient) => {
                                const statusConfig = getStatusBadge(patient.status)
                                return (
                                    <Link
                                        key={patient.id}
                                        href={`/psychologist/chat?patient=${patient.id}`}
                                        className="block"
                                    >
                                        <div className="flex items-center gap-4 p-4 bg-white border border-alma-lilac-200 rounded-xl hover:shadow-md hover:border-alma-magenta-300 transition-all">
                                            <Avatar className="w-14 h-14 border-2 border-alma-lilac-100">
                                                <AvatarImage src={patient.photoUrl || undefined} />
                                                <AvatarFallback className="bg-alma-blue-900 text-white font-semibold">
                                                    {getInitials(patient.fullName)}
                                                </AvatarFallback>
                                            </Avatar>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-alma-blue-900 truncate">
                                                        {patient.fullName}
                                                    </h3>
                                                    <Badge className={`${statusConfig.className} text-xs`}>
                                                        {statusConfig.label}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-alma-blue-900/60">
                                                    {patient.totalSessions} sessões
                                                </p>
                                                {patient.nextAppointment && (
                                                    <p className="text-xs text-alma-blue-900/50 flex items-center gap-1 mt-1">
                                                        <Calendar className="w-3 h-3" />
                                                        Próx: {formatDate(patient.nextAppointment)}
                                                    </p>
                                                )}
                                            </div>

                                            <ChevronRight className="w-5 h-5 text-alma-lilac-400" />
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12 text-alma-blue-900/60">
                        <Users className="w-16 h-16 mx-auto mb-4 text-alma-lilac-300" />
                        <h3 className="text-lg font-medium text-alma-blue-900 mb-2">
                            Nenhum paciente ainda
                        </h3>
                        <p className="text-sm">
                            Quando pacientes agendarem consultas com você, eles aparecerão aqui.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
