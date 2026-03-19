import { useEffect, useState, useMemo } from 'react'
import { format, isAfter, startOfDay } from 'date-fns'
import { FileText, HeartPulse, Activity, Scale, Target, CheckCircle } from 'lucide-react'
import { getEvaluations, updateEvaluationStatus } from '@/services/evaluations'
import { calculateDeadline } from '@/lib/holidays'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
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

export default function ProfessorDashboard() {
  const [evaluations, setEvaluations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [periodoFilter, setPeriodoFilter] = useState<string>('all')
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

  const handleComplete = async (id: string) => {
    try {
      await updateEvaluationStatus(id, 'concluido')
      setEvaluations((prev) =>
        prev.map((ev) => (ev.id === id ? { ...ev, status: 'concluido' } : ev)),
      )
      toast({ title: 'Sucesso', description: 'Status atualizado para Concluído.' })
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

  if (loading) return <div className="p-8 text-center text-muted-foreground">Carregando...</div>

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Painel do Professor</h1>

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
              <TableHead>Período de Treino</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Prazo para Treino</TableHead>
              <TableHead>Links</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((ev) => {
              const deadline = calculateDeadline(ev.data_avaliacao, 3)
              const today = startOfDay(new Date())
              const isLate = isAfter(today, deadline) && ev.status !== 'concluido'
              const links = ev.links_avaliacao?.[0] || {}

              const linkItems = [
                { url: links.anamnese_url, icon: FileText, label: 'Anamnese' },
                {
                  url: links.mapeamento_sintomas_url,
                  icon: HeartPulse,
                  label: 'Mapeamento Sintomas',
                },
                { url: links.mapeamento_dor_url, icon: Activity, label: 'Mapeamento da Dor' },
                { url: links.bia_url, icon: Scale, label: 'BIA' },
                { url: links.my_score_url, icon: Target, label: 'My Score' },
              ]

              return (
                <TableRow key={ev.id} className="hover:bg-muted/20">
                  <TableCell className="font-medium">{ev.nome_cliente}</TableCell>
                  <TableCell>
                    {format(new Date(ev.data_avaliacao + 'T00:00:00'), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>{ev.periodo_treino || '-'}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        ev.status === 'concluido'
                          ? 'default'
                          : ev.status === 'em_progresso'
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {ev.status === 'em_progresso'
                        ? 'Em Progresso'
                        : ev.status === 'concluido'
                          ? 'Concluído'
                          : 'Pendente'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 font-medium">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${isLate ? 'bg-red-500' : 'bg-green-500'}`}
                      />
                      {format(deadline, 'dd/MM/yyyy')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {linkItems.map((item, idx) => {
                        const Icon = item.icon
                        return item.url ? (
                          <Tooltip key={idx}>
                            <TooltipTrigger asChild>
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 hover:bg-accent rounded-md text-primary transition-colors"
                              >
                                <Icon className="w-4 h-4" />
                              </a>
                            </TooltipTrigger>
                            <TooltipContent>{item.label}</TooltipContent>
                          </Tooltip>
                        ) : (
                          <div key={idx} className="p-1.5 opacity-20 cursor-not-allowed">
                            <Icon className="w-4 h-4" />
                          </div>
                        )
                      })}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {ev.status !== 'concluido' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleComplete(ev.id)}
                        className="hover:bg-green-500 hover:text-white transition-colors"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" /> Concluir
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Nenhuma avaliação encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
