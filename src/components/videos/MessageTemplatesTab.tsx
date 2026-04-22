import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { Loader2, SmilePlus } from 'lucide-react'
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
    <div className="animate-fade-in-up">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {templates.map((tpl) => {
          const isDirty = dirtyIds.has(tpl.id)
          return (
            <Card key={tpl.id} className="border-border/50 shadow-sm flex flex-col bg-card">
              <CardHeader className="bg-muted/10 border-b border-border/50 py-3">
                <CardTitle className="text-base text-foreground">{tpl.title}</CardTitle>
                <CardDescription className="text-xs mt-1">
                  Variáveis:{' '}
                  {tpl.variables.split(', ').map((v: string) => (
                    <code
                      key={v}
                      className="bg-muted px-1 rounded mx-0.5 text-foreground/80 font-mono"
                    >
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
                  className="min-h-[120px] resize-none flex-1 text-sm bg-background"
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
