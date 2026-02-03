'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Heart,
    User,
    Users,
    DollarSign,
    LogOut,
    Bell,
    CheckCircle2
} from 'lucide-react'
import { signOut } from '@/lib/actions/auth'
import { PsychologistProfileTab } from './PsychologistProfileTab'
import { PsychologistPatientsTab } from './PsychologistPatientsTab'
import { PsychologistFinancial } from './PsychologistFinancial'

interface Patient {
    id: string
    fullName: string
    photoUrl?: string | null
    lastAppointment?: string | null
    nextAppointment?: string | null
    status: 'active' | 'pending' | 'inactive'
    totalSessions: number
}

interface Transaction {
    id: string
    gross_amount: number
    psychologist_amount: number
    platform_amount: number
    social_donation: number
    payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
    created_at: string
    patients?: {
        profiles: {
            full_name: string
        }
    }
}

interface PsychologistDashboardProps {
    user: {
        id: string
        email: string
        fullName: string
        photoUrl?: string | null
        crp: string
        bio?: string | null
        education?: string | null
        educationYear?: number | null
        whatsapp?: string | null
    }
    patients?: Patient[]
    transactions?: Transaction[]
}

export function PsychologistDashboard({
    user,
    patients = [],
    transactions = []
}: PsychologistDashboardProps) {
    const [currentUser, setCurrentUser] = useState(user)

    const initials = currentUser.fullName
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()

    const handleSignOut = async () => {
        await signOut()
    }

    const handleProfileUpdate = (updates: Partial<typeof user>) => {
        setCurrentUser(prev => ({ ...prev, ...updates }))
    }

    // Calculate stats
    const activePatients = patients.filter(p => p.status === 'active').length
    const totalEarnings = transactions
        .filter(t => t.payment_status === 'paid')
        .reduce((sum, t) => sum + t.psychologist_amount, 0)

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
                                    <AvatarImage src={currentUser.photoUrl || undefined} />
                                    <AvatarFallback className="bg-alma-lilac-200 text-sm">{initials}</AvatarFallback>
                                </Avatar>
                                <div className="hidden sm:block">
                                    <p className="text-sm font-medium text-alma-blue-900">{currentUser.fullName}</p>
                                    <p className="text-xs text-alma-blue-900/60">CRP {currentUser.crp}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-alma-blue-900">
                            Olá, {currentUser.fullName.split(' ')[0]}! 👋
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

                {/* Quick Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl p-4 shadow-md">
                        <p className="text-sm text-alma-blue-900/60">Pacientes Ativos</p>
                        <p className="text-2xl font-bold text-alma-blue-900">{activePatients}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-md">
                        <p className="text-sm text-alma-blue-900/60">Total Pacientes</p>
                        <p className="text-2xl font-bold text-alma-blue-900">{patients.length}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-md">
                        <p className="text-sm text-alma-blue-900/60">Total Recebido</p>
                        <p className="text-2xl font-bold text-green-600">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalEarnings)}
                        </p>
                    </div>
                    <div className="bg-gradient-to-br from-alma-magenta-700 to-alma-magenta-800 rounded-xl p-4 shadow-md text-white">
                        <p className="text-sm text-white/70">Impacto Social</p>
                        <p className="text-2xl font-bold">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                transactions.filter(t => t.payment_status === 'paid').reduce((sum, t) => sum + t.social_donation, 0)
                            )}
                        </p>
                    </div>
                </div>

                {/* Tabbed Interface */}
                <Tabs defaultValue="patients" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-white shadow-md rounded-xl">
                        <TabsTrigger
                            value="profile"
                            className="flex items-center gap-2 py-3 data-[state=active]:bg-alma-blue-900 data-[state=active]:text-white rounded-lg"
                        >
                            <User className="w-4 h-4" />
                            <span className="hidden sm:inline">Perfil</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="patients"
                            className="flex items-center gap-2 py-3 data-[state=active]:bg-alma-blue-900 data-[state=active]:text-white rounded-lg"
                        >
                            <Users className="w-4 h-4" />
                            <span className="hidden sm:inline">Meus Pacientes</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="financial"
                            className="flex items-center gap-2 py-3 data-[state=active]:bg-alma-blue-900 data-[state=active]:text-white rounded-lg"
                        >
                            <DollarSign className="w-4 h-4" />
                            <span className="hidden sm:inline">Financeiro</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile">
                        <PsychologistProfileTab
                            user={currentUser}
                            onProfileUpdate={handleProfileUpdate}
                        />
                    </TabsContent>

                    <TabsContent value="patients">
                        <PsychologistPatientsTab patients={patients} />
                    </TabsContent>

                    <TabsContent value="financial">
                        <PsychologistFinancial transactions={transactions} />
                    </TabsContent>
                </Tabs>

                {/* Footer Actions */}
                <div className="mt-8 pt-6 border-t border-alma-lilac-200">
                    <form action={handleSignOut}>
                        <Button
                            variant="ghost"
                            size="sm"
                            type="submit"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Sair da conta
                        </Button>
                    </form>
                </div>
            </main>
        </div>
    )
}
