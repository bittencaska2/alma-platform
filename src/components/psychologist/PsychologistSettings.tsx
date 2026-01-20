'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Heart,
    ArrowLeft,
    Settings,
    Bell,
    Shield,
    HelpCircle,
    LogOut,
    ChevronRight,
    User,
    CreditCard
} from 'lucide-react'
import { signOut } from '@/lib/actions/auth'

interface PsychologistSettingsProps {
    user: {
        id: string
        email: string
        fullName: string
    }
}

export function PsychologistSettings({ user }: PsychologistSettingsProps) {
    const settingsGroups = [
        {
            title: 'Conta',
            items: [
                { icon: User, label: 'Editar Perfil', href: '/psychologist/profile' },
                { icon: CreditCard, label: 'Dados Bancários', href: '#' },
                { icon: Shield, label: 'Segurança', href: '#' },
            ]
        },
        {
            title: 'Preferências',
            items: [
                { icon: Bell, label: 'Notificações', href: '#' },
            ]
        },
        {
            title: 'Suporte',
            items: [
                { icon: HelpCircle, label: 'Central de Ajuda', href: '#' },
            ]
        },
    ]

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
                            <span className="font-bold text-alma-blue-900">Configurações</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* User Info */}
                <Card className="border-0 shadow-lg mb-6">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-alma-lilac-200 flex items-center justify-center text-xl font-semibold text-alma-blue-900">
                                {user.fullName.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="font-semibold text-alma-blue-900">{user.fullName}</h2>
                                <p className="text-sm text-alma-blue-900/60">{user.email}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Settings Groups */}
                {settingsGroups.map(group => (
                    <Card key={group.title} className="border-0 shadow-lg mb-4">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-alma-blue-900/60">{group.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {group.items.map((item, index) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className={`flex items-center justify-between p-4 hover:bg-alma-lilac-50 transition-colors ${index !== group.items.length - 1 ? 'border-b border-alma-lilac-100' : ''
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon className="w-5 h-5 text-alma-blue-900/60" />
                                        <span className="text-alma-blue-900">{item.label}</span>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-alma-blue-900/30" />
                                </Link>
                            ))}
                        </CardContent>
                    </Card>
                ))}

                {/* Logout */}
                <Card className="border-0 shadow-lg border-red-100">
                    <CardContent className="p-4">
                        <form action={signOut}>
                            <Button
                                variant="ghost"
                                type="submit"
                                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                                <LogOut className="w-5 h-5 mr-3" />
                                Sair da conta
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Version */}
                <p className="text-center text-xs text-alma-blue-900/40 mt-8">
                    Alma v1.0.0 • Powered by Meraki Psicologia
                </p>
            </main>
        </div>
    )
}
