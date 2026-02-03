'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { PlusCircle } from 'lucide-react'
import { createPsychologist } from '@/lib/actions/admin'
import { toast } from '@/components/ui/use-toast'

export default function CreatePsychologistDialog() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)

        const formData = new FormData(event.currentTarget)
        // Process specialties (comma separated to array string)
        const specialtiesString = formData.get('specialtiesInput') as string
        const specialtiesArray = specialtiesString.split(',').map(s => s.trim()).filter(s => s)
        formData.set('specialties', JSON.stringify(specialtiesArray))

        try {
            const result = await createPsychologist(null, formData)

            if (result.error) {
                toast({ title: 'Erro', description: result.error, variant: 'destructive' })
            } else {
                toast({ title: 'Sucesso', description: result.message })
                setOpen(false)
                // Assuming revalidatePath handles refresh, or we might need router.refresh() 
            }
        } catch (error) {
            toast({ title: 'Erro', description: 'Erro inesperado.', variant: 'destructive' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Novo Psicólogo
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Cadastrar Novo Psicólogo</DialogTitle>
                    <DialogDescription>
                        Preencha todos os dados para criar a conta e o perfil do profissional.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Nome Completo</Label>
                            <Input id="fullName" name="fullName" required placeholder="Ex: Dr. Ana Silva" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">E-mail (Login)</Label>
                            <Input id="email" name="email" type="email" required placeholder="email@exemplo.com" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">Senha</Label>
                            <Input id="password" name="password" type="password" required minLength={6} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Whatsapp</Label>
                            <Input id="whatsapp" name="whatsapp" required placeholder="(11) 99999-9999" />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="crp">CRP</Label>
                            <Input id="crp" name="crp" required placeholder="00/00000" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="price">Valor Sessão (R$)</Label>
                            <Input id="price" name="price" type="number" step="0.01" defaultValue="160.00" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="photo">Foto de Perfil</Label>
                            <Input id="photo" name="photo" type="file" accept="image/*" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="specialtiesInput">Especialidades (separadas por vírgula)</Label>
                        <Input id="specialtiesInput" name="specialtiesInput" placeholder="Ex: Ansiedade, Depressão, TCC" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bio">Biografia / Sobre Mim</Label>
                        <Textarea id="bio" name="bio" rows={4} placeholder="Breve descrição do profissional..." />
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Criando...' : 'Criar Conta'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
