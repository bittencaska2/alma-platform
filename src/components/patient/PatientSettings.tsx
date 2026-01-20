'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    Heart,
    ArrowLeft,
    User,
    Mail,
    Phone,
    MapPin,
    Camera,
    Save,
    CheckCircle2
} from 'lucide-react'
import { signOut } from '@/lib/actions/auth'
import { updatePatientProfile } from '@/lib/actions/profile'

interface PatientSettingsProps {
    user: {
        id: string
        email: string
        fullName: string
        phone: string
        photoUrl: string
        address: string
    }
}

export function PatientSettings({ user }: PatientSettingsProps) {
    const [formData, setFormData] = useState({
        fullName: user.fullName,
        phone: user.phone,
        address: user.address,
    })
    const [isSaving, setIsSaving] = useState(false)
    const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const initials = user.fullName
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()

    const handleSave = async () => {
        setIsSaving(true)
        setSaveMessage(null)

        const formDataObj = new FormData()
        formDataObj.append('fullName', formData.fullName)
        formDataObj.append('phone', formData.phone)
        formDataObj.append('address', formData.address)

        const result = await updatePatientProfile(formDataObj)

        if (result.error) {
            setSaveMessage({ type: 'error', text: result.error })
        } else {
            setSaveMessage({ type: 'success', text: 'Configurações salvas com sucesso!' })
        }

        setIsSaving(false)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-alma-lilac-50 via-white to-alma-lilac-100">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-alma-lilac-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center h-16 gap-4">
                        <Link href="/patient/dashboard" className="p-2 hover:bg-alma-lilac-100 rounded-lg transition-colors">
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
                {/* Profile Photo */}
                <Card className="border-0 shadow-lg mb-6">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <Avatar className="w-24 h-24">
                                    <AvatarImage src={user.photoUrl} />
                                    <AvatarFallback className="bg-alma-lilac-200 text-2xl">{initials}</AvatarFallback>
                                </Avatar>
                                <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-alma-blue-900 text-white flex items-center justify-center shadow-lg hover:bg-alma-blue-800 transition-colors">
                                    <Camera className="w-4 h-4" />
                                </button>
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-alma-blue-900">{user.fullName}</h2>
                                <p className="text-alma-blue-900/60">{user.email}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Profile Form */}
                <Card className="border-0 shadow-lg mb-6">
                    <CardHeader>
                        <CardTitle className="text-lg text-alma-blue-900 flex items-center gap-2">
                            <User className="w-5 h-5 text-alma-magenta-700" />
                            Informações Pessoais
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Nome completo</Label>
                            <Input
                                id="fullName"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                placeholder="Seu nome completo"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">E-mail</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-alma-blue-900/40" />
                                <Input
                                    id="email"
                                    value={user.email}
                                    disabled
                                    className="pl-10 bg-gray-50"
                                />
                            </div>
                            <p className="text-xs text-alma-blue-900/50">O e-mail não pode ser alterado</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Telefone</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-alma-blue-900/40" />
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="(00) 00000-0000"
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Endereço</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-alma-blue-900/40" />
                                <Input
                                    id="address"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Seu endereço"
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <Button onClick={handleSave} disabled={isSaving} className="w-full">
                            <Save className="w-4 h-4 mr-2" />
                            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>

                        {saveMessage && (
                            <div className={`flex items-center gap-2 p-3 rounded-lg ${saveMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                }`}>
                                <CheckCircle2 className="w-4 h-4" />
                                <span className="text-sm">{saveMessage.text}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="border-0 shadow-lg border-red-100">
                    <CardHeader>
                        <CardTitle className="text-lg text-red-600">Zona de Perigo</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form action={signOut}>
                            <Button variant="outline" type="submit" className="w-full border-red-200 text-red-600 hover:bg-red-50">
                                Sair da conta
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
