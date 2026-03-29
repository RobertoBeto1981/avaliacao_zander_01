import { useEffect, useState, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { format, isAfter, startOfDay, differenceInDays } from 'date-fns'
import {
  FileText,
  HeartPulse,
  Activity,
  Scale,
  Target,
  AlertCircle,
  MessageSquare,
  History,
  Plus,
  MessageCircle,
  Edit,
  Loader2,
} from 'lucide-react'
import { getEvaluations, updateEvaluationStatus } from '@/services/evaluations'
import { calculateDeadline } from '@/lib/holidays'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
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
import { cn } from '@/lib/utils'
import { AcompanhamentoDialog } from '@/components/AcompanhamentoDialog'
import { HistoryDialog } from '@/components/HistoryDialog'
import { NovoAlunoDialog } from '@/components/NovoAlunoDialog'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'

export default function ProfessorDashboard() {
  const [evaluations, setEvaluations] = useState<any[]>([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [periodoFilter, setPeriodoFilter] = useState<string>('all')
  const [acompanhamentoEval, setAcompanhamentoEval] = useState<{
    id: string
    nome: string
    evo_id?: string
  } | null>(null)
  const [historyEval, setHistoryEval] = useState<{
    id: string
    nome: string
    evo_id?: string
  } | null>(null)
  const [isNewStudentOpen, setIsNewStudentOpen] = useState(false)
  const { toast } = useToast()
  const { profile } = useAuth()

  const isCoordenador = profile?.role === 'coordenador'
  const isProfessor = profile?.roles?.includes('professor') || profile?.role === 'professor'

  const profileId = profile?.id

  const loadData = useCallback(async () => {
    try {
      const data = await getEvaluations()
      // Filtra apenas os alunos que foram atribuídos a ESTE professor específico
      setEvaluations(data.filter((ev: any) => ev.professor_id === profileId))
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Erro', description: e.message })
    } finally {
      setInitialLoading(false)
    }
  }, [profileId, toast])

  useEffect(() => {
    if (profileId) {
      loadData()
    } else {
      setInitialLoading(false)
    }
  }, [profileId, loadData])

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateEvaluationStatus(id, status)
      setEvaluations((prev) => prev.map((ev) => (ev.id === id ? { ...ev, status } : ev)))
      toast({ title: 'Sucesso', description: 'Status atualizado com sucesso.' })
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Erro', description: e.message })
    }
  }

  const handleSendWhatsApp = async (ev: any) => {
    if (!ev.telefone_cliente) {
      toast({
        title: 'Atenção',
        description: 'Cliente não possui telefone cadastrado.',
        variant: 'destructive',
      })
      return
    }

    let phone = ev.telefone_cliente.replace(/\D/g, '')
    if (!phone.startsWith('55')) phone = '55' + phone

    const links = ev.links_avaliacao?.[0] || {}
    const firstName = ev.nome_cliente.trim().split(' ')[0]

    let linksStr = ''
    if (links.anamnese_url) linksStr += `📝 *Anamnese:* ${links.anamnese_url}\n`
    if (links.mapeamento_sintomas_url)
      linksStr += `🔍 *Sintomas:* ${links.mapeamento_sintomas_url}\n`
    if (links.mapeamento_dor_url) linksStr += `🎯 *Dor:* ${links.mapeamento_dor_url}\n`
    if (links.bia_url) linksStr += `⚖️ *BIA:* ${links.bia_url}\n`
    if (links.my_score_url) linksStr += `📊 *My Score:* ${links.my_score_url}\n`

    try {
      const { data: tpl } = await supabase
        .from('message_templates')
        .select('template')
        .eq('id', 'links_avaliacao')
        .single()
      let text =
        tpl?.template ||
        `Olá, {{nome}}, tudo bem?\n\nAbaixo estão os links da sua avaliação:\n\n{{links}}\n\nMuito obrigado por realizar sua avaliação física na Zander Academia. Estamos juntos nessa jornada! 💙`

      text = text.replace(/{{nome}}/g, firstName).replace(/{{links}}/g, linksStr.trim())

      const url = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`
      window.open(url, '_blank')
      toast({ title: 'WhatsApp Aberto', description: 'A janela do WhatsApp foi aberta.' })
    } catch (err) {
      console.error(err)
    }
  }

  const periodos = useMemo(
    () => Array.from(new Set(evaluations.map((e) => e.periodo_treino).filter(Boolean))),
    [evaluations],
  )

  const filtered = useMemo(() => {
    return evaluations.filter((ev) => {
      const matchStatus = statusFilter === 'all' || (ev.status || 'pendente') === statusFilter
      const matchPeriodo = periodoFilter === 'all' || ev.periodo_treino === periodoFilter
      return matchStatus && matchPeriodo
    })
  }, [evaluations, statusFilter, periodoFilter])

  const lateEvals = useMemo(() => {
    const today = startOfDay(new Date())
    return evaluations.filter((ev) => {
      if (ev.status === 'concluido') return false

      const isDesafio = ev.desafio_zander_status?.trim().toLowerCase() === 'ativo'

      if (!isDesafio && (ev.is_pre_avaliacao || !ev.data_avaliacao)) return false

      let deadlineStr = ev.data_avaliacao
      let deadline = null

      if (isDesafio) {
        const baseDate = ev.desafio_zander_ativado_em || ev.created_at || ev.data_avaliacao
        if (baseDate) {
          deadlineStr = baseDate.includes('T') ? baseDate.split('T')[0] : baseDate.split(' ')[0]
          deadline = calculateDeadline(deadlineStr, 3)
        } else {
          deadline = calculateDeadline(new Date().toISOString().split('T')[0], 3)
        }
      } else if (deadlineStr) {
        deadline = calculateDeadline(deadlineStr, 3)
      }

      if (!deadline) return false
      return isAfter(today, deadline)
    })
  }, [evaluations])

  if (initialLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Meu Painel de Professor</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Exibindo exclusivamente os alunos distribuídos para você montar o treino.
          </p>
        </div>
        {isProfessor && (
          <Button onClick={() => setIsNewStudentOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Aluno
          </Button>
        )}
      </div>

      {lateEvals.length > 0 && (
        <Alert
          variant="destructive"
          className="mb-6 animate-pulse border-destructive/50 bg-destructive/10"
        >
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-lg font-bold">Atenção: Avaliações Atrasadas!</AlertTitle>
          <AlertDescription className="text-base">
            Você possui <strong>{lateEvals.length}</strong>{' '}
            {lateEvals.length === 1 ? 'avaliação' : 'avaliações'} com prazo de montagem de treino
            expirado (mais de 3 dias úteis). Por favor, priorize-as.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-4 mb-6">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por Treino" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Treinos</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="em_progresso">Em Progresso</SelectItem>
            <SelectItem value="concluido">Concluído</SelectItem>
          </SelectContent>
        </Select>

        <Select value={periodoFilter} onValueChange={setPeriodoFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Períodos</SelectItem>
            {periodos.map((p: any) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="overflow-hidden border-border/50 shadow-sm">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="min-w-[220px]">Nome do Cliente</TableHead>
              <TableHead className="whitespace-nowrap">Data da Avaliação</TableHead>
              <TableHead className="whitespace-nowrap">Reavaliação</TableHead>
              <TableHead className="whitespace-nowrap">Período de Treino</TableHead>
              <TableHead className="whitespace-nowrap">Treino</TableHead>
              <TableHead className="whitespace-nowrap">Prazo (Treino)</TableHead>
              <TableHead className="whitespace-nowrap">Ações</TableHead>
              <TableHead className="whitespace-nowrap text-right">Links</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((ev) => {
              const today = startOfDay(new Date())
              const evalDate = ev.data_avaliacao ? new Date(ev.data_avaliacao + 'T12:00:00') : null
              const isPre = ev.is_pre_avaliacao || !ev.data_avaliacao
              const isDesafio = ev.desafio_zander_status?.trim().toLowerCase() === 'ativo'

              let deadlineStr = ev.data_avaliacao
              let deadline = null

              if (isDesafio) {
                const baseDate = ev.desafio_zander_ativado_em || ev.created_at || ev.data_avaliacao
                if (baseDate) {
                  deadlineStr = baseDate.includes('T')
                    ? baseDate.split('T')[0]
                    : baseDate.split(' ')[0]
                  deadline = calculateDeadline(deadlineStr, 3)
                } else {
                  deadline = calculateDeadline(new Date().toISOString().split('T')[0], 3)
                }
              } else if (deadlineStr) {
                deadline = calculateDeadline(deadlineStr, 3)
              }
              const isLate =
                ((!isPre && deadline) || (isDesafio && deadline)) &&
                deadline &&
                isAfter(today, deadline) &&
                ev.status !== 'concluido'
              const links = ev.links_avaliacao?.[0] || {}

              let reevalColorClass = ''
              let reevalDotClass = ''
              let isPulsing = false

              if (!isPre && ev.data_reavaliacao && evalDate) {
                const daysSinceEval = differenceInDays(today, evalDate)
                if (daysSinceEval <= 29) {
                  reevalColorClass = 'text-primary'
                  reevalDotClass = 'bg-primary'
                } else if (daysSinceEval <= 59) {
                  reevalColorClass = 'text-amber-500'
                  reevalDotClass = 'bg-amber-500'
                } else if (daysSinceEval <= 90) {
                  reevalColorClass = 'text-destructive'
                  reevalDotClass = 'bg-destructive'
                } else {
                  reevalColorClass = 'text-destructive font-bold'
                  reevalDotClass = 'bg-destructive'
                  isPulsing = true
                }
              }

              const linkItems = [
                {
                  type: 'internal',
                  url: `/evaluation/${ev.id}`,
                  icon: FileText,
                  label: 'Resumo da Avaliação',
                },
                {
                  type: 'external',
                  url: links.mapeamento_sintomas_url,
                  icon: HeartPulse,
                  label: 'Mapeamento Sintomas',
                },
                {
                  type: 'external',
                  url: links.mapeamento_dor_url,
                  icon: Activity,
                  label: 'Mapeamento da Dor',
                },
                { type: 'external', url: links.bia_url, icon: Scale, label: 'BIA' },
                { type: 'external', url: links.my_score_url, icon: Target, label: 'My Score' },
              ]

              return (
                <TableRow
                  key={ev.id}
                  className={cn('hover:bg-muted/30', ev.is_pre_avaliacao && 'bg-primary/5')}
                >
                  <TableCell className="font-medium min-w-[220px]">
                    <div className="flex flex-col gap-1.5">
                      <span className="line-clamp-2 leading-snug" title={ev.nome_cliente}>
                        {ev.nome_cliente}
                      </span>
                      <div className="flex gap-1.5 items-center flex-wrap">
                        {ev.is_pre_avaliacao && (
                          <Badge
                            variant="destructive"
                            className="whitespace-nowrap text-[10px] px-2 py-0.5 border-none leading-tight flex items-center gap-1 w-fit"
                          >
                            <AlertCircle className="w-3 h-3" /> Pendente
                          </Badge>
                        )}
                        {ev.desafio_zander_status?.trim().toLowerCase() === 'ativo' && (
                          <Badge
                            variant="default"
                            className="whitespace-nowrap text-[10px] px-1.5 py-0.5 border-none leading-tight bg-purple-600 hover:bg-purple-700 text-white w-fit"
                          >
                            #DesafioZander
                          </Badge>
                        )}
                        {ev.evo_id && (
                          <Badge
                            variant="outline"
                            className="whitespace-nowrap text-[10px] px-1.5 py-0.5 border-primary/30 text-primary/80 leading-tight"
                          >
                            EVO: {ev.evo_id}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {isPre ? (
                      <span className="text-muted-foreground">-</span>
                    ) : evalDate ? (
                      format(evalDate, 'dd/MM/yyyy')
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {isPre || !ev.data_reavaliacao ? (
                      <span className="text-muted-foreground">-</span>
                    ) : (
                      <div
                        className={cn(
                          'flex items-center gap-2',
                          reevalColorClass,
                          isPulsing && 'animate-pulse',
                        )}
                      >
                        <span className={cn('w-2 h-2 rounded-full', reevalDotClass)} />
                        <span>
                          {format(new Date(ev.data_reavaliacao + 'T12:00:00'), 'dd/MM/yyyy')}
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{ev.periodo_treino || '-'}</TableCell>
                  <TableCell>
                    <Select
                      value={ev.status || 'pendente'}
                      onValueChange={(val) => handleStatusChange(ev.id, val)}
                    >
                      <SelectTrigger
                        className={cn(
                          'w-[140px] h-8 text-xs font-semibold',
                          (!ev.status || ev.status === 'pendente') &&
                            'border-amber-500/30 text-amber-500 bg-amber-500/10',
                          ev.status === 'em_progresso' &&
                            'border-blue-500/30 text-blue-500 bg-blue-500/10',
                          ev.status === 'concluido' &&
                            'border-primary/30 text-primary bg-primary/10',
                        )}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="em_progresso">Em Progresso</SelectItem>
                        <SelectItem value="concluido">Concluído</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {(!isDesafio && isPre) || !deadline ? (
                      <span className="text-muted-foreground">-</span>
                    ) : (
                      <div className="flex flex-col gap-0.5 items-start">
                        <div className="flex items-center gap-2 font-medium">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${isLate ? 'bg-destructive animate-pulse' : 'bg-primary'}`}
                          />
                          {format(deadline, 'dd/MM/yyyy')}
                        </div>
                        {isDesafio ? (
                          <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">
                            #DesafioZander
                          </span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground font-medium">
                            3 dias úteis
                          </span>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1.5 items-center">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs px-2 flex-1 font-medium whitespace-nowrap bg-secondary/30"
                        onClick={() =>
                          setAcompanhamentoEval({
                            id: ev.id,
                            nome: ev.nome_cliente,
                            evo_id: ev.evo_id,
                          })
                        }
                      >
                        <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-primary" />
                        Anotações
                      </Button>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 shrink-0 text-primary hover:text-primary hover:bg-primary/20 border-primary/20"
                            asChild
                          >
                            <Link to={`/evaluation/edit/${ev.id}`}>
                              <Edit className="w-4 h-4" />
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Editar Avaliação</TooltipContent>
                      </Tooltip>

                      {!ev.is_pre_avaliacao && isCoordenador && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 shrink-0 text-accent hover:text-accent hover:bg-accent/20 border-accent/20"
                              onClick={() => handleSendWhatsApp(ev)}
                            >
                              <MessageCircle className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Enviar links via WhatsApp</TooltipContent>
                        </Tooltip>
                      )}

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 shrink-0 text-muted-foreground border-border/50"
                            onClick={() =>
                              setHistoryEval({
                                id: ev.id,
                                nome: ev.nome_cliente,
                                evo_id: ev.evo_id,
                              })
                            }
                          >
                            <History className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Ver Histórico de Auditoria</TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      {linkItems.map((item, idx) => {
                        const Icon = item.icon
                        if (!ev.is_pre_avaliacao && item.url) {
                          return (
                            <Tooltip key={idx}>
                              <TooltipTrigger asChild>
                                {item.type === 'internal' ? (
                                  <Link
                                    to={item.url}
                                    className="p-1.5 hover:bg-primary/20 rounded-md transition-colors text-primary"
                                  >
                                    <Icon className="w-4 h-4" />
                                  </Link>
                                ) : (
                                  <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1.5 hover:bg-primary/20 rounded-md transition-colors text-primary"
                                  >
                                    <Icon className="w-4 h-4" />
                                  </a>
                                )}
                              </TooltipTrigger>
                              <TooltipContent>{item.label}</TooltipContent>
                            </Tooltip>
                          )
                        }

                        return (
                          <Tooltip key={idx}>
                            <TooltipTrigger asChild>
                              <div className="p-1.5 opacity-20 cursor-not-allowed">
                                <Icon className="w-4 h-4" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>{item.label} (Indisponível)</TooltipContent>
                          </Tooltip>
                        )
                      })}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Nenhuma avaliação atribuída a você no momento.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <AcompanhamentoDialog
        open={!!acompanhamentoEval}
        onOpenChange={(open) => !open && setAcompanhamentoEval(null)}
        avaliacaoId={acompanhamentoEval?.id || ''}
        nomeCliente={acompanhamentoEval?.nome || ''}
        evoId={acompanhamentoEval?.evo_id}
      />

      <HistoryDialog
        open={!!historyEval}
        onOpenChange={(open) => !open && setHistoryEval(null)}
        avaliacaoId={historyEval?.id || ''}
        nomeCliente={historyEval?.nome || ''}
        evoId={historyEval?.evo_id}
      />

      {isProfessor && (
        <NovoAlunoDialog
          open={isNewStudentOpen}
          onOpenChange={setIsNewStudentOpen}
          onSuccess={() => {
            setIsNewStudentOpen(false)
            loadData()
          }}
        />
      )}
    </div>
  )
}
