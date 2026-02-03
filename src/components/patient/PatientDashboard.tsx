'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Heart,
    User,
    Stethoscope,
    TrendingUp,
    LogOut,
    Bell
} from 'lucide-react'
import { signOut } from '@/lib/actions/auth'
import { PatientProfileTab } from './PatientProfileTab'
import { PatientTherapyTab } from './PatientTherapyTab'
import { PatientImpactTab } from './PatientImpactTab'

interface PatientDashboardProps {
    user: {
        id: string
        email: string
        fullName: string
        photoUrl?: string | null
        age?: number | null
        whatsapp?: string | null
    }
    activePackage?: {
        psychologist: {
            id: string
            fullName: string
            crp: string
            photoUrl?: string | null
        }
        sessionsRemaining: number
        totalSessions: number
        nextAppointment?: any
    } | null
    appointmentHistory?: any[]
    transactions?: any[]
}

export function PatientDashboard({
    user,
    activePackage = null,
    appointmentHistory = [],
    transactions = []
}: PatientDashboardProps) {
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
                                    <p className="text-xs text-alma-blue-900/60">Paciente</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-alma-blue-900">
                        Olá, {currentUser.fullName.split(' ')[0]}! 👋
                    </h1>
                    <p className="text-alma-blue-900/60 mt-1">
                        Bem-vindo à sua área de cuidado com a saúde mental
                    </p>
                </div>

                {/* Tabbed Interface */}
                <Tabs defaultValue="therapy" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-white shadow-md rounded-xl">
                        <TabsTrigger
                            value="profile"
                            className="flex items-center gap-2 py-3 data-[state=active]:bg-alma-blue-900 data-[state=active]:text-white rounded-lg"
                        >
                            <User className="w-4 h-4" />
                            <span className="hidden sm:inline">Meu Perfil</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="therapy"
                            className="flex items-center gap-2 py-3 data-[state=active]:bg-alma-blue-900 data-[state=active]:text-white rounded-lg"
                        >
                            <Stethoscope className="w-4 h-4" />
                            <span className="hidden sm:inline">Minha Terapia</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="impact"
                            className="flex items-center gap-2 py-3 data-[state=active]:bg-alma-blue-900 data-[state=active]:text-white rounded-lg"
                        >
                            <TrendingUp className="w-4 h-4" />
                            <span className="hidden sm:inline">Financeiro</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile">
                        <PatientProfileTab
                            user={currentUser}
                            onProfileUpdate={handleProfileUpdate}
                        />
                    </TabsContent>

                    <TabsContent value="therapy">
                        <PatientTherapyTab
                            activePackage={activePackage}
                            appointmentHistory={appointmentHistory}
                        />
                    </TabsContent>

                    <TabsContent value="impact">
                        <PatientImpactTab transactions={transactions} />
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
