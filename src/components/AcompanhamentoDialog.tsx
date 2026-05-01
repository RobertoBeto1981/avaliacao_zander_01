import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import {
  CalendarIcon,
  Loader2,
  CheckCircle2,
  Circle,
  MessageSquare,
  Paperclip,
  X,
  Trash2,
  Image,
  FileText,
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'
import {
  getAcompanhamentos,
  addAcompanhamento,
  toggleAcompanhamento,
  deleteAcompanhamento,
  updateAcompanhamentoFile,
} from '@/services/acompanhamentos'

export function AcompanhamentoDialog({
  avaliacaoId,
  nomeCliente,
  evoId,
  open,
  onOpenChange,
}: {
  avaliacaoId: string
  nomeCliente: string
  evoId?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { user, profile } = useAuth()
  const userRoles = profile?.roles || (profile?.role ? [profile.role] : [])
  const { toast } = useToast()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [observacao, setObservacao] = useState('')
  const [hasPrazo, setHasPrazo] = useState(false)
  const [prazo, setPrazo] = useState<Date>()
  const [file, setFile] = useState<File | null>(null)
  const [fileCategory, setFileCategory] = useState<string>('Outros')
  const [previewFile, setPreviewFile] = useState<{ name: string; url: string } | null>(null)

  useEffect(() => {
    if (open && avaliacaoId) {
      loadData()
    }
  }, [open, avaliacaoId])

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await getAcompanhamentos(avaliacaoId)
      setItems(data || [])
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Erro', description: e.message })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!observacao.trim() && !file) return
    if (!user) return

    setSaving(true)
    try {
      let file_url = null
      let file_name = null

      if (file) {
        const fileExt = file.name.split('.').pop()
        const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `${avaliacaoId}/${uniqueName}`

        const { error: uploadError } = await supabase.storage
          .from('student-documents')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        file_url = filePath
        file_name = file.name
      }

      const payload = {
        avaliacao_id: avaliacaoId,
        autor_id: user.id,
        observacao: observacao || (file ? `Arquivo anexado: ${file.name}` : ''),
        prazo: hasPrazo && prazo ? format(prazo, 'yyyy-MM-dd') : null,
        file_url,
        file_name,
        file_category: file ? fileCategory : null,
      }
      const newItem = await addAcompanhamento(payload)
      setItems((prev) => [newItem, ...prev])
      setObservacao('')
      setHasPrazo(false)
      setPrazo(undefined)
      setFile(null)
      setFileCategory('Outros')
      toast({ title: 'Sucesso', description: 'Acompanhamento registrado.' })
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Erro', description: e.message })
    } finally {
      setSaving(false)
    }
  }

  const handlePreview = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('student-documents')
        .createSignedUrl(filePath, 3600)
      if (error) throw error
      if (data?.signedUrl) {
        setPreviewFile({ name: fileName, url: data.signedUrl })
      }
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível carregar a visualização do arquivo.',
      })
    }
  }

  const handleDeleteFile = async (id: string, filePath: string, obs: string) => {
    if (!confirm('Tem certeza que deseja excluir este anexo permanentemente?')) return
    try {
      const { error: storageError } = await supabase.storage
        .from('student-documents')
        .remove([filePath])
      if (storageError) console.error(storageError)

      if (obs.startsWith('Arquivo anexado:')) {
        await deleteAcompanhamento(id)
        setItems((prev) => prev.filter((i) => i.id !== id))
      } else {
        const updated = await updateAcompanhamentoFile(id, {
          file_url: null,
          file_name: null,
          file_category: null,
        })
        setItems((prev) => prev.map((i) => (i.id === id ? updated : i)))
      }
      toast({ title: 'Sucesso', description: 'Arquivo excluído com sucesso.' })
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Erro', description: e.message })
    }
  }

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      await toggleAcompanhamento(id, !currentStatus)
      setItems((prev) =>
        prev.map((it) =>
          it.id === id
            ? {
                ...it,
                concluido: !currentStatus,
                concluido_em: !currentStatus ? new Date().toISOString() : null,
              }
            : it,
        ),
      )
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Erro ao atualizar status', description: e.message })
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] flex flex-col h-[85vh] max-h-[800px]">
          <DialogHeader>
            <DialogTitle className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span>Acompanhamento - {nomeCliente}</span>
              {evoId && (
                <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-xs px-2 py-0.5 rounded-md font-semibold w-fit">
                  ID EVO: {evoId}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 flex flex-col min-h-0 overflow-hidden mt-2">
            <ScrollArea className="flex-1 pr-4 mb-4">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Nenhuma observação ou tarefa registrada.
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="bg-muted/40 p-4 rounded-lg border flex gap-3">
                      <div className="pt-0.5">
                        {item.prazo ? (
                          <button
                            onClick={() => handleToggle(item.id, item.concluido)}
                            className="text-primary hover:text-primary/80 transition-colors flex items-center justify-center"
                          >
                            {item.concluido ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : (
                              <Circle className="w-5 h-5 text-muted-foreground" />
                            )}
                          </button>
                        ) : (
                          <MessageSquare className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1 gap-2">
                          <span className="font-semibold text-sm truncate">
                            {item.autor?.nome || 'Usuário'}
                          </span>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {format(new Date(item.created_at), 'dd/MM/yyyy HH:mm')}
                          </span>
                        </div>
                        <p className="text-sm text-foreground/90 whitespace-pre-wrap">
                          {item.observacao}
                        </p>

                        {item.file_name && (
                          <div className="mt-3 flex items-center justify-between bg-blue-500/10 border border-blue-500/20 p-2 rounded-md w-full sm:w-fit transition-colors group">
                            <div
                              onClick={() => handlePreview(item.file_url, item.file_name)}
                              className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer pr-4"
                            >
                              <div className="w-8 h-8 rounded bg-blue-500/20 flex items-center justify-center shrink-0 text-blue-500">
                                {item.file_name.toLowerCase().endsWith('.pdf') ? (
                                  <FileText className="w-4 h-4" />
                                ) : (
                                  <Image className="w-4 h-4" />
                                )}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs text-blue-500 hover:text-blue-400 font-bold truncate max-w-[180px] sm:max-w-[280px]">
                                  {item.file_name}
                                </span>
                                {item.file_category && (
                                  <span className="text-[9px] uppercase tracking-wider text-blue-500/70 font-black mt-0.5">
                                    {item.file_category}
                                  </span>
                                )}
                              </div>
                            </div>

                            {(item.autor_id === user?.id || userRoles.includes('coordenador')) && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-7 h-7 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all shrink-0"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDeleteFile(item.id, item.file_url, item.observacao)
                                    }}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Excluir Arquivo</TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        )}

                        {item.prazo && (
                          <div className="mt-2 text-xs font-medium flex flex-wrap items-center gap-1.5">
                            <span
                              className={cn(
                                'px-2 py-0.5 rounded-full border',
                                item.concluido
                                  ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
                                  : 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
                              )}
                            >
                              Prazo: {format(new Date(item.prazo + 'T12:00:00'), 'dd/MM/yyyy')}
                            </span>
                            {item.concluido && item.concluido_em && (
                              <span className="text-muted-foreground">
                                (Concluído em {format(new Date(item.concluido_em), 'dd/MM/yyyy')})
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            <div className="border-t pt-4 space-y-4 flex-shrink-0 bg-background">
              <div className="space-y-3">
                <Textarea
                  placeholder="Nova observação, mudança de treino ou tarefa..."
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  className="resize-none h-20"
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('file-upload')?.click()}
                      className="h-8 text-xs bg-muted/30"
                    >
                      <Paperclip className="w-3.5 h-3.5 mr-1.5 text-primary" />
                      Anexar Documento
                    </Button>
                  </div>
                </div>

                {file && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-muted/40 p-2.5 rounded-md border border-border/50 animate-fade-in-up">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                        {file.name.toLowerCase().endsWith('.pdf') ? (
                          <FileText className="w-4 h-4" />
                        ) : (
                          <Image className="w-4 h-4" />
                        )}
                      </div>
                      <span className="text-xs font-semibold flex items-center gap-1.5 min-w-0">
                        <span className="truncate max-w-[150px] sm:max-w-[200px]">{file.name}</span>
                        <X
                          className="w-4 h-4 cursor-pointer text-muted-foreground hover:text-destructive shrink-0 transition-colors"
                          onClick={() => setFile(null)}
                        />
                      </span>
                    </div>
                    <div className="w-full sm:w-auto">
                      <Select value={fileCategory} onValueChange={setFileCategory}>
                        <SelectTrigger className="h-8 text-xs w-full sm:w-[150px] font-medium border-primary/20 bg-background">
                          <SelectValue placeholder="Categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Exame">Exame</SelectItem>
                          <SelectItem value="Laudo">Laudo</SelectItem>
                          <SelectItem value="Prescrição">Prescrição</SelectItem>
                          <SelectItem value="Fisioterapia">Fisioterapia</SelectItem>
                          <SelectItem value="Outros">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasPrazo"
                      checked={hasPrazo}
                      onCheckedChange={(c) => setHasPrazo(!!c)}
                    />
                    <Label htmlFor="hasPrazo" className="cursor-pointer text-sm">
                      Determinar uma data de conclusão?
                    </Label>
                  </div>
                  {hasPrazo && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={'outline'}
                          size="sm"
                          className={cn(
                            'w-[200px] justify-start text-left font-normal',
                            !prazo && 'text-muted-foreground',
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {prazo ? format(prazo, 'dd/MM/yyyy') : <span>Escolha uma data</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={prazo} onSelect={setPrazo} initialFocus />
                      </PopoverContent>
                    </Popover>
                  )}
                </div>

                <Button
                  onClick={handleSave}
                  disabled={saving || (!observacao.trim() && !file)}
                  className="w-full sm:w-auto"
                >
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Salvar Anotação
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={!!previewFile} onOpenChange={(o) => !o && setPreviewFile(null)}>
        <DialogContent className="sm:max-w-4xl w-[95vw] h-[85vh] flex flex-col bg-zinc-900 border-zinc-800 text-white p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b border-zinc-800 bg-zinc-900/50">
            <DialogTitle className="truncate pr-8 text-base">{previewFile?.name}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0 bg-black/90 flex flex-col">
            {previewFile?.name.toLowerCase().endsWith('.pdf') ? (
              <iframe
                src={previewFile.url}
                className="w-full h-full border-0"
                title="PDF Preview"
              />
            ) : previewFile?.name.toLowerCase().match(/\.(jpeg|jpg|gif|png|webp)$/) ? (
              <div className="w-full h-full flex items-center justify-center p-4">
                <img
                  src={previewFile.url}
                  className="max-w-full max-h-full object-contain"
                  alt="Preview"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center bg-zinc-900">
                <FileText className="w-16 h-16 text-zinc-700" />
                <span className="text-zinc-400">
                  A visualização em tela não está disponível para este formato de arquivo.
                </span>
                <Button
                  onClick={() => window.open(previewFile?.url, '_blank')}
                  className="mt-2 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Fazer Download Seguro
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
