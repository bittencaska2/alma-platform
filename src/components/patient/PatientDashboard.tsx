'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
    Heart,
    Search,
    Calendar,
    MessageCircle,
    CreditCard,
    Settings,
    LogOut,
    Bell,
    ChevronRight,
    Clock,
    Star
} from 'lucide-react'
import { signOut } from '@/lib/actions/auth'

interface PatientDashboardProps {
    user: {
        id: string
        email: string
        fullName: string
        photoUrl?: string
    }
}

export function PatientDashboard({ user }: PatientDashboardProps) {
    const initials = user.fullName
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()

    const handleSignOut = async () => {
        await signOut()
    }

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
                                    <p className="text-xs text-alma-blue-900/60">Paciente</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-alma-blue-900">
                        Olá, {user.fullName.split(' ')[0]}! 👋
                    </h1>
                    <p className="text-alma-blue-900/60 mt-1">
                        Bem-vindo à sua área de cuidado com a saúde mental
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <Link href="/patient/search">
                        <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer border-0 bg-gradient-to-br from-alma-blue-900 to-alma-blue-800 text-white">
                            <CardContent className="p-6">
                                <Search className="w-8 h-8 mb-3" />
                                <h3 className="font-semibold text-lg">Buscar Psicólogo</h3>
                                <p className="text-sm text-white/70 mt-1">Encontre o profissional ideal</p>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/patient/appointments">
                        <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer border-0">
                            <CardContent className="p-6">
                                <Calendar className="w-8 h-8 mb-3 text-alma-magenta-700" />
                                <h3 className="font-semibold text-lg text-alma-blue-900">Minhas Consultas</h3>
                                <p className="text-sm text-alma-blue-900/60 mt-1">Agende e gerencie</p>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/patient/chat">
                        <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer border-0">
                            <CardContent className="p-6">
                                <MessageCircle className="w-8 h-8 mb-3 text-green-600" />
                                <h3 className="font-semibold text-lg text-alma-blue-900">Chat</h3>
                                <p className="text-sm text-alma-blue-900/60 mt-1">Converse com seu psicólogo</p>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/patient/financial">
                        <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer border-0">
                            <CardContent className="p-6">
                                <CreditCard className="w-8 h-8 mb-3 text-amber-600" />
                                <h3 className="font-semibold text-lg text-alma-blue-900">Financeiro</h3>
                                <p className="text-sm text-alma-blue-900/60 mt-1">Pagamentos e faturas</p>
                            </CardContent>
                        </Card>
                    </Link>
                </div>

                {/* Content Grid */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Upcoming Appointments */}
                    <Card className="lg:col-span-2 border-0 shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg text-alma-blue-900">Próximas Consultas</CardTitle>
                            <Link href="/patient/appointments" className="text-sm text-alma-magenta-700 hover:underline flex items-center gap-1">
                                Ver todas <ChevronRight className="w-4 h-4" />
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8 text-alma-blue-900/60">
                                <Calendar className="w-12 h-12 mx-auto mb-3 text-alma-lilac-300" />
                                <p>Você ainda não tem consultas agendadas</p>
                                <Link href="/patient/search">
                                    <Button className="mt-4" size="sm">
                                        <Search className="w-4 h-4 mr-2" />
                                        Buscar Psicólogo
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <div className="space-y-4">
                        <Card className="border-0 shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-alma-lilac-100 flex items-center justify-center">
                                        <Clock className="w-6 h-6 text-alma-blue-900" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-alma-blue-900">0</p>
                                        <p className="text-sm text-alma-blue-900/60">Sessões realizadas</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-lg bg-gradient-to-br from-alma-magenta-700 to-alma-magenta-800 text-white">
                            <CardContent className="p-6">
                                <Heart className="w-8 h-8 mb-3" />
                                <h3 className="font-semibold">Meraki Social</h3>
                                <p className="text-sm text-white/80 mt-1">
                                    Suas consultas já ajudaram a doar <strong>R$ 0,00</strong> para crianças em vulnerabilidade.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-8 flex flex-wrap gap-4">
                    <Link href="/patient/settings">
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
