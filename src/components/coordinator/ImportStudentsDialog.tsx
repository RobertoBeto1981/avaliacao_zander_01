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
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

export function ImportStudentsDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [total, setTotal] = useState(0)
  const { toast } = useToast()
  const { profile } = useAuth()

  const handleProcess = async () => {
    if (!file) return
    setLoading(true)
    try {
      const text = await file.text()
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0)
      if (lines.length <= 1) {
        toast({
          variant: 'destructive',
          description: 'O arquivo parece estar vazio ou sem dados após o cabeçalho.',
        })
        setLoading(false)
        return
      }

      const dataLines = lines.slice(1)
      setTotal(dataLines.length)
      setProgress(0)

      let insertedCount = 0
      let ignoredCount = 0

      for (let i = 0; i < dataLines.length; i++) {
        const line = dataLines[i]
        // Trata delimitadores CSV básicos, ignorando os mais complexos com aspas nesta versão
        let cols = line.includes(';') ? line.split(';') : line.split(',')
        cols = cols.map((c) => c.trim().replace(/^"|"$/g, ''))

        if (cols.length >= 2) {
          const evoId = cols[0]
          const nome = cols[1]
          const tel = cols[2] || ''
          const motivo = cols[3] || 'Importação via CSV'

          if (evoId && nome) {
            const { data, error } = await supabase.rpc('import_aluno_csv_safely' as any, {
              p_evo_id: evoId,
              p_nome_cliente: nome.trim(),
              p_telefone_cliente: tel,
              p_professor_id: null,
            })

            if (!error && data) {
              const res = data as { status: string; id: string; reason?: string }
              if (res.status === 'inserted') {
                insertedCount++
                if (res.id && profile?.id) {
                  await supabase.from('avaliacao_acompanhamentos').insert({
                    avaliacao_id: res.id,
                    autor_id: profile.id,
                    observacao: `Motivo da inclusão: ${motivo}`,
                  })
                }
              } else if (res.status === 'ignored') {
                ignoredCount++
              }
            } else {
              ignoredCount++ // fallback em caso de falha da request
            }
          }
        }
        setProgress(i + 1)
      }

      toast({
        title: 'Importação Concluída',
        description: `${insertedCount} novos clientes incluídos. ${ignoredCount > 0 ? `${ignoredCount} clientes ignorados por já constarem na base de dados.` : ''}`,
        duration: 8000,
      })
      onSuccess()
      onOpenChange(false)
    } catch (e: any) {
      toast({ variant: 'destructive', description: e.message })
    } finally {
      setLoading(false)
      setFile(null)
      setProgress(0)
      setTotal(0)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar Alunos (CSV)</DialogTitle>
          <DialogDescription>
            O arquivo CSV deve conter as colunas na exata ordem:{' '}
            <strong>ID EVO, NOME, TELEFONE, MOTIVO DA INCLUSÃO</strong>. Separe por vírgula ou
            ponto-e-vírgula.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <Input type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          {loading && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium text-muted-foreground">
                <span>Processando alunos...</span>
                <span>
                  {progress} / {total}
                </span>
              </div>
              <Progress value={total > 0 ? (progress / total) * 100 : 0} className="h-2" />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button disabled={!file || loading} onClick={handleProcess}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Iniciar Importação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
