'use client'

import Link from 'next/link'
import { useState, Suspense, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Heart, ArrowLeft, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react'
import { signUp } from '@/lib/actions/auth'

function RegisterForm() {
    const searchParams = useSearchParams()
    const initialType = searchParams.get('type') as 'patient' | 'psychologist' || 'patient'

    const [showPassword, setShowPassword] = useState(false)
    const [userType, setUserType] = useState<'patient' | 'psychologist'>(initialType)
    const [ageConfirmed, setAgeConfirmed] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)

        const formData = new FormData(e.currentTarget)
        formData.append('userType', userType)

        startTransition(async () => {
            const result = await signUp(formData)
            if (result?.error) {
                setError(result.error)
            }
        })
    }

    return (
        <div className="min-h-screen gradient-soft flex items-center justify-center p-4 py-12">
            <div className="w-full max-w-md">
                <Link href="/" className="inline-flex items-center gap-2 text-sm text-alma-blue-900/70 hover:text-alma-blue-900 mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Voltar ao início
                </Link>

                <Card className="border-0 shadow-xl">
                    <CardHeader className="text-center pb-2">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-alma-blue-900 to-alma-magenta-800 flex items-center justify-center">
                                <Heart className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl">Crie sua conta</CardTitle>
                        <CardDescription>
                            {userType === 'patient'
                                ? 'Comece sua jornada de autoconhecimento'
                                : 'Cadastre-se e comece a atender pacientes'}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-6">
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="flex gap-2 p-1 bg-alma-lilac-100 rounded-xl mb-6">
                            <button
                                type="button"
                                onClick={() => setUserType('patient')}
                                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${userType === 'patient'
                                    ? 'bg-white text-alma-blue-900 shadow-sm'
                                    : 'text-alma-blue-900/60 hover:text-alma-blue-900'
                                    }`}
                            >
                                Sou Paciente
                            </button>
                            <button
                                type="button"
                                onClick={() => setUserType('psychologist')}
                                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${userType === 'psychologist'
                                    ? 'bg-white text-alma-blue-900 shadow-sm'
                                    : 'text-alma-blue-900/60 hover:text-alma-blue-900'
                                    }`}
                            >
                                Sou Psicólogo
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome completo</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    placeholder="Seu nome completo"
                                    required
                                    disabled={isPending}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">E-mail</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="seu@email.com"
                                    required
                                    disabled={isPending}
                                />
                            </div>

                            {userType === 'psychologist' && (
                                <div className="space-y-2">
                                    <Label htmlFor="crp">
                                        CRP <span className="text-alma-magenta-700">*</span>
                                    </Label>
                                    <Input
                                        id="crp"
                                        name="crp"
                                        type="text"
                                        placeholder="00/00000"
                                        required
                                        disabled={isPending}
                                    />
                                    <p className="text-xs text-alma-blue-900/50">
                                        Registro obrigatório para exercício da profissão
                                    </p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="password">Senha</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        required
                                        minLength={6}
                                        disabled={isPending}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-alma-blue-900/40 hover:text-alma-blue-900 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                <p className="text-xs text-alma-blue-900/50">Mínimo de 6 caracteres</p>
                            </div>

                            <div className="bg-alma-lilac-50 rounded-xl p-4 space-y-2">
                                <p className="text-sm font-medium text-alma-blue-900">
                                    {userType === 'patient' ? 'Ao se cadastrar você terá:' : 'Benefícios para psicólogos:'}
                                </p>
                                {userType === 'patient' ? (
                                    <>
                                        <div className="flex items-center gap-2 text-sm text-alma-blue-900/70">
                                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                                            <span>Acesso a psicólogos verificados</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-alma-blue-900/70">
                                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                                            <span>Agendamento flexível</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-alma-blue-900/70">
                                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                                            <span>Chat seguro e privado</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2 text-sm text-alma-blue-900/70">
                                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                                            <span>Suporte integrado</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-alma-blue-900/70">
                                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                                            <span>Gerencie sua agenda livremente</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-alma-blue-900/70">
                                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                                            <span>Contribua para o impacto social</span>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="flex items-start gap-2">
                                <input
                                    type="checkbox"
                                    id="ageTerms"
                                    checked={ageConfirmed}
                                    onChange={(e) => setAgeConfirmed(e.target.checked)}
                                    className="mt-1 rounded border-alma-lilac-300 text-alma-blue-900 focus:ring-alma-blue-500"
                                    disabled={isPending}
                                    required
                                />
                                <label htmlFor="ageTerms" className="text-sm text-alma-blue-900/70">
                                    Declaro que sou maior de 18 anos e concordo com os{' '}
                                    <Link href="/terms" className="text-alma-magenta-700 hover:underline">
                                        Termos de Uso
                                    </Link>{' '}
                                    e a{' '}
                                    <Link href="/privacy" className="text-alma-magenta-700 hover:underline">
                                        Política de Privacidade
                                    </Link>.
                                </label>
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                size="lg"
                                disabled={isPending || !ageConfirmed}
                            >
                                {isPending ? 'Criando conta...' : 'Criar minha conta'}
                            </Button>
                        </form>

                        <p className="text-center text-sm text-alma-blue-900/60 mt-6">
                            Já tem uma conta?{' '}
                            <Link href="/login" className="text-alma-magenta-700 font-medium hover:underline">
                                Entrar
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default function RegisterPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen gradient-soft flex items-center justify-center">
                <div className="animate-pulse">Carregando...</div>
            </div>
        }>
            <RegisterForm />
        </Suspense>
    )
}
