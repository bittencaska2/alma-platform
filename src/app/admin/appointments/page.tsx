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
import { Calendar, Clock, Trash2 } from 'lucide-react'

export default async function AdminAppointmentsPage() {
    const supabase = await createClient()

    // Fetch appointments with all relations
    const { data: appointments, error } = await supabase
        .from('appointments')
        .select(`
      id,
      scheduled_date,
      start_time,
      end_time,
      status,
      patients (
        profiles ( full_name, email )
      ),
      psychologists (
        profiles ( full_name )
      )
    `)
        .order('scheduled_date', { ascending: false })

    if (error) {
        return <div className="p-4 text-red-500">Erro: {error.message}</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Agendamentos</h2>
                    <p className="text-muted-foreground">Controle total de consultas.</p>
                </div>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                    <Calendar className="mr-2 h-4 w-4" />
                    Nova Consulta Manual
                </Button>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Horário</TableHead>
                            <TableHead>Paciente</TableHead>
                            <TableHead>Psicólogo</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {appointments?.map((appt) => {
                            const patient = (appt.patients as any)?.profiles
                            const psychologist = (appt.psychologists as any)?.profiles

                            return (
                                <TableRow key={appt.id}>
                                    <TableCell>
                                        {new Date(appt.scheduled_date).toLocaleDateString('pt-BR')}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Clock className="mr-1 h-3 w-3" />
                                            {appt.start_time?.substring(0, 5)} - {appt.end_time?.substring(0, 5)}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">{patient?.full_name || '?'}</TableCell>
                                    <TableCell>{psychologist?.full_name || '?'}</TableCell>
                                    <TableCell>
                                        <Badge variant={appt.status === 'confirmed' ? 'default' : 'secondary'}>
                                            {appt.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" className="text-red-500">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                        {appointments?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    Nenhum agendamento encontrado.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
