import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { CalendarClock, Check, ChevronsUpDown, Video } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { getEvaluations } from '@/services/evaluations'
import { scheduleVideo, getScheduledVideos } from '@/services/videos'
import { format, addDays } from 'date-fns'
import { cn } from '@/lib/utils'

export default function VideoScheduling() {
  const { toast } = useToast()
  const [evaluations, setEvaluations] = useState<any[]>([])
  const [scheduledVideos, setScheduledVideos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [openEval, setOpenEval] = useState(false)
  const [selectedEvalId, setSelectedEvalId] = useState('')
  const [days, setDays] = useState('')
  const [url, setUrl] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [evals, videos] = await Promise.all([getEvaluations(), getScheduledVideos()])
      // Apenas avaliações finalizadas (não pre-avaliações)
      setEvaluations(evals.filter((e: any) => !e.is_pre_avaliacao))
      setScheduledVideos(videos)
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Erro', description: e.message })
    } finally {
      setLoading(false)
    }
  }

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEvalId || !days || !url) {
      toast({ variant: 'destructive', title: 'Atenção', description: 'Preencha todos os campos.' })
      return
    }

    setSaving(true)
    try {
      await scheduleVideo({
        avaliacao_id: selectedEvalId,
        dias_apos_avaliacao: parseInt(days),
        url_google_drive: url,
      })
      toast({ title: 'Sucesso', description: 'Vídeo agendado com sucesso!' })
      setSelectedEvalId('')
      setDays('')
      setUrl('')
      loadData()
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erro ao agendar', description: err.message })
    } finally {
      setSaving(false)
    }
  }

  const selectedEval = evaluations.find((e) => e.id === selectedEvalId)

  if (loading) return <div className="p-8 text-center text-muted-foreground">Carregando...</div>

  return (
    <div className="container mx-auto py-8 max-w-5xl animate-fade-in-up">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-primary/10 p-4 rounded-xl text-primary">
          <CalendarClock className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agendamento de Vídeos</h1>
          <p className="text-muted-foreground text-lg">
            Programe o envio de vídeos educativos para os alunos baseados na data da avaliação.
          </p>
        </div>
      </div>

      <Card className="mb-8 border-border/50 shadow-md">
        <CardHeader className="bg-muted/10 border-b border-border/50">
          <CardTitle className="text-xl">Novo Agendamento</CardTitle>
          <CardDescription>Configure o envio automático de vídeos do Google Drive.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form
            onSubmit={handleSchedule}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
          >
            <div className="space-y-2 md:col-span-2 flex flex-col">
              <Label>Aluno / Avaliação</Label>
              <Popover open={openEval} onOpenChange={setOpenEval}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openEval}
                    className="w-full justify-between font-normal"
                  >
                    {selectedEvalId
                      ? selectedEval?.nome_cliente || 'Selecionado...'
                      : 'Selecione a avaliação...'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar por nome do cliente..." />
                    <CommandList>
                      <CommandEmpty>Nenhuma avaliação encontrada.</CommandEmpty>
                      <CommandGroup>
                        {evaluations.map((ev) => (
                          <CommandItem
                            key={ev.id}
                            value={ev.nome_cliente}
                            onSelect={() => {
                              setSelectedEvalId(ev.id)
                              setOpenEval(false)
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                selectedEvalId === ev.id ? 'opacity-100' : 'opacity-0',
                              )}
                            />
                            {ev.nome_cliente} (
                            {format(new Date(ev.data_avaliacao + 'T00:00:00'), 'dd/MM/yyyy')})
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Dias após Avaliação</Label>
              <Select value={days} onValueChange={setDays}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Dia</SelectItem>
                  <SelectItem value="7">7 Dias</SelectItem>
                  <SelectItem value="30">30 Dias</SelectItem>
                  <SelectItem value="60">60 Dias</SelectItem>
                  <SelectItem value="90">90 Dias</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-3">
              <Label>Link do Google Drive</Label>
              <Input
                placeholder="https://drive.google.com/file/d/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full font-bold md:col-span-1" disabled={saving}>
              {saving ? 'Agendando...' : 'Agendar Vídeo'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/50 shadow-md">
        <CardHeader className="bg-muted/10 border-b border-border/50">
          <CardTitle className="text-xl flex items-center gap-2">
            <Video className="w-5 h-5 text-primary" />
            Histórico de Agendamentos
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 p-0 overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Aluno</TableHead>
                <TableHead>Gatilho</TableHead>
                <TableHead>Data Estimada</TableHead>
                <TableHead>Link do Vídeo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Enviado Em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scheduledVideos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum vídeo agendado.
                  </TableCell>
                </TableRow>
              ) : (
                scheduledVideos.map((video) => {
                  const dataAvaliacao = video.avaliacoes?.data_avaliacao
                    ? new Date(video.avaliacoes.data_avaliacao + 'T00:00:00')
                    : null
                  const dataEstimada = dataAvaliacao
                    ? addDays(dataAvaliacao, video.dias_apos_avaliacao)
                    : null

                  return (
                    <TableRow key={video.id}>
                      <TableCell className="font-medium">
                        {video.avaliacoes?.nome_cliente || 'Avaliação Removida'}
                      </TableCell>
                      <TableCell>{video.dias_apos_avaliacao} Dias</TableCell>
                      <TableCell>
                        {dataEstimada ? format(dataEstimada, 'dd/MM/yyyy') : '-'}
                      </TableCell>
                      <TableCell>
                        <a
                          href={video.url_google_drive}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline max-w-[200px] truncate block"
                          title={video.url_google_drive}
                        >
                          Ver Vídeo
                        </a>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={video.status === 'enviado' ? 'default' : 'secondary'}
                          className={
                            video.status === 'enviado' ? 'bg-green-500 hover:bg-green-600' : ''
                          }
                        >
                          {video.status === 'enviado' ? 'Enviado' : 'Pendente'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {video.data_envio
                          ? format(new Date(video.data_envio), 'dd/MM/yyyy HH:mm')
                          : '-'}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
