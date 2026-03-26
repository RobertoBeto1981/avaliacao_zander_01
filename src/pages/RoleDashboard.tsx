import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { format, startOfDay, differenceInDays } from 'date-fns'
import {
  FileText,
  HeartPulse,
  Activity,
  Scale,
  Target,
  AlertCircle,
  MessageSquare,
  History,
  Edit,
} from 'lucide-react'
import { getEvaluations, updateEvaluationStatus } from '@/services/evaluations'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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
import { useAuth } from '@/hooks/use-auth'

export default function RoleDashboard() {
  const [evaluations, setEvaluations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
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
  const { toast } = useToast()
  const { profile } = useAuth()

  const loadData = async () => {
    try {
      const data = await getEvaluations()
      // Show only evaluations assigned to this specific evaluator, unless they are a coordinator
      setEvaluations(
        data.filter(
          (ev: any) => ev.avaliador_id === profile?.id || profile?.role === 'coordenador',
        ),
      )
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Erro', description: e.message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (profile) loadData()
  }, [profile])

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateEvaluationStatus(id, status)
      setEvaluations((prev) => prev.map((ev) => (ev.id === id ? { ...ev, status } : ev)))
      toast({ title: 'Sucesso', description: 'Status atualizado com sucesso.' })
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Erro', description: e.message })
    }
  }

  const filtered = useMemo(
    () =>
      evaluations.filter(
        (ev) => statusFilter === 'all' || (ev.status || 'pendente') === statusFilter,
      ),
    [evaluations, statusFilter],
  )

  if (loading) return <div className="p-8 text-center text-muted-foreground">Carregando...</div>

  return (
    <div className="container mx-auto py-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Painel de Atendimentos</h1>
        <Button asChild>
          <Link to="/evaluation/new">Nova Avaliação</Link>
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="em_progresso">Em Progresso</SelectItem>
            <SelectItem value="concluido">Concluído</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="overflow-hidden border-border/50 shadow-sm">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="min-w-[220px]">Nome do Cliente</TableHead>
              <TableHead className="whitespace-nowrap">Data Avaliação</TableHead>
              <TableHead className="whitespace-nowrap">Reavaliação</TableHead>
              <TableHead className="whitespace-nowrap">Status</TableHead>
              <TableHead className="whitespace-nowrap">Ações</TableHead>
              <TableHead className="whitespace-nowrap text-right">Links</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((ev) => {
              const today = startOfDay(new Date())
              const evalDate = ev.data_avaliacao ? new Date(ev.data_avaliacao + 'T12:00:00') : null
              const isPre = ev.is_pre_avaliacao || !ev.data_avaliacao
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
                { type: 'internal', url: `/evaluation/${ev.id}`, icon: FileText, label: 'Resumo' },
                {
                  type: 'external',
                  url: links.mapeamento_sintomas_url,
                  icon: HeartPulse,
                  label: 'Sintomas',
                },
                { type: 'external', url: links.mapeamento_dor_url, icon: Activity, label: 'Dor' },
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
                      <span className="line-clamp-2 leading-snug">{ev.nome_cliente}</span>
                      <div className="flex gap-1.5 items-center flex-wrap">
                        {ev.is_pre_avaliacao && (
                          <Badge
                            variant="destructive"
                            className="whitespace-nowrap text-[10px] px-2 py-0.5 border-none leading-tight flex items-center gap-1 w-fit"
                          >
                            <AlertCircle className="w-3 h-3" /> Pendente
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
                  <TableCell>
                    <Select
                      value={ev.status || 'pendente'}
                      onValueChange={(val) => handleStatusChange(ev.id, val)}
                    >
                      <SelectTrigger className="w-[140px] h-8 text-xs font-semibold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="em_progresso">Em Progresso</SelectItem>
                        <SelectItem value="concluido">Concluído</SelectItem>
                      </SelectContent>
                    </Select>
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
                        <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-primary" /> Anotações
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
                        <TooltipContent>Ver Histórico</TooltipContent>
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
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhuma avaliação encontrada.
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
    </div>
  )
}
