import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { Loader2, SmilePlus, Plus, Trash2 } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export function MessageTemplatesTab() {
  const [templates, setTemplates] = useState<any[]>([])
  const [automations, setAutomations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  const [isNewAutoOpen, setIsNewAutoOpen] = useState(false)
  const [newAutoDays, setNewAutoDays] = useState('')
  const [newAutoMessage, setNewAutoMessage] = useState('')

  useEffect(() => {
    Promise.all([
      supabase.from('message_templates').select('*').order('title'),
      supabase.from('video_automations_config').select('*').order('dias_trigger'),
    ]).then(([tplRes, autoRes]) => {
      if (tplRes.data) setTemplates(tplRes.data)
      if (autoRes.data) setAutomations(autoRes.data)
      setLoading(false)
    })
  }, [])

  const handleChange = (id: string, value: string, isAuto: boolean = false) => {
    if (isAuto) {
      setAutomations((prev) =>
        prev.map((t) => (t.id === id ? { ...t, message_template: value } : t)),
      )
    } else {
      setTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, template: value } : t)))
    }
    setDirtyIds((prev) => new Set(prev).add(id))
  }

  const handleSave = async (id: string, text: string, isAuto: boolean = false) => {
    setSavingId(id)
    try {
      if (isAuto) {
        const { error } = await supabase
          .from('video_automations_config')
          .update({ message_template: text, updated_at: new Date().toISOString() })
          .eq('id', id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('message_templates')
          .update({ template: text, updated_at: new Date().toISOString() })
          .eq('id', id)
        if (error) throw error
      }
      toast({
        title: 'Sucesso',
        description: isAuto ? 'Automação atualizada.' : 'Template atualizado.',
      })
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

  const handleCreateAuto = async () => {
    const days = parseInt(newAutoDays)
    if (isNaN(days) || days <= 0) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Dias deve ser maior que zero.' })
      return
    }
    if (automations.some((a) => a.dias_trigger === days)) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Já existe uma automação para estes dias.',
      })
      return
    }

    setSavingId('new')
    try {
      const { data, error } = await supabase
        .from('video_automations_config')
        .insert({
          dias_trigger: days,
          message_template:
            newAutoMessage || 'Olá {{nome}}, tudo bem? Aqui está o seu vídeo: {{link_video}}',
          is_active: true,
        })
        .select()
        .single()

      if (error) throw error
      setAutomations((prev) => [...prev, data].sort((a, b) => a.dias_trigger - b.dias_trigger))
      setIsNewAutoOpen(false)
      setNewAutoDays('')
      setNewAutoMessage('')
      toast({ title: 'Sucesso', description: 'Nova automação criada.' })
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erro ao criar', description: err.message })
    } finally {
      setSavingId(null)
    }
  }

  const handleDeleteAuto = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta automação?')) return
    try {
      const { error } = await supabase.from('video_automations_config').delete().eq('id', id)
      if (error) throw error
      setAutomations((prev) => prev.filter((a) => a.id !== id))
      toast({ title: 'Sucesso', description: 'Automação excluída.' })
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erro', description: err.message })
    }
  }

  const EmojiPicker = ({
    targetId,
    text,
    onChange,
  }: {
    targetId: string
    text: string
    onChange: (val: string) => void
  }) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          type="button"
          className="h-8 border-border/50 text-muted-foreground hover:text-foreground"
        >
          <SmilePlus className="w-4 h-4 mr-2" />
          Inserir Emoji
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[320px] p-2 grid grid-cols-8 gap-1 max-h-[220px] overflow-y-auto"
        align="start"
      >
        {[
          '😀',
          '😂',
          '🤣',
          '😊',
          '😍',
          '🥰',
          '😘',
          '😜',
          '😎',
          '🤩',
          '🥳',
          '😏',
          '😒',
          '😞',
          '😔',
          '😟',
          '😕',
          '🙁',
          '😣',
          '😖',
          '😫',
          '😩',
          '🥺',
          '😢',
          '😭',
          '😤',
          '😠',
          '😡',
          '🤬',
          '🤯',
          '😳',
          '🥵',
          '🥶',
          '😱',
          '😨',
          '😰',
          '😥',
          '😓',
          '🤗',
          '🤔',
          '🤭',
          '🤫',
          '🤥',
          '😶',
          '😐',
          '😑',
          '😬',
          '🙄',
          '😯',
          '😦',
          '😧',
          '😮',
          '😲',
          '🥱',
          '😴',
          '🤤',
          '😪',
          '😵',
          '🤐',
          '🥴',
          '🤢',
          '🤮',
          '🤧',
          '😷',
          '🤒',
          '🤕',
          '🤑',
          '🤠',
          '😈',
          '👿',
          '👹',
          '👺',
          '🤡',
          '💩',
          '👻',
          '💀',
          '☠️',
          '👽',
          '👾',
          '🤖',
          '🎃',
          '😺',
          '😸',
          '😹',
          '😻',
          '😼',
          '😽',
          '🙀',
          '😿',
          '😾',
          '❤️',
          '🧡',
          '💛',
          '💚',
          '💙',
          '💜',
          '🖤',
          '🤍',
          '🤎',
          '💔',
          '❣️',
          '💕',
          '💞',
          '💓',
          '💗',
          '💖',
          '💘',
          '💝',
          '💟',
          '☮️',
          '✝️',
          '💪',
          '🏋️',
          '🏃',
          '🤸',
          '🚴',
          '🎯',
          '🏆',
          '🏅',
          '🥇',
          '🥈',
          '🥉',
          '🔥',
          '✨',
          '🌟',
          '💫',
          '💥',
          '💯',
          '✅',
          '❌',
          '⚠️',
          '🛑',
          '👍',
          '👎',
          '👏',
          '🙌',
          '👐',
          '🤝',
          '🙏',
          '🚨',
          '📝',
          '🩺',
          '⚖️',
          '📊',
          '📌',
        ].map((e) => (
          <button
            key={e}
            onClick={() => {
              const textarea = document.getElementById(targetId) as HTMLTextAreaElement
              if (textarea) {
                const start = textarea.selectionStart
                const end = textarea.selectionEnd
                const newText = text.substring(0, start) + e + text.substring(end)
                onChange(newText)
                setTimeout(() => {
                  textarea.focus()
                  textarea.setSelectionRange(start + e.length, start + e.length)
                }, 10)
              } else {
                onChange(text + e)
              }
            }}
            className="hover:bg-muted p-1.5 rounded text-lg flex items-center justify-center transition-colors"
          >
            {e}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  )

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-muted-foreground">
          <p>
            Crie novas regras de automação (gatilhos baseados em tempo) ou ajuste os textos padrões
            do sistema.
          </p>
        </div>
        <Dialog open={isNewAutoOpen} onOpenChange={setIsNewAutoOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-md">
              <Plus className="w-4 h-4" /> Nova Automação
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Automação</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Dias após a avaliação para acionar o gatilho</Label>
                <Input
                  type="number"
                  value={newAutoDays}
                  onChange={(e) => setNewAutoDays(e.target.value)}
                  placeholder="Ex: 15"
                />
              </div>
              <div className="space-y-2">
                <Label>Mensagem Padrão</Label>
                <Textarea
                  value={newAutoMessage}
                  onChange={(e) => setNewAutoMessage(e.target.value)}
                  placeholder="Olá {{nome}}, tudo bem?..."
                  className="min-h-[120px] resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Variáveis permitidas: <code className="bg-muted px-1 rounded">{'{{nome}}'}</code>,{' '}
                  <code className="bg-muted px-1 rounded">{'{{link_video}}'}</code>
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewAutoOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateAuto} disabled={savingId === 'new'}>
                {savingId === 'new' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Salvar Automação
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2 text-primary border-b border-border/50 pb-2">
          Automações e Gatilhos (Envios Futuros)
        </h2>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {automations.map((auto) => {
            const isDirty = dirtyIds.has(auto.id)
            return (
              <Card key={auto.id} className="border-border/50 shadow-sm flex flex-col">
                <CardHeader className="bg-muted/10 border-b border-border/50 py-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base text-primary">
                      Gatilho: {auto.dias_trigger} Dias
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                      Variáveis: <code className="bg-muted px-1 rounded">{'{{nome}}'}</code>,{' '}
                      <code className="bg-muted px-1 rounded">{'{{link_video}}'}</code>
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 -mt-2"
                    onClick={() => handleDeleteAuto(auto.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="pt-4 space-y-3 flex-1 flex flex-col">
                  <Textarea
                    id={`auto-${auto.id}`}
                    value={auto.message_template || ''}
                    onChange={(e) => handleChange(auto.id, e.target.value, true)}
                    className="min-h-[120px] resize-none flex-1 text-sm"
                  />
                  <div className="flex items-center justify-between mt-auto pt-2">
                    <EmojiPicker
                      targetId={`auto-${auto.id}`}
                      text={auto.message_template || ''}
                      onChange={(val) => handleChange(auto.id, val, true)}
                    />
                    <Button
                      onClick={() => handleSave(auto.id, auto.message_template, true)}
                      disabled={savingId === auto.id || !isDirty}
                      variant={!isDirty ? 'secondary' : 'default'}
                      size="sm"
                      className={
                        isDirty
                          ? 'bg-[#95c23d] text-black hover:bg-[#85b035]'
                          : 'bg-muted text-muted-foreground'
                      }
                    >
                      {savingId === auto.id
                        ? 'Salvando...'
                        : !isDirty
                          ? 'Salvo'
                          : 'Salvar Alteração'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
        {automations.length === 0 && (
          <p className="text-muted-foreground text-sm italic">
            Nenhuma automação configurada no momento.
          </p>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2 border-b border-border/50 pb-2 mt-4">
          Templates de Sistema
        </h2>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {templates.map((tpl) => {
            const isDirty = dirtyIds.has(tpl.id)
            return (
              <Card key={tpl.id} className="border-border/50 shadow-sm flex flex-col">
                <CardHeader className="bg-muted/10 border-b border-border/50 py-3">
                  <CardTitle className="text-base">{tpl.title}</CardTitle>
                  <CardDescription className="text-xs mt-1">
                    Variáveis:{' '}
                    {tpl.variables.split(', ').map((v: string) => (
                      <code key={v} className="bg-muted px-1 rounded mx-0.5">
                        {v}
                      </code>
                    ))}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 space-y-3 flex-1 flex flex-col">
                  <Textarea
                    id={`template-${tpl.id}`}
                    value={tpl.template}
                    onChange={(e) => handleChange(tpl.id, e.target.value)}
                    className="min-h-[120px] resize-none flex-1 text-sm"
                  />
                  <div className="flex items-center justify-between mt-auto pt-2">
                    <EmojiPicker
                      targetId={`template-${tpl.id}`}
                      text={tpl.template}
                      onChange={(val) => handleChange(tpl.id, val)}
                    />
                    <Button
                      onClick={() => handleSave(tpl.id, tpl.template)}
                      disabled={savingId === tpl.id || !isDirty}
                      variant={!isDirty ? 'secondary' : 'default'}
                      size="sm"
                      className={
                        isDirty
                          ? 'bg-[#95c23d] text-black hover:bg-[#85b035]'
                          : 'bg-muted text-muted-foreground'
                      }
                    >
                      {savingId === tpl.id
                        ? 'Salvando...'
                        : !isDirty
                          ? 'Salvo'
                          : 'Salvar Alteração'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
