'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Star, CheckCircle2, Clock, MapPin, Calendar } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Psychologist {
    id: string
    fullName: string
    photoUrl?: string
    crp: string
    bio: string
    specialties: string[]
    sessionPrice: number
    isVerified: boolean
    yearsOfExperience?: number
    rating?: number
    totalReviews?: number
}

interface PsychologistCardProps {
    psychologist: Psychologist
    onSelect?: (id: string) => void
}

export function PsychologistCard({ psychologist, onSelect }: PsychologistCardProps) {
    const {
        id,
        fullName,
        photoUrl,
        crp,
        bio,
        specialties,
        sessionPrice,
        isVerified,
        yearsOfExperience,
        rating = 4.9,
        totalReviews = 0,
    } = psychologist

    const initials = fullName
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()

    return (
        <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
            <CardContent className="p-0">
                {/* Header with gradient */}
                <div className="h-24 bg-gradient-to-r from-alma-blue-900 via-alma-blue-800 to-alma-magenta-800 relative">
                    <div className="absolute -bottom-12 left-6">
                        <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                            <AvatarImage src={photoUrl} alt={fullName} />
                            <AvatarFallback className="text-2xl bg-alma-lilac-200">{initials}</AvatarFallback>
                        </Avatar>
                    </div>
                    {isVerified && (
                        <div className="absolute top-4 right-4">
                            <Badge variant="success" className="gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Verificado
                            </Badge>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="pt-14 px-6 pb-6">
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <h3 className="font-semibold text-lg text-alma-blue-900 group-hover:text-alma-magenta-700 transition-colors">
                                {fullName}
                            </h3>
                            <p className="text-sm text-alma-blue-900/60">CRP {crp}</p>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center gap-1 text-amber-500">
                                <Star className="w-4 h-4 fill-current" />
                                <span className="font-semibold text-alma-blue-900">{rating}</span>
                            </div>
                            <p className="text-xs text-alma-blue-900/50">({totalReviews} avaliações)</p>
                        </div>
                    </div>

                    {/* Specialties */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {specialties.slice(0, 3).map((specialty, index) => (
                            <Badge key={index} variant="lilac" className="text-xs">
                                {specialty}
                            </Badge>
                        ))}
                        {specialties.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                                +{specialties.length - 3}
                            </Badge>
                        )}
                    </div>

                    {/* Bio */}
                    <p className="text-sm text-alma-blue-900/70 line-clamp-2 mb-4">
                        {bio}
                    </p>

                    {/* Meta info */}
                    <div className="flex items-center gap-4 text-sm text-alma-blue-900/60 mb-4">
                        {yearsOfExperience && (
                            <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{yearsOfExperience} anos exp.</span>
                            </div>
                        )}
                    </div>

                    {/* Price and CTA */}
                    <div className="flex items-center justify-between pt-4 border-t border-alma-lilac-100">
                        <div>
                            <p className="text-2xl font-bold text-alma-blue-900">
                                {formatCurrency(sessionPrice)}
                            </p>
                            <p className="text-xs text-alma-blue-900/50">por sessão (50 min)</p>
                        </div>
                        <Link href={`/patient/schedule/${id}`}>
                            <Button onClick={() => onSelect?.(id)}>
                                <Calendar className="w-4 h-4 mr-2" />
                                Agendar
                            </Button>
                        </Link>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

// Grid component for multiple cards
interface PsychologistGridProps {
    psychologists: Psychologist[]
    onSelect?: (id: string) => void
}

export function PsychologistGrid({ psychologists, onSelect }: PsychologistGridProps) {
    if (psychologists.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-alma-lilac-100 flex items-center justify-center">
                    <MapPin className="w-8 h-8 text-alma-blue-900/40" />
                </div>
                <h3 className="text-lg font-semibold text-alma-blue-900 mb-2">
                    Nenhum psicólogo encontrado
                </h3>
                <p className="text-alma-blue-900/60">
                    Tente ajustar os filtros de busca
                </p>
            </div>
        )
    }

    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {psychologists.map(psychologist => (
                <PsychologistCard
                    key={psychologist.id}
                    psychologist={psychologist}
                    onSelect={onSelect}
                />
            ))}
        </div>
    )
}
