'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Heart, ArrowLeft, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { signIn } from '@/lib/actions/auth'

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [userType, setUserType] = useState<'patient' | 'psychologist'>('patient')
    const [error, setError] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)

        const formData = new FormData(e.currentTarget)
        formData.append('userType', userType)

        startTransition(async () => {
            const result = await signIn(formData)
            if (result?.error) {
                setError(result.error)
            }
        })
    }

    return (
        <div className="min-h-screen gradient-soft flex items-center justify-center p-4">
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
                        <CardTitle className="text-2xl">Bem-vindo de volta</CardTitle>
                        <CardDescription>Entre na sua conta para continuar</CardDescription>
                    </CardHeader>

                    <CardContent className="pt-6">
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                {error === 'Invalid login credentials' ? 'E-mail ou senha incorretos' : error}
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

                            <div className="space-y-2">
                                <Label htmlFor="password">Senha</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        required
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
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="rounded border-alma-lilac-300" disabled={isPending} />
                                    <span className="text-alma-blue-900/70">Lembrar de mim</span>
                                </label>
                                <Link href="/forgot-password" className="text-alma-magenta-700 hover:underline">
                                    Esqueceu a senha?
                                </Link>
                            </div>

                            <Button type="submit" className="w-full" size="lg" disabled={isPending}>
                                {isPending ? 'Entrando...' : 'Entrar'}
                            </Button>
                        </form>

                        <p className="text-center text-sm text-alma-blue-900/60 mt-6">
                            Não tem uma conta?{' '}
                            <Link href={`/register?type=${userType}`} className="text-alma-magenta-700 font-medium hover:underline">
                                Cadastre-se
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
