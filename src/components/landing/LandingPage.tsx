'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Menu, X, Heart, Calendar, MessageCircle, Users } from 'lucide-react'

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-alma-lilac-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-alma-blue-900 to-alma-magenta-800 flex items-center justify-center">
                            <Heart className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-bold text-alma-blue-900">Alma</span>
                            <span className="text-[10px] text-alma-magenta-700 -mt-1">by Meraki Psicologia</span>
                        </div>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="#como-funciona" className="text-sm font-medium text-alma-blue-900/70 hover:text-alma-blue-900 transition-colors">
                            Como Funciona
                        </Link>
                        <Link href="#especialidades" className="text-sm font-medium text-alma-blue-900/70 hover:text-alma-blue-900 transition-colors">
                            Especialidades
                        </Link>
                        <Link href="#impacto-social" className="text-sm font-medium text-alma-blue-900/70 hover:text-alma-blue-900 transition-colors">
                            Impacto Social
                        </Link>
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-3">
                        <Link href="/login">
                            <Button variant="ghost" size="sm">Entrar</Button>
                        </Link>
                        <Link href="/register">
                            <Button size="sm">Começar Agora</Button>
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-alma-blue-900"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="md:hidden py-4 border-t border-alma-lilac-200">
                        <div className="flex flex-col gap-3">
                            <Link href="#como-funciona" className="py-2 text-sm font-medium text-alma-blue-900/70">
                                Como Funciona
                            </Link>
                            <Link href="#especialidades" className="py-2 text-sm font-medium text-alma-blue-900/70">
                                Especialidades
                            </Link>
                            <Link href="#impacto-social" className="py-2 text-sm font-medium text-alma-blue-900/70">
                                Impacto Social
                            </Link>
                            <hr className="border-alma-lilac-200 my-2" />
                            <Link href="/login">
                                <Button variant="outline" className="w-full">Entrar</Button>
                            </Link>
                            <Link href="/register">
                                <Button className="w-full">Começar Agora</Button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}

