import { useEffect, useState, useMemo } from 'react'
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
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { AcompanhamentoDialog } from '@/components/AcompanhamentoDialog'

export default function ProfessorDashboard() {
  const [evaluations, setEvaluations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [periodoFilter, setPeriodoFilter] = useState<string>('all')
  const [acompanhamentoEval, setAcompanhamentoEval] = useState<{ id: string; nome: string } | null>(
    null,
  )
  const { toast } = useToast()

  const loadData = async () => {
    try {
      const data = await getEvaluations()
      setEvaluations(data)
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Erro', description: e.message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateEvaluationStatus(id, status)
      setEvaluations((prev) => prev.map((ev) => (ev.id === id ? { ...ev, status } : ev)))
      toast({ title: 'Sucesso', description: 'Status atualizado com sucesso.' })
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Erro', description: e.message })
    }
  }

  const periodos = useMemo(
    () => Array.from(new Set(evaluations.map((e) => e.periodo_treino).filter(Boolean))),
    [evaluations],
  )

  const filtered = useMemo(() => {
    return evaluations.filter((ev) => {
      const matchStatus = statusFilter === 'all' || ev.status === statusFilter
      const matchPeriodo = periodoFilter === 'all' || ev.periodo_treino === periodoFilter
      return matchStatus && matchPeriodo
    })
  }, [evaluations, statusFilter, periodoFilter])

  const lateEvals = useMemo(() => {
    const today = startOfDay(new Date())
    return evaluations.filter((ev) => {
      if (ev.status === 'concluido') return false
      const deadline = calculateDeadline(ev.data_avaliacao, 3)
      return isAfter(today, deadline)
    })
  }, [evaluations])

  if (loading) return <div className="p-8 text-center text-muted-foreground">Carregando...</div>

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Painel do Professor</h1>

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
            <SelectValue placeholder="Filtrar por Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
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

      <Card className="overflow-hidden border-border/50">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead>Nome do Cliente</TableHead>
              <TableHead>Data da Avaliação</TableHead>
              <TableHead>Reavaliação</TableHead>
              <TableHead>Período de Treino</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Prazo para Treino</TableHead>
              <TableHead>Acompanhamento</TableHead>
              <TableHead>Links</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((ev) => {
              const today = startOfDay(new Date())
              const evalDate = new Date(ev.data_avaliacao + 'T00:00:00')
              const deadline = calculateDeadline(ev.data_avaliacao, 3)
              const isLate = isAfter(today, deadline) && ev.status !== 'concluido'
              const links = ev.links_avaliacao?.[0] || {}

              const daysSinceEval = differenceInDays(today, evalDate)
              let reevalColorClass = ''
              let reevalDotClass = ''
              let isPulsing = false

              if (daysSinceEval <= 29) {
                reevalColorClass = 'text-green-600 dark:text-green-400'
                reevalDotClass = 'bg-green-600 dark:bg-green-400'
              } else if (daysSinceEval <= 59) {
                reevalColorClass = 'text-orange-600 dark:text-orange-400'
                reevalDotClass = 'bg-orange-600 dark:bg-orange-400'
              } else if (daysSinceEval <= 90) {
                reevalColorClass = 'text-red-600 dark:text-red-400'
                reevalDotClass = 'bg-red-600 dark:bg-red-400'
              } else {
                reevalColorClass = 'text-red-600 dark:text-red-400 font-bold'
                reevalDotClass = 'bg-red-600 dark:bg-red-400'
                isPulsing = true
              }

              const linkItems = [
                {
                  type: 'internal',
                  url: `/evaluation/${ev.id}`,
                  icon: FileText,
                  label: 'Anamnese',
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
                <TableRow key={ev.id} className="hover:bg-muted/20">
                  <TableCell className="font-medium">{ev.nome_cliente}</TableCell>
                  <TableCell>{format(evalDate, 'dd/MM/yyyy')}</TableCell>
                  <TableCell>
                    <div
                      className={cn(
                        'flex items-center gap-2',
                        reevalColorClass,
                        isPulsing && 'animate-pulse',
                      )}
                    >
                      <span className={cn('w-2 h-2 rounded-full', reevalDotClass)} />
                      <span>
                        {ev.data_reavaliacao
                          ? format(new Date(ev.data_reavaliacao + 'T00:00:00'), 'dd/MM/yyyy')
                          : '-'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{ev.periodo_treino || '-'}</TableCell>
                  <TableCell>
                    <Select
                      value={ev.status || 'pendente'}
                      onValueChange={(val) => handleStatusChange(ev.id, val)}
                    >
                      <SelectTrigger
                        className={cn(
                          'w-[140px] h-8 text-xs font-semibold',
                          (!ev.status || ev.status === 'pendente') &&
                            'border-slate-300 text-slate-600 bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:bg-slate-800/50',
                          ev.status === 'em_progresso' &&
                            'border-blue-300 text-blue-700 bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:bg-blue-950/50',
                          ev.status === 'concluido' &&
                            'border-green-300 text-green-700 bg-green-50 dark:border-green-800 dark:text-green-400 dark:bg-green-950/50',
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
                  <TableCell>
                    <div className="flex items-center gap-2 font-medium">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${isLate ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}
                      />
                      {format(deadline, 'dd/MM/yyyy')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs px-2"
                      onClick={() => setAcompanhamentoEval({ id: ev.id, nome: ev.nome_cliente })}
                    >
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Anotações
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {linkItems.map((item, idx) => {
                        const Icon = item.icon
                        if (item.url) {
                          return (
                            <Tooltip key={idx}>
                              <TooltipTrigger asChild>
                                {item.type === 'internal' ? (
                                  <Link
                                    to={item.url}
                                    className="p-1.5 hover:bg-accent rounded-md transition-colors text-primary"
                                  >
                                    <Icon className="w-4 h-4" />
                                  </Link>
                                ) : (
                                  <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1.5 hover:bg-accent rounded-md transition-colors text-primary"
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
      />
    </div>
  )
}
