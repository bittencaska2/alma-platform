'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    Heart,
    Search,
    ArrowLeft,
    Star,
    CheckCircle2,
    Calendar,
    Filter,
    MapPin
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Psychologist {
    id: string
    crp: string
    bio: string | null
    specialties: string[] | null
    session_price: number
    is_verified: boolean
    years_of_experience: number | null
    profiles: {
        full_name: string
        photo_url: string | null
    }
}

interface SearchPsychologistsProps {
    psychologists: Psychologist[]
}

export function SearchPsychologists({ psychologists }: SearchPsychologistsProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null)

    const specialties = [
        'Ansiedade', 'Depressão', 'Terapia de Casal', 'TCC',
        'Psicanálise', 'Traumas', 'Autoestima', 'Relacionamentos'
    ]

    const filteredPsychologists = psychologists.filter(psy => {
        const matchesSearch = psy.profiles.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            psy.specialties?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
        const matchesSpecialty = !selectedSpecialty || psy.specialties?.includes(selectedSpecialty)
        return matchesSearch && matchesSpecialty
    })

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
                            <span className="font-bold text-alma-blue-900">Buscar Psicólogo</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search Bar */}
                <div className="mb-8">
                    <div className="relative max-w-2xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-alma-blue-900/40" />
                        <Input
                            type="text"
                            placeholder="Buscar por nome ou especialidade..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 h-14 text-lg rounded-2xl"
                        />
                    </div>
                </div>

                {/* Specialty Filters */}
                <div className="mb-8">
                    <h3 className="text-sm font-medium text-alma-blue-900/60 mb-3">Especialidades</h3>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedSpecialty(null)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${!selectedSpecialty
                                    ? 'bg-alma-blue-900 text-white'
                                    : 'bg-white text-alma-blue-900 border border-alma-lilac-200 hover:border-alma-blue-500'
                                }`}
                        >
                            Todas
                        </button>
                        {specialties.map(specialty => (
                            <button
                                key={specialty}
                                onClick={() => setSelectedSpecialty(specialty)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedSpecialty === specialty
                                        ? 'bg-alma-blue-900 text-white'
                                        : 'bg-white text-alma-blue-900 border border-alma-lilac-200 hover:border-alma-blue-500'
                                    }`}
                            >
                                {specialty}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results */}
                <div className="mb-4">
                    <p className="text-sm text-alma-blue-900/60">
                        {filteredPsychologists.length} psicólogo(s) encontrado(s)
                    </p>
                </div>

                {/* Psychologist Grid */}
                {filteredPsychologists.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPsychologists.map(psy => {
                            const initials = psy.profiles.full_name
                                .split(' ')
                                .map(n => n[0])
                                .slice(0, 2)
                                .join('')
                                .toUpperCase()

                            return (
                                <Card key={psy.id} className="overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 border-0">
                                    <div className="h-20 bg-gradient-to-r from-alma-blue-900 to-alma-magenta-800 relative">
                                        <div className="absolute -bottom-10 left-6">
                                            <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
                                                <AvatarImage src={psy.profiles.photo_url || undefined} />
                                                <AvatarFallback className="text-xl bg-alma-lilac-200">{initials}</AvatarFallback>
                                            </Avatar>
                                        </div>
                                        {psy.is_verified && (
                                            <Badge variant="success" className="absolute top-3 right-3 gap-1">
                                                <CheckCircle2 className="w-3 h-3" />
                                                Verificado
                                            </Badge>
                                        )}
                                    </div>

                                    <CardContent className="pt-12 pb-6">
                                        <div className="mb-3">
                                            <h3 className="font-semibold text-lg text-alma-blue-900">{psy.profiles.full_name}</h3>
                                            <p className="text-sm text-alma-blue-900/60">CRP {psy.crp}</p>
                                        </div>

                                        {psy.specialties && psy.specialties.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mb-3">
                                                {psy.specialties.slice(0, 3).map((spec, i) => (
                                                    <Badge key={i} variant="lilac" className="text-xs">{spec}</Badge>
                                                ))}
                                            </div>
                                        )}

                                        {psy.bio && (
                                            <p className="text-sm text-alma-blue-900/70 line-clamp-2 mb-4">{psy.bio}</p>
                                        )}

                                        <div className="flex items-center justify-between pt-4 border-t border-alma-lilac-100">
                                            <div>
                                                <p className="text-xl font-bold text-alma-blue-900">
                                                    {formatCurrency(psy.session_price || 160)}
                                                </p>
                                                <p className="text-xs text-alma-blue-900/50">por sessão</p>
                                            </div>
                                            <Link href={`/patient/schedule/${psy.id}`}>
                                                <Button size="sm">
                                                    <Calendar className="w-4 h-4 mr-1" />
                                                    Agendar
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-alma-lilac-100 flex items-center justify-center">
                            <Search className="w-10 h-10 text-alma-blue-900/30" />
                        </div>
                        <h3 className="text-xl font-semibold text-alma-blue-900 mb-2">
                            Nenhum psicólogo encontrado
                        </h3>
                        <p className="text-alma-blue-900/60 mb-6">
                            {psychologists.length === 0
                                ? 'Ainda não há psicólogos cadastrados na plataforma.'
                                : 'Tente ajustar os filtros de busca.'}
                        </p>
                        {selectedSpecialty && (
                            <Button variant="outline" onClick={() => setSelectedSpecialty(null)}>
                                Limpar filtros
                            </Button>
                        )}
                    </div>
                )}
            </main>
        </div>
    )
}
