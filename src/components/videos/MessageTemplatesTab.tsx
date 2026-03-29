import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export function MessageTemplatesTab() {
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  useEffect(() => {
    supabase
      .from('message_templates')
      .select('*')
      .order('title')
      .then(({ data }) => {
        if (data) setTemplates(data)
        setLoading(false)
      })
  }, [])

  const handleChange = (id: string, value: string) => {
    setTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, template: value } : t)))
    setDirtyIds((prev) => new Set(prev).add(id))
  }

  const handleSave = async (id: string, text: string) => {
    setSavingId(id)
    try {
      const { error } = await supabase
        .from('message_templates')
        .update({ template: text, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
      toast({ title: 'Sucesso', description: 'Template de mensagem atualizado.' })
      setDirtyIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erro', description: err.message })
    } finally {
      setSavingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="text-muted-foreground mb-4">
        <p>
          Configure os textos padrões que serão enviados pelo WhatsApp (tanto pelo botão de envio
          manual na tabela de avaliações, quanto pelas automações de API).
        </p>
      </div>

      {templates.map((tpl) => {
        const isDirty = dirtyIds.has(tpl.id)
        return (
          <Card key={tpl.id} className="border-border/50 shadow-sm">
            <CardHeader className="bg-muted/10 border-b border-border/50 py-4">
              <CardTitle className="text-lg">{tpl.title}</CardTitle>
              <CardDescription>
                Variáveis disponíveis:{' '}
                {tpl.variables.split(', ').map((v: string) => (
                  <code key={v} className="bg-muted px-1 rounded mx-1">
                    {v}
                  </code>
                ))}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <Textarea
                value={tpl.template}
                onChange={(e) => handleChange(tpl.id, e.target.value)}
                className="min-h-[150px] resize-none"
              />
              <Button
                onClick={() => handleSave(tpl.id, tpl.template)}
                disabled={savingId === tpl.id || !isDirty}
                variant={!isDirty ? 'secondary' : 'default'}
                className={
                  !isDirty
                    ? 'w-full relative z-20 bg-muted text-muted-foreground hover:bg-muted/80'
                    : 'w-full relative z-20 bg-[#95c23d] text-black hover:bg-[#85b035]'
                }
              >
                {savingId === tpl.id
                  ? 'Salvando...'
                  : !isDirty
                    ? 'Configuração Salva'
                    : 'Salvar Mensagem'}
              </Button>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
