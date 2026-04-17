import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { createPreAvaliacao } from '@/services/evaluations'
import { Loader2 } from 'lucide-react'
import { formatPhone } from '@/lib/utils'

export function NovoAlunoDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}) {
  const [evoId, setEvoId] = useState('')
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { profile } = useAuth()

  const handleSave = async () => {
    if (!evoId || !nome) {
      toast({
        title: 'Atenção',
        description: 'ID EVO e Nome são obrigatórios.',
        variant: 'destructive',
      })
      return
    }
    setLoading(true)
    try {
      const isProfessor =
        profile?.roles?.includes('professor') || profile?.role?.toLowerCase() === 'professor'
      const payload: any = {
        evo_id: evoId,
        nome_cliente: nome.trim().toUpperCase(),
        telefone_cliente: telefone,
        status: 'pendente',
      }

      if (isProfessor && profile?.id) {
        payload.professor_id = profile.id
      }

      await createPreAvaliacao(payload)
      toast({ title: 'Sucesso', description: 'Aluno registrado com sucesso.' })
      setEvoId('')
      setNome('')
      setTelefone('')
      onSuccess()
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Novo Aluno</DialogTitle>
          <DialogDescription>
            Se o ID EVO já existir, as informações serão sincronizadas automaticamente.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="evo_id">ID EVO *</Label>
            <Input
              id="evo_id"
              value={evoId}
              onChange={(e) => setEvoId(e.target.value)}
              placeholder="Ex: 12345"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Cliente *</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Maria da Silva"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              value={telefone}
              onChange={(e) => setTelefone(formatPhone(e.target.value))}
              placeholder="+55 (00) 00000-0000"
              maxLength={19}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading || !evoId || !nome}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
