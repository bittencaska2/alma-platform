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
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import CreatePsychologistDialog from '@/components/admin/CreatePsychologistDialog'

export default async function AdminPsychologistsPage() {
    const supabase = await createClient()

    const { data: psychologists, error } = await supabase
        .from('psychologists')
        .select(`
      *,
      profiles (
        full_name,
        email,
        photo_url,
        whatsapp
      )
    `)
        .order('created_at', { ascending: false })

    if (error) {
        return <div className="p-4 text-red-500">Erro ao carregar psicólogos: {error.message}</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Psicólogos</h2>
                    <p className="text-muted-foreground">Gerencie os profissionais cadastrados.</p>
                </div>
                <CreatePsychologistDialog />
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Profissional</TableHead>
                            <TableHead>CRP</TableHead>
                            <TableHead>Preço Sessão</TableHead>
                            <TableHead>Slots</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {psychologists?.map((psy) => {
                            const profile = psy.profiles as any
                            return (
                                <TableRow key={psy.id}>
                                    <TableCell className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={profile?.photo_url} />
                                            <AvatarFallback>{profile?.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{profile?.full_name}</span>
                                            <span className="text-xs text-muted-foreground">{profile?.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{psy.crp}</TableCell>
                                    <TableCell>
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(psy.session_price)}
                                    </TableCell>
                                    <TableCell>{psy.filled_slots} / 2</TableCell>
                                    <TableCell>
                                        <Badge variant={psy.is_active ? 'default' : 'secondary'}>
                                            {psy.is_active ? 'Ativo' : 'Inativo'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm">Editar</Button>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                        {psychologists?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    Nenhum psicólogo encontrado.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
