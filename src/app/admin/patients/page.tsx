import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PlusCircle } from 'lucide-react'

export default async function AdminPatientsPage() {
    const supabase = await createClient()

    const { data: patients, error } = await supabase
        .from('patients')
        .select(`
      *,
      profiles (
        full_name,
        email,
        phone,
        whatsapp,
        photo_url
      )
    `)
        .order('created_at', { ascending: false })

    if (error) {
        return <div className="p-4 text-red-500">Erro ao carregar pacientes: {error.message}</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Pacientes</h2>
                    <p className="text-muted-foreground">Gerencie os pacientes cadastrados.</p>
                </div>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Novo Paciente
                </Button>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Paciente</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Whatsapp</TableHead>
                            <TableHead>Idade</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {patients?.map((patient) => {
                            const profile = patient.profiles as any
                            return (
                                <TableRow key={patient.id}>
                                    <TableCell className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={profile?.photo_url} />
                                            <AvatarFallback>{profile?.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium">{profile?.full_name}</span>
                                    </TableCell>
                                    <TableCell>{profile?.email}</TableCell>
                                    <TableCell>{profile?.whatsapp || profile?.phone || '-'}</TableCell>
                                    <TableCell>{patient.age || '-'}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm">Editar</Button>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                        {patients?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    Nenhum paciente encontrado.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
