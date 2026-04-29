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
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
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
  const [motivo, setMotivo] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { profile } = useAuth()

  const handleSave = async () => {
    if (!evoId || !nome || !motivo.trim()) {
      toast({
        title: 'Atenção',
        description: 'ID EVO, Nome e Motivo da Inclusão são obrigatórios.',
        variant: 'destructive',
      })
      return
    }
    setLoading(true)
    try {
      const isProfessor =
        profile?.roles?.includes('professor') || profile?.role?.toLowerCase() === 'professor'
      const isProfessorDashboard = window.location.pathname.includes('/professor')

      let profId = null
      if (isProfessor && isProfessorDashboard && profile?.id) {
        profId = profile.id
      }

      const { data, error } = await supabase.rpc('upsert_aluno_dialog', {
        p_evo_id: evoId,
        p_nome_cliente: nome.trim().toUpperCase(),
        p_telefone_cliente: telefone,
        p_professor_id: profId,
      })

      if (error) throw error

      const result = data as { success?: boolean; message?: string; id?: string }

      if (result && !result.success) {
        toast({
          title: 'Atenção',
          description: result.message || 'Erro ao registrar.',
          variant: 'destructive',
        })
        setLoading(false)
        return
      }

      if (result && result.success && result.id && profile?.id) {
        await supabase.from('avaliacao_acompanhamentos').insert({
          avaliacao_id: result.id,
          autor_id: profile.id,
          observacao: `Motivo da inclusão no sistema: ${motivo.trim()}`,
        })
      }

      toast({ title: 'Sucesso', description: result?.message || 'Aluno registrado com sucesso.' })
      setEvoId('')
      setNome('')
      setTelefone('')
      setMotivo('')
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
          <div className="space-y-2 pt-2 border-t mt-4">
            <Label htmlFor="motivo">Motivo da Inclusão *</Label>
            <Textarea
              id="motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Por qual motivo este aluno está sendo incluído no sistema?"
              className="resize-none h-20"
            />
            <p className="text-xs text-muted-foreground mt-1 font-medium text-amber-600 dark:text-amber-500">
              O cliente só será incluído se houver um motivo prévio. Esta informação será gravada no
              histórico de acompanhamentos.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading || !evoId || !nome || !motivo.trim()}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
