import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { Loader2, SmilePlus, Plus, Trash2 } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

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
      .then((tplRes) => {
        if (tplRes.data) setTemplates(tplRes.data)
        setLoading(false)
      })
  }, [])

  const handleChange = (id: string, field: string, value: any) => {
    setTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, [field]: value } : t)))
    if (field === 'template' || field === 'title') {
      setDirtyIds((prev) => new Set(prev).add(id))
    }
  }

  const handleSave = async (id: string, title: string, text: string) => {
    setSavingId(id)
    try {
      const { error } = await supabase
        .from('message_templates')
        .update({ title, template: text, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
      toast({
        title: 'Sucesso',
        description: 'Template atualizado.',
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

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      const { error } = await supabase
        .from('message_templates')
        .update({ is_active: !current })
        .eq('id', id)
      if (error) throw error
      handleChange(id, 'is_active', !current)
      toast({ title: 'Sucesso', description: 'Status atualizado.' })
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erro', description: err.message })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este template?')) return
    try {
      const { error } = await supabase.from('message_templates').delete().eq('id', id)
      if (error) throw error
      setTemplates((prev) => prev.filter((t) => t.id !== id))
      toast({ title: 'Sucesso', description: 'Template excluído.' })
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erro', description: err.message })
    }
  }

  const handleAddTemplate = async () => {
    const id = `custom_${Date.now()}`
    const newTpl = {
      id,
      title: 'Novo Template',
      template: 'Escreva sua mensagem aqui...',
      variables: '{{nome}}, {{link_video}}',
      is_active: true,
      updated_at: new Date().toISOString(),
    }
    try {
      const { error } = await supabase.from('message_templates').insert(newTpl)
      if (error) throw error
      setTemplates((prev) => [newTpl, ...prev])
      toast({ title: 'Sucesso', description: 'Template criado.' })
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
          Emoji
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
    <div className="animate-fade-in-up space-y-6">
      <div className="flex justify-between items-center bg-muted/20 p-4 rounded-lg border border-border/50">
        <div>
          <h3 className="font-semibold text-foreground">Gestão de Templates</h3>
          <p className="text-sm text-muted-foreground">
            Crie, edite ou exclua templates de mensagens para uso no sistema.
          </p>
        </div>
        <Button onClick={handleAddTemplate} className="bg-[#95c23d] text-black hover:bg-[#85b035]">
          <Plus className="w-4 h-4 mr-2" />
          Novo Template
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {templates.map((tpl) => {
          const isDirty = dirtyIds.has(tpl.id)
          const isActive = tpl.is_active ?? true

          return (
            <Card
              key={tpl.id}
              className={`border-border/50 shadow-sm flex flex-col transition-colors ${!isActive ? 'opacity-70 bg-muted/5' : 'bg-card'}`}
            >
              <CardHeader className="bg-muted/10 border-b border-border/50 py-3 space-y-0 relative">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 space-y-1">
                    <Input
                      value={tpl.title}
                      onChange={(e) => handleChange(tpl.id, 'title', e.target.value)}
                      className="font-semibold text-base h-8 bg-transparent border-transparent hover:border-border/50 focus:border-primary px-2 -ml-2"
                    />
                    <CardDescription className="text-xs px-1">
                      Variáveis:{' '}
                      {tpl.variables?.split(', ').map((v: string) => (
                        <code
                          key={v}
                          className="bg-muted px-1 rounded mx-0.5 text-foreground/80 font-mono"
                        >
                          {v}
                        </code>
                      ))}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor={`active-${tpl.id}`}
                        className="text-xs text-muted-foreground cursor-pointer"
                      >
                        {isActive ? 'Ativo' : 'Inativo'}
                      </Label>
                      <Switch
                        id={`active-${tpl.id}`}
                        checked={isActive}
                        onCheckedChange={() => handleToggleActive(tpl.id, isActive)}
                        className="data-[state=checked]:bg-[#95c23d]"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(tpl.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      title="Excluir template"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-3 flex-1 flex flex-col">
                <Textarea
                  id={`template-${tpl.id}`}
                  value={tpl.template}
                  onChange={(e) => handleChange(tpl.id, 'template', e.target.value)}
                  className="min-h-[120px] resize-none flex-1 text-sm bg-background disabled:opacity-50"
                  disabled={!isActive}
                />
                <div className="flex items-center justify-between mt-auto pt-2">
                  <EmojiPicker
                    targetId={`template-${tpl.id}`}
                    text={tpl.template}
                    onChange={(val: string) => handleChange(tpl.id, 'template', val)}
                  />
                  <Button
                    onClick={() => handleSave(tpl.id, tpl.title, tpl.template)}
                    disabled={savingId === tpl.id || !isDirty || !isActive}
                    variant={!isDirty ? 'secondary' : 'default'}
                    size="sm"
                    className={
                      isDirty && isActive
                        ? 'bg-[#95c23d] text-black hover:bg-[#85b035]'
                        : 'bg-muted text-muted-foreground'
                    }
                  >
                    {savingId === tpl.id ? 'Salvando...' : !isDirty ? 'Salvo' : 'Salvar Alteração'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
