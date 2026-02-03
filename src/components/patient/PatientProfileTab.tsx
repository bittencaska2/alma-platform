'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { PhoneMask } from '@/components/ui/PhoneMask'
import { Loader2, Save, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface PatientProfileTabProps {
    user: {
        id: string
        email: string
        fullName: string
        photoUrl?: string | null
        age?: number | null
        whatsapp?: string | null
    }
    onProfileUpdate?: (updates: Partial<PatientProfileTabProps['user']>) => void
}

export function PatientProfileTab({ user, onProfileUpdate }: PatientProfileTabProps) {
    const [formData, setFormData] = useState({
        fullName: user.fullName || '',
        age: user.age?.toString() || '',
        whatsapp: user.whatsapp || '',
        photoUrl: user.photoUrl || ''
    })
    const [isSaving, setIsSaving] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const initials = formData.fullName
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()

    const handleSave = async () => {
        setIsSaving(true)
        setError(null)
        setSaveSuccess(false)

        try {
            const supabase = createClient()

            // Validate required fields
            if (!formData.fullName.trim()) {
                throw new Error('Nome é obrigatório')
            }
            if (!formData.age || parseInt(formData.age) < 18) {
                throw new Error('Idade deve ser 18 anos ou mais')
            }
            // Validate WhatsApp (check digits only, should have at least 13 digits: 55 + DDD + number)
            const whatsappDigits = formData.whatsapp.replace(/\D/g, '')
            if (!whatsappDigits || whatsappDigits.length < 13) {
                throw new Error('WhatsApp completo é obrigatório (13 dígitos)')
            }

            // Upsert profiles table (create if not exists)
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    user_type: 'patient',
                    full_name: formData.fullName.trim(),
                    email: user.email,
                    whatsapp: formData.whatsapp,
                    photo_url: formData.photoUrl || null
                }, { onConflict: 'id' })

            if (profileError) throw profileError

            // Upsert patients table (create if not exists)
            const { error: patientError } = await supabase
                .from('patients')
                .upsert({
                    id: user.id,
                    age: parseInt(formData.age)
                }, { onConflict: 'id' })

            if (patientError) throw patientError

            // Update user metadata for immediate UI update
            await supabase.auth.updateUser({
                data: {
                    full_name: formData.fullName.trim(),
                    photo_url: formData.photoUrl || null
                }
            })

            setSaveSuccess(true)
            onProfileUpdate?.({
                fullName: formData.fullName.trim(),
                photoUrl: formData.photoUrl,
                age: parseInt(formData.age),
                whatsapp: formData.whatsapp
            })

            // Clear success after 3 seconds
            setTimeout(() => setSaveSuccess(false), 3000)

        } catch (err: any) {
            console.error('Save error:', err)
            setError(err.message || 'Erro ao salvar. Tente novamente.')
        } finally {
            setIsSaving(false)
        }
    }

    const handlePhotoUpload = (url: string) => {
        setFormData(prev => ({ ...prev, photoUrl: url }))
    }

    return (
        <Card className="border-0 shadow-lg">
            <CardHeader>
                <CardTitle className="text-lg text-alma-blue-900">Meu Perfil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Photo Upload */}
                <div className="flex justify-center pb-4 border-b border-alma-lilac-100">
                    <ImageUpload
                        currentImageUrl={formData.photoUrl}
                        userId={user.id}
                        initials={initials}
                        onUploadComplete={handlePhotoUpload}
                        onUploadError={(err) => setError(err)}
                    />
                </div>

                {/* Form Fields */}
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="fullName">
                            Nome Completo <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="fullName"
                            value={formData.fullName}
                            onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                            placeholder="Seu nome completo"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="age">
                            Idade <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="age"
                            type="number"
                            min={18}
                            max={120}
                            value={formData.age}
                            onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                            placeholder="18"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input
                            id="email"
                            type="email"
                            value={user.email}
                            disabled
                            className="bg-gray-50 text-gray-500"
                        />
                        <p className="text-xs text-alma-blue-900/50">
                            O e-mail não pode ser alterado
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="whatsapp">
                            WhatsApp <span className="text-red-500">*</span>
                        </Label>
                        <PhoneMask
                            id="whatsapp"
                            value={formData.whatsapp}
                            onChange={(value) => setFormData(prev => ({ ...prev, whatsapp: value }))}
                        />
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                    </div>
                )}

                {/* Success Message */}
                {saveSuccess && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Perfil salvo com sucesso!
                    </div>
                )}

                {/* Save Button */}
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full sm:w-auto"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Salvando...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4 mr-2" />
                            Salvar Alterações
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    )
}
