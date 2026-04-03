import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { saveVideoConfig, uploadVideoFile } from '@/services/videos'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { SmilePlus, Upload, Link as LinkIcon, Save, Loader2 } from 'lucide-react'

const EMOJIS = [
  '😀',
  '😂',
  '🤣',
  '😊',
  '😍',
  '🥰',
  '😘',
  '😜',
  '🤪',
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
]

export function ConfigCard({
  triggerDays,
  initialConfig,
}: {
  triggerDays: number
  initialConfig: any
}) {
  const { toast } = useToast()
  const [config, setConfig] = useState(
    initialConfig || {
      dias_trigger: triggerDays,
      is_active: true,
      video_url: '',
      message_template:
        'Olá {{nome}}, tudo bem? Conforme o seu planejamento, aqui está o seu vídeo de hoje: {{link_video}}',
    },
  )
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await saveVideoConfig(config)
      toast({ title: 'Sucesso', description: 'Configuração salva.' })
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Erro', description: e.message })
    } finally {
      setIsSaving(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    try {
      const url = await uploadVideoFile(file, triggerDays)
      setConfig((prev: any) => ({ ...prev, video_url: url }))
      toast({ title: 'Sucesso', description: 'Vídeo carregado com sucesso.' })
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erro no upload', description: err.message })
    } finally {
      setIsUploading(false)
    }
  }

  const insertEmoji = (emoji: string) => {
    const textarea = document.getElementById(
      `template-gatilho-${triggerDays}`,
    ) as HTMLTextAreaElement
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const text = config.message_template || ''
      const newText = text.substring(0, start) + emoji + text.substring(end)
      setConfig((prev: any) => ({ ...prev, message_template: newText }))
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + emoji.length, start + emoji.length)
      }, 10)
    } else {
      setConfig((prev: any) => ({
        ...prev,
        message_template: (prev.message_template || '') + emoji,
      }))
    }
  }

  return (
    <Card className="border-border/50 shadow-sm flex flex-col">
      <CardHeader className="bg-muted/10 border-b border-border/50 py-3 flex flex-row items-center justify-between">
        <CardTitle className="text-base">Gatilho: {triggerDays} dias</CardTitle>
        <div className="flex items-center gap-2">
          <Label htmlFor={`active-${triggerDays}`} className="text-xs">
            Ativo
          </Label>
          <Switch
            id={`active-${triggerDays}`}
            checked={config.is_active}
            onCheckedChange={(val) => setConfig((prev: any) => ({ ...prev, is_active: val }))}
          />
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4 flex-grow flex flex-col">
        <div className="space-y-2">
          <Label className="text-xs font-semibold">URL do Vídeo</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="https://..."
                className="pl-9"
                value={config.video_url || ''}
                onChange={(e) => setConfig((prev: any) => ({ ...prev, video_url: e.target.value }))}
              />
            </div>
            <div className="relative">
              <Button variant="outline" type="button" disabled={isUploading} className="w-10 p-0">
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
              </Button>
              <input
                type="file"
                accept="video/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2 flex-grow flex flex-col">
          <Label className="text-xs font-semibold flex justify-between items-center">
            <span>Mensagem WhatsApp</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  className="h-6 text-[10px] px-2 border-border/50"
                >
                  <SmilePlus className="w-3 h-3 mr-1" />
                  Inserir Emoji
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[320px] p-2 grid grid-cols-8 gap-1 max-h-[220px] overflow-y-auto"
                align="end"
              >
                {EMOJIS.map((e) => (
                  <button
                    key={e}
                    onClick={() => insertEmoji(e)}
                    className="hover:bg-muted p-1.5 rounded text-lg flex items-center justify-center transition-colors"
                  >
                    {e}
                  </button>
                ))}
              </PopoverContent>
            </Popover>
          </Label>
          <Textarea
            id={`template-gatilho-${triggerDays}`}
            className="flex-grow min-h-[100px] resize-none text-sm"
            value={config.message_template || ''}
            onChange={(e) =>
              setConfig((prev: any) => ({ ...prev, message_template: e.target.value }))
            }
          />
          <p className="text-[10px] text-muted-foreground">
            Variáveis: {'{{nome}}, {{link_video}}'}
          </p>
        </div>

        <Button onClick={handleSave} disabled={isSaving} className="w-full mt-2">
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Salvar Gatilho
        </Button>
      </CardContent>
    </Card>
  )
}