export function Hero() {
    return (
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-alma-blue-900 via-alma-magenta-800 to-alma-blue-800 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-alma-magenta-600/30 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-alma-blue-600/30 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-alma-lilac-400/20 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <div className="space-y-8">
                        {/* Glassmorphism badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/30 text-white text-sm font-medium shadow-lg">
                            <Heart className="w-4 h-4 text-alma-magenta-300" />
                            <span>Cuidado com sua saúde mental</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                            Encontre o <span className="text-alma-magenta-300">psicólogo ideal</span> para você
                        </h1>

                        <p className="text-lg text-white/80 max-w-xl">
                            Conectamos você a profissionais qualificados para sessões de terapia online.
                            Agende com facilidade e cuide da sua saúde mental de onde estiver.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href="/register?type=patient">
                                <Button size="xl" className="w-full sm:w-auto bg-white text-alma-blue-900 hover:bg-white/90">
                                    Buscar Psicólogo
                                </Button>
                            </Link>
                            <Link href="/register?type=psychologist">
                                <Button size="xl" variant="outline" className="w-full sm:w-auto border-white/50 text-white hover:bg-white/10">
                                    Sou Psicólogo
                                </Button>
                            </Link>
                        </div>

                        {/* Social Proof */}
                        <div className="flex items-center gap-6 pt-4">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/50 flex items-center justify-center text-xs font-medium text-white">
                                        {String.fromCharCode(64 + i)}
                                    </div>
                                ))}
                            </div>
                            <div>
                                <p className="font-semibold text-white">+500 pacientes</p>
                                <p className="text-sm text-white/70">já encontraram seu psicólogo</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Content - Glassmorphism Cards */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-3xl -rotate-3 backdrop-blur-sm"></div>
                        <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl p-8 space-y-6">
                            {/* Card 1 - Agendamento Fácil */}
                            <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg hover:bg-white/15 transition-all duration-300">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-alma-blue-500 to-alma-blue-700 flex items-center justify-center shadow-lg">
                                    <Calendar className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <p className="font-semibold text-white">Agendamento Fácil</p>
                                    <p className="text-sm text-white/70">Escolha horário que funciona para você</p>
                                </div>
                            </div>

                            {/* Card 2 - Chat Seguro */}
                            <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg hover:bg-white/15 transition-all duration-300">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-alma-magenta-500 to-alma-magenta-700 flex items-center justify-center shadow-lg">
                                    <MessageCircle className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <p className="font-semibold text-white">Chat Seguro</p>
                                    <p className="text-sm text-white/70">Comunicação privada com seu psicólogo</p>
                                </div>
                            </div>

                            {/* Card 3 - Profissionais Verificados */}
                            <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg hover:bg-white/15 transition-all duration-300">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg">
                                    <Users className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <p className="font-semibold text-white">Profissionais Verificados</p>
                                    <p className="text-sm text-white/70">Todos com CRP válido</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export function HowItWorks() {
    const steps = [
        {
            number: "01",
            title: "Busque",
            description: "Encontre psicólogos por especialidade, nome ou disponibilidade",
            icon: Users,
        },
        {
            number: "02",
            title: "Agende",
            description: "Escolha o horário que melhor se encaixa na sua rotina",
            icon: Calendar,
        },
        {
            number: "03",
            title: "Conecte",
            description: "Inicie sua jornada de autoconhecimento via chat seguro",
            icon: MessageCircle,
        },
    ]

    return (
        <section id="como-funciona" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-alma-blue-900 mb-4">
                        Como Funciona
                    </h2>
                    <p className="text-lg text-alma-blue-900/60 max-w-2xl mx-auto">
                        Em apenas 3 passos simples, você estará conectado com o psicólogo ideal para você
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {steps.map((step, index) => (
                        <div key={index} className="relative group">
                            <div className="bg-gradient-to-br from-alma-lilac-50 to-white p-8 rounded-3xl border border-alma-lilac-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                                <div className="flex items-center gap-4 mb-6">
                                    <span className="text-5xl font-bold text-alma-lilac-300">{step.number}</span>
                                    <div className="w-14 h-14 rounded-2xl bg-alma-blue-900 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        <step.icon className="w-7 h-7 text-white" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-alma-blue-900 mb-2">{step.title}</h3>
                                <p className="text-alma-blue-900/60">{step.description}</p>
                            </div>

                            {index < steps.length - 1 && (
                                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-alma-lilac-300"></div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export function SocialImpact() {
    return (
        <section id="impacto-social" className="py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-alma-magenta-800 to-alma-magenta-900 p-8 sm:p-12 lg:p-16">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-10 left-10 w-40 h-40 rounded-full border-2 border-white"></div>
                        <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full border-2 border-white"></div>
                    </div>

                    <div className="relative grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white text-sm font-medium">
                                <Heart className="w-4 h-4" />
                                <span>Meraki Social</span>
                            </div>

                            <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
                                Cada sessão faz a diferença na vida de uma criança
                            </h2>

                            <p className="text-lg text-white/80">
                                1% de cada consulta é automaticamente destinado ao
                                <strong className="text-white"> Lar da Criança Padre Franz Neumair</strong> em Niterói/RJ,
                                apoiando crianças em situação de vulnerabilidade.
                            </p>

                            <div className="flex items-center gap-6">
                                <div className="text-center">
                                    <p className="text-4xl font-bold text-white">R$ 1,60</p>
                                    <p className="text-sm text-white/60">por consulta</p>
                                </div>
                                <div className="h-12 w-px bg-white/20"></div>
                                <div className="text-center">
                                    <p className="text-4xl font-bold text-white">100%</p>
                                    <p className="text-sm text-white/60">transparência</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-white/80">Valor da consulta</span>
                                    <span className="text-white font-semibold">R$ 160,00</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-white/80">Doação social (1%)</span>
                                    <span className="text-green-300 font-semibold">R$ 1,60</span>
                                </div>
                                <hr className="border-white/20" />
                                <div className="flex items-center justify-between">
                                    <span className="text-white/80">Pacote mensal (4 semanas)</span>
                                    <span className="text-white font-bold text-xl">R$ 640,00</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-white/80">Total para doação</span>
                                    <span className="text-green-300 font-bold">R$ 6,40</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export function PricingSection() {
    return (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-alma-blue-900 mb-4">
                        Valor Fixo, Sem Surpresas
                    </h2>
                    <p className="text-lg text-alma-blue-900/60 max-w-2xl mx-auto">
                        Todas as sessões têm o mesmo valor. Você sabe exatamente quanto vai pagar.
                    </p>
                </div>

                <div className="max-w-md mx-auto">
                    <div className="bg-gradient-to-br from-alma-blue-900 to-alma-blue-800 rounded-3xl p-8 text-white text-center">
                        <p className="text-sm uppercase tracking-wider text-white/60 mb-2">Sessão de 50 minutos</p>
                        <div className="flex items-baseline justify-center gap-1 mb-4">
                            <span className="text-2xl">R$</span>
                            <span className="text-6xl font-bold">160</span>
                            <span className="text-lg text-white/60">/sessão</span>
                        </div>

                        <div className="bg-white/10 rounded-xl p-4 mb-6">
                            <div className="flex items-center justify-between text-sm mb-2">
                                <span>Pacote mensal (4 semanas)</span>
                                <span className="font-semibold">R$ 640,00</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span>Pacote mensal (5 semanas)</span>
                                <span className="font-semibold">R$ 800,00</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-2 text-green-300 text-sm mb-6">
                            <Heart className="w-4 h-4" />
                            <span>Inclui doação social de 1%</span>
                        </div>

                        <Link href="/register">
                            <Button size="xl" className="w-full bg-white text-alma-blue-900 hover:bg-white/90">
                                Começar Agora
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}

export function Footer() {
    return (
        <footer className="bg-alma-blue-900 text-white py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="grid md:grid-cols-4 gap-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                <Heart className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-bold">Alma</span>
                                <span className="text-[10px] text-white/60 -mt-1">by Meraki Psicologia</span>
                            </div>
                        </div>
                        <p className="text-sm text-white/60">
                            Conectando pessoas a profissionais de saúde mental qualificados.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Plataforma</h4>
                        <ul className="space-y-2 text-sm text-white/60">
                            <li><Link href="#como-funciona" className="hover:text-white transition-colors">Como Funciona</Link></li>
                            <li><Link href="#especialidades" className="hover:text-white transition-colors">Especialidades</Link></li>
                            <li><Link href="#impacto-social" className="hover:text-white transition-colors">Impacto Social</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Para Psicólogos</h4>
                        <ul className="space-y-2 text-sm text-white/60">
                            <li><Link href="/register?type=psychologist" className="hover:text-white transition-colors">Cadastre-se</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Como Funciona</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Valores</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Suporte</h4>
                        <ul className="space-y-2 text-sm text-white/60">
                            <li><Link href="#" className="hover:text-white transition-colors">FAQ</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Contato</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Termos de Uso</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Privacidade</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 mt-12 pt-8 text-center text-sm text-white/40">
                    <p>© 2024 Alma - Powered by Meraki Psicologia. Todos os direitos reservados.</p>
                </div>
            </div>
        </footer>
    )
}
