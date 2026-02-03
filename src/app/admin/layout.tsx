import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { LayoutDashboard, Users, UserCog, Calendar, DollarSign, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { signOut } from '@/lib/actions/auth'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Double check admin role
    if (user.user_metadata?.user_type !== 'admin') {
        // In case middleware missed it or direct access check
        redirect('/')
    }

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white shadow-xl">
                <div className="p-6">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                        MASTER ADMIN
                    </h1>
                    <p className="text-xs text-gray-400 mt-1">Alma Platform Control</p>
                </div>

                <nav className="mt-6 px-4 space-y-2">
                    <Link href="/admin/dashboard">
                        <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-slate-800">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            Dashboard
                        </Button>
                    </Link>

                    <Link href="/admin/patients">
                        <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-slate-800">
                            <Users className="mr-2 h-4 w-4" />
                            Pacientes
                        </Button>
                    </Link>

                    <Link href="/admin/psychologists">
                        <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-slate-800">
                            <UserCog className="mr-2 h-4 w-4" />
                            Psicólogos
                        </Button>
                    </Link>

                    <Link href="/admin/appointments">
                        <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-slate-800">
                            <Calendar className="mr-2 h-4 w-4" />
                            Agendamentos
                        </Button>
                    </Link>

                    <Link href="/admin/financial">
                        <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-slate-800">
                            <DollarSign className="mr-2 h-4 w-4" />
                            Financeiro
                        </Button>
                    </Link>
                </nav>

                <div className="absolute bottom-8 px-4 w-64">
                    <form action={signOut}>
                        <Button variant="destructive" className="w-full justify-start">
                            <LogOut className="mr-2 h-4 w-4" />
                            Sair
                        </Button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    )
}
