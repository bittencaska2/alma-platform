'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
    Heart,
    Calendar,
    MessageCircle,
    CreditCard,
    Settings,
    LogOut,
    Bell,
    ChevronRight,
    Clock,
    Users,
    DollarSign,
    CalendarClock,
    CheckCircle2
} from 'lucide-react'
import { signOut } from '@/lib/actions/auth'

interface ScheduleSlot {
    dayOfWeek: number
    startTime: string
    endTime: string
}

interface PsychologistDashboardProps {
    user: {
        id: string
        email: string
        fullName: string
        photoUrl?: string
        crp: string
    }
    scheduleSlots?: ScheduleSlot[]
}

const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export function PsychologistDashboard({ user, scheduleSlots = [] }: PsychologistDashboardProps) {
    const initials = user.fullName
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()

    const handleSignOut = async () => {
        await signOut()
    }

    // Group slots by day
    const slotsByDay: { [key: number]: string[] } = {}
    scheduleSlots.forEach(slot => {
        if (!slotsByDay[slot.dayOfWeek]) {
            slotsByDay[slot.dayOfWeek] = []
        }
        slotsByDay[slot.dayOfWeek].push(slot.startTime)
    })

    const totalSlots = scheduleSlots.length
    const configureDays = Object.keys(slotsByDay).length

    return (
        <div className="min-h-screen bg-gradient-to-br from-alma-lilac-50 via-white to-alma-lilac-100">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-alma-lilac-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-alma-blue-900 to-alma-magenta-800 flex items-center justify-center">
                                <Heart className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-bold text-alma-blue-900">Alma</span>
                                <span className="text-[10px] text-alma-magenta-700 -mt-1">by Meraki Psicologia</span>
                            </div>
                        </Link>

                        <div className="flex items-center gap-4">
                            <button className="p-2 text-alma-blue-900/60 hover:text-alma-blue-900 relative">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-alma-magenta-600 rounded-full"></span>
                            </button>

                            <div className="flex items-center gap-3">
                                <Avatar className="w-9 h-9">
                                    <AvatarImage src={user.photoUrl} />
                                    <AvatarFallback className="bg-alma-lilac-200 text-sm">{initials}</AvatarFallback>
                                </Avatar>
                                <div className="hidden sm:block">
                                    <p className="text-sm font-medium text-alma-blue-900">{user.fullName}</p>
                                    <p className="text-xs text-alma-blue-900/60">CRP {user.crp}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-alma-blue-900">
                            Olá, {user.fullName.split(' ')[0]}! 👋
                        </h1>
                        <p className="text-alma-blue-900/60 mt-1">
                            Painel do Psicólogo - Gerencie sua agenda e pacientes
                        </p>
                    </div>
                    <Badge variant="success" className="w-fit gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Perfil Verificado
                    </Badge>
                </div>

                {/* Stats Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-alma-blue-900/60">Pacientes</p>
                                    <p className="text-3xl font-bold text-alma-blue-900">0</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-alma-blue-100 flex items-center justify-center">
                                    <Users className="w-6 h-6 text-alma-blue-900" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-alma-blue-900/60">Consultas Hoje</p>
                                    <p className="text-3xl font-bold text-alma-blue-900">0</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                                    <Calendar className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-alma-blue-900/60">Este Mês</p>
                                    <p className="text-3xl font-bold text-alma-blue-900">R$ 0</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                                    <DollarSign className="w-6 h-6 text-amber-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-gradient-to-br from-alma-magenta-700 to-alma-magenta-800 text-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-white/70">Impacto Social</p>
                                    <p className="text-3xl font-bold">R$ 0</p>
                                    <p className="text-xs text-white/60 mt-1">doados via Meraki</p>
                                </div>
                                <Heart className="w-8 h-8 text-white/80" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    <Link href="/psychologist/schedule">
                        <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer border-0 bg-gradient-to-br from-alma-blue-900 to-alma-blue-800 text-white">
                            <CardContent className="p-6">
                                <CalendarClock className="w-8 h-8 mb-3" />
                                <h3 className="font-semibold text-lg">Gerenciar Agenda</h3>
                                <p className="text-sm text-white/70 mt-1">Defina seus horários disponíveis</p>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/psychologist/appointments">
                        <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer border-0">
                            <CardContent className="p-6">
                                <Calendar className="w-8 h-8 mb-3 text-alma-magenta-700" />
                                <h3 className="font-semibold text-lg text-alma-blue-900">Consultas</h3>
                                <p className="text-sm text-alma-blue-900/60 mt-1">Veja suas próximas sessões</p>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/psychologist/chat">
                        <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer border-0">
                            <CardContent className="p-6">
                                <MessageCircle className="w-8 h-8 mb-3 text-green-600" />
                                <h3 className="font-semibold text-lg text-alma-blue-900">Mensagens</h3>
                                <p className="text-sm text-alma-blue-900/60 mt-1">Converse com pacientes</p>
                            </CardContent>
                        </Card>
                    </Link>
                </div>

                {/* Content Grid */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Today's Schedule / Configured Slots */}
                    <Card className="lg:col-span-2 border-0 shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg text-alma-blue-900">
                                Meus Horários Configurados
                                {totalSlots > 0 && (
                                    <Badge variant="lilac" className="ml-2">{totalSlots} slots</Badge>
                                )}
                            </CardTitle>
                            <Link href="/psychologist/schedule" className="text-sm text-alma-magenta-700 hover:underline flex items-center gap-1">
                                Gerenciar <ChevronRight className="w-4 h-4" />
                            </Link>
                        </CardHeader>
                        <CardContent>
                            {totalSlots > 0 ? (
                                <div className="space-y-4">
                                    {Object.keys(slotsByDay).sort((a, b) => Number(a) - Number(b)).map(day => {
                                        const dayIndex = Number(day)
                                        const times = slotsByDay[dayIndex]
                                        return (
                                            <div key={day} className="flex items-start gap-4 p-3 bg-alma-lilac-50 rounded-xl">
                                                <div className="w-12 h-12 rounded-xl bg-alma-blue-900 text-white flex flex-col items-center justify-center">
                                                    <span className="text-xs font-medium">{dayNames[dayIndex]}</span>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-alma-blue-900 mb-2">
                                                        {['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][dayIndex]}
                                                    </p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {times.sort().map(time => (
                                                            <Badge key={time} variant="outline" className="text-xs">
                                                                <Clock className="w-3 h-3 mr-1" />
                                                                {time}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-alma-blue-900/60">
                                    <Clock className="w-12 h-12 mx-auto mb-3 text-alma-lilac-300" />
                                    <p>Nenhum horário configurado ainda</p>
                                    <Link href="/psychologist/schedule">
                                        <Button className="mt-4" size="sm">
                                            <CalendarClock className="w-4 h-4 mr-2" />
                                            Configurar Horários
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Profile Completion */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-lg text-alma-blue-900">Seu Perfil</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Avatar className="w-16 h-16">
                                    <AvatarImage src={user.photoUrl} />
                                    <AvatarFallback className="bg-alma-lilac-200 text-xl">{initials}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold text-alma-blue-900">{user.fullName}</p>
                                    <p className="text-sm text-alma-blue-900/60">CRP {user.crp}</p>
                                </div>
                            </div>

                            <div className="bg-alma-lilac-50 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-alma-blue-900/70">Perfil completo</span>
                                    <span className="text-sm font-medium text-alma-blue-900">30%</span>
                                </div>
                                <div className="h-2 bg-alma-lilac-200 rounded-full overflow-hidden">
                                    <div className="h-full w-[30%] bg-alma-magenta-600 rounded-full"></div>
                                </div>
                            </div>

                            <Link href="/psychologist/profile">
                                <Button variant="outline" className="w-full" size="sm">
                                    <Settings className="w-4 h-4 mr-2" />
                                    Completar Perfil
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>

                {/* Footer Actions */}
                <div className="mt-8 flex flex-wrap gap-4">
                    <Link href="/psychologist/financial">
                        <Button variant="outline" size="sm">
                            <CreditCard className="w-4 h-4 mr-2" />
                            Financeiro
                        </Button>
                    </Link>
                    <Link href="/psychologist/settings">
                        <Button variant="outline" size="sm">
                            <Settings className="w-4 h-4 mr-2" />
                            Configurações
                        </Button>
                    </Link>
                    <form action={handleSignOut}>
                        <Button variant="ghost" size="sm" type="submit" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                            <LogOut className="w-4 h-4 mr-2" />
                            Sair
                        </Button>
                    </form>
                </div>
            </main>
        </div>
    )
}
