import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { saveVideoConfig, uploadVideoFile } from '@/services/videos'
import { UploadCloud, Link as LinkIcon, PlayCircle } from 'lucide-react'

export function ConfigCard({
  triggerDays,
  initialConfig,
}: {
  triggerDays: number
  initialConfig: any
}) {
  const { toast } = useToast()
  const [isActive, setIsActive] = useState(initialConfig?.is_active ?? true)
  const [videoUrl, setVideoUrl] = useState(initialConfig?.video_url || '')
  const [messageTemplate, setMessageTemplate] = useState(
    initialConfig?.message_template ||
      'Olá {{nome}}, tudo bem? Aqui está o seu vídeo de acompanhamento!',
  )
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  const handleChange = (setter: any, value: any) => {
    setter(value)
    setIsDirty(true)
    setIsSaved(false)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('video/')) {
      toast({
        variant: 'destructive',
        title: 'Formato inválido',
        description: 'Por favor, envie apenas arquivos de vídeo.',
      })
      return
    }

    setUploading(true)
    try {
      const url = await uploadVideoFile(file, triggerDays)
      setVideoUrl(url)
      setIsDirty(true)
      setIsSaved(false)
      toast({ title: 'Sucesso', description: 'Vídeo enviado com sucesso! Salve para aplicar.' })
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erro no upload', description: err.message })
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveVideoConfig({
        dias_trigger: triggerDays,
        is_active: isActive,
        video_url: videoUrl,
        message_template: messageTemplate,
      })
      toast({
        title: 'Configuração salva',
        description: `Automação de ${triggerDays} dias atualizada.`,
      })
      setIsDirty(false)
      setIsSaved(true)
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erro ao salvar', description: err.message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="border-border/50 shadow-sm relative overflow-hidden">
      {!isActive && <div className="absolute inset-0 bg-background/50 z-10 pointer-events-none" />}
      <CardHeader className="bg-muted/10 border-b border-border/50 flex flex-row items-center justify-between py-4">
        <div>
          <CardTitle className="text-lg">Gatilho: {triggerDays} Dias</CardTitle>
          <CardDescription>Enviado {triggerDays} dias após a data da avaliação.</CardDescription>
        </div>
        <div className="flex items-center space-x-2 z-20">
          <Label htmlFor={`active-${triggerDays}`}>{isActive ? 'Ativo' : 'Inativo'}</Label>
          <Switch
            id={`active-${triggerDays}`}
            checked={isActive}
            onCheckedChange={(val) => handleChange(setIsActive, val)}
          />
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-primary" /> Vídeo para Envio
          </Label>
          <Input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            disabled={uploading || !isActive}
            className="w-full"
          />
          {videoUrl && (
            <div className="text-sm flex items-center gap-2 text-blue-600 mt-3 font-medium bg-blue-500/10 p-2 rounded-md">
              <PlayCircle className="w-4 h-4" />
              <a
                href={videoUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:underline truncate max-w-[400px]"
              >
                Visualizar Vídeo Atual Salvo
              </a>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Mensagem do WhatsApp</Label>
          <Textarea
            value={messageTemplate}
            onChange={(e) => handleChange(setMessageTemplate, e.target.value)}
            disabled={!isActive}
            className="min-h-[100px] resize-none"
            placeholder="Escreva a mensagem..."
          />
          <p className="text-xs text-muted-foreground">
            Variáveis disponíveis: <code className="bg-muted px-1 rounded">{'{{nome}}'}</code>. O
            vídeo anexado será enviado automaticamente junto com esta mensagem.
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving || uploading || (!isDirty && !isSaved)}
          variant={isSaved && !isDirty ? 'secondary' : 'default'}
          className="text-[#95c23d]"
        >
          {saving
            ? 'Salvando...'
            : uploading
              ? 'Enviando Vídeo...'
              : isSaved && !isDirty
                ? 'Configuração Salva'
                : 'Salvar Configuração'}
        </Button>
      </CardContent>
    </Card>
  )
}
