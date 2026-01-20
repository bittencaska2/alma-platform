'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    Heart,
    ArrowLeft,
    User,
    Phone,
    Camera,
    Save,
    Award,
    Plus,
    X,
    FileText,
    CheckCircle2
} from 'lucide-react'
import { updatePsychologistProfile } from '@/lib/actions/profile'

interface PsychologistProfileProps {
    user: {
        id: string
        email: string
        fullName: string
        phone: string
        photoUrl: string
        crp: string
        bio: string
        specialties: string[]
        sessionPrice: number
        yearsOfExperience: number | null
    }
}

const availableSpecialties = [
    'Ansiedade', 'Depressão', 'Terapia de Casal', 'TCC',
    'Psicanálise', 'Traumas', 'Autoestima', 'Relacionamentos',
    'TDAH', 'Burnout', 'Luto', 'Fobias', 'TOC'
]

export function PsychologistProfile({ user }: PsychologistProfileProps) {
    const [formData, setFormData] = useState({
        fullName: user.fullName,
        phone: user.phone,
        bio: user.bio,
        specialties: user.specialties,
        yearsOfExperience: user.yearsOfExperience || '',
    })
    const [isSaving, setIsSaving] = useState(false)
    const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const initials = user.fullName
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()

    const toggleSpecialty = (specialty: string) => {
        if (formData.specialties.includes(specialty)) {
            setFormData({
                ...formData,
                specialties: formData.specialties.filter(s => s !== specialty)
            })
        } else {
            setFormData({
                ...formData,
                specialties: [...formData.specialties, specialty]
            })
        }
    }

    const handleSave = async () => {
        setIsSaving(true)
        setSaveMessage(null)

        const formDataObj = new FormData()
        formDataObj.append('fullName', formData.fullName)
        formDataObj.append('phone', formData.phone)
        formDataObj.append('bio', formData.bio)
        formDataObj.append('specialties', JSON.stringify(formData.specialties))
        formDataObj.append('yearsOfExperience', formData.yearsOfExperience.toString())

        const result = await updatePsychologistProfile(formDataObj)

        if (result.error) {
            setSaveMessage({ type: 'error', text: result.error })
        } else {
            setSaveMessage({ type: 'success', text: 'Perfil salvo com sucesso!' })
        }

        setIsSaving(false)
    }

    // Calculate profile completion
    const completionItems = [
        { done: !!formData.fullName, label: 'Nome' },
        { done: !!formData.phone, label: 'Telefone' },
        { done: !!formData.bio, label: 'Bio' },
        { done: formData.specialties.length > 0, label: 'Especialidades' },
        { done: !!user.photoUrl, label: 'Foto' },
    ]
    const completionPercent = Math.round((completionItems.filter(i => i.done).length / completionItems.length) * 100)

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
                                <span className="font-bold text-alma-blue-900">Meu Perfil</span>
                            </div>
                        </div>
                        <Button onClick={handleSave} disabled={isSaving}>
                            <Save className="w-4 h-4 mr-2" />
                            {isSaving ? 'Salvando...' : 'Salvar'}
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Profile Completion */}
                <Card className="border-0 shadow-lg mb-6 bg-gradient-to-r from-alma-blue-900 to-alma-blue-800 text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold">Perfil {completionPercent}% completo</h3>
                            <Badge className="bg-white/20 text-white">{completionPercent}%</Badge>
                        </div>
                        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white rounded-full transition-all"
                                style={{ width: `${completionPercent}%` }}
                            />
                        </div>
                        <div className="flex flex-wrap gap-2 mt-4">
                            {completionItems.map(item => (
                                <Badge
                                    key={item.label}
                                    className={item.done ? 'bg-green-500/20 text-green-200' : 'bg-white/10 text-white/60'}
                                >
                                    {item.done ? '✓' : '○'} {item.label}
                                </Badge>
                            ))}
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

                {/* Profile Photo & CRP */}
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
                                <Badge variant="magenta" className="mt-1">
                                    <Award className="w-3 h-3 mr-1" />
                                    CRP {user.crp}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Basic Info */}
                <Card className="border-0 shadow-lg mb-6">
                    <CardHeader>
                        <CardTitle className="text-lg text-alma-blue-900 flex items-center gap-2">
                            <User className="w-5 h-5 text-alma-magenta-700" />
                            Informações Básicas
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Nome completo</Label>
                            <Input
                                id="fullName"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            />
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
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
                                <Label htmlFor="experience">Anos de Experiência</Label>
                                <Input
                                    id="experience"
                                    type="number"
                                    value={formData.yearsOfExperience}
                                    onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                                    placeholder="5"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Bio */}
                <Card className="border-0 shadow-lg mb-6">
                    <CardHeader>
                        <CardTitle className="text-lg text-alma-blue-900 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-alma-magenta-700" />
                            Sobre Você
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <textarea
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            placeholder="Conte um pouco sobre sua experiência, abordagem terapêutica e como você pode ajudar seus pacientes..."
                            className="w-full h-32 p-3 rounded-xl border border-alma-lilac-200 focus:border-alma-blue-500 focus:ring-1 focus:ring-alma-blue-500 resize-none"
                        />
                        <p className="text-xs text-alma-blue-900/50 mt-2">
                            Esta descrição será exibida no seu perfil público
                        </p>
                    </CardContent>
                </Card>

                {/* Specialties */}
                <Card className="border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-lg text-alma-blue-900 flex items-center gap-2">
                            <Award className="w-5 h-5 text-alma-magenta-700" />
                            Especialidades
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-alma-blue-900/60 mb-4">
                            Selecione suas áreas de atuação (máximo 5)
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {availableSpecialties.map(specialty => {
                                const isSelected = formData.specialties.includes(specialty)
                                const isDisabled = !isSelected && formData.specialties.length >= 5

                                return (
                                    <button
                                        key={specialty}
                                        onClick={() => !isDisabled && toggleSpecialty(specialty)}
                                        disabled={isDisabled}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${isSelected
                                            ? 'bg-alma-magenta-700 text-white'
                                            : isDisabled
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-alma-lilac-100 text-alma-blue-900 hover:bg-alma-lilac-200'
                                            }`}
                                    >
                                        {isSelected ? <X className="w-3 h-3 inline mr-1" /> : <Plus className="w-3 h-3 inline mr-1" />}
                                        {specialty}
                                    </button>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
