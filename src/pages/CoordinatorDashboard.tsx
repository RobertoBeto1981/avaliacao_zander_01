import { useEffect, useState, useMemo } from 'react'
import { getEvaluations } from '@/services/evaluations'
import { supabase } from '@/lib/supabase/client'
import { isAfter, startOfDay, differenceInDays } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Clock, Activity, CheckCircle2, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DashboardCharts } from '@/components/coordinator/DashboardCharts'
import { DashboardTable } from '@/components/coordinator/DashboardTable'
import { useToast } from '@/hooks/use-toast'

export default function CoordinatorDashboard() {
  const [evaluations, setEvaluations] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Filters state
  const [profFilter, setProfFilter] = useState('all')
  const [periodFilter, setPeriodFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [reavFilter, setReavFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [searchName, setSearchName] = useState('')

  const loadData = async () => {
    try {
      const evals = await getEvaluations()
      setEvaluations(evals)

      const { data: usersData } = await supabase
        .from('users')
        .select('*')
        .not('pending_role', 'is', null)
      setUsers(usersData || [])
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Erro ao carregar dados', description: e.message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()

    // Real-time subscription to avaliacoes table
    const channel = supabase
      .channel('avaliacoes_coordinator')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'avaliacoes' }, () => {
        loadData()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        loadData()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const filtered = useMemo(() => {
    return evaluations.filter((ev) => {
      const matchProf = profFilter === 'all' || ev.professor?.nome === profFilter
      const matchPeriod = periodFilter === 'all' || ev.periodo_treino === periodFilter
      const matchStatus = statusFilter === 'all' || (ev.status || 'pendente') === statusFilter
      const matchName =
        !searchName || ev.nome_cliente.toLowerCase().includes(searchName.toLowerCase())

      let matchDate = true
      if (dateFrom || dateTo) {
        if (ev.is_pre_avaliacao) {
          matchDate = false
        } else {
          const evDate = new Date(ev.data_avaliacao + 'T00:00:00')
          const from = dateFrom ? new Date(dateFrom + 'T00:00:00') : new Date('2000-01-01')
          const to = dateTo ? new Date(dateTo + 'T23:59:59') : new Date('2100-01-01')
          matchDate = evDate >= from && evDate <= to
        }
      }

      let matchReav = true
      if (reavFilter !== 'all') {
        if (ev.is_pre_avaliacao) {
          matchReav = false
        } else {
          const today = startOfDay(new Date())
          const reavDate = new Date(ev.data_reavaliacao + 'T00:00:00')
          if (reavFilter === 'vencidas') {
            matchReav = isAfter(today, reavDate)
          } else if (reavFilter === 'proximas') {
            const diff = differenceInDays(reavDate, today)
            matchReav = diff >= 0 && diff <= 30
          }
        }
      }

      return matchProf && matchPeriod && matchStatus && matchDate && matchName && matchReav
    })
  }, [
    evaluations,
    profFilter,
    periodFilter,
    statusFilter,
    dateFrom,
    dateTo,
    searchName,
    reavFilter,
  ])

  // Filter options
  const professors = useMemo(
    () => Array.from(new Set(evaluations.map((e) => e.professor?.nome).filter(Boolean))).sort(),
    [evaluations],
  )
  const periods = useMemo(
    () => Array.from(new Set(evaluations.map((e) => e.periodo_treino).filter(Boolean))).sort(),
    [evaluations],
  )

  // KPI calculations
  const total = filtered.length
  const pendentes = filtered.filter((e) => !e.status || e.status === 'pendente').length
  const emProgresso = filtered.filter((e) => e.status === 'em_progresso').length
  const concluidos = filtered.filter((e) => e.status === 'concluido').length

  const approveRole = async (userId: string, newRole: string) => {
    try {
      await supabase.from('users').update({ role: newRole, pending_role: null }).eq('id', userId)
      toast({ title: 'Sucesso', description: 'Cargo atualizado com sucesso.' })
      setUsers(users.filter((u) => u.id !== userId))
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Erro', description: e.message })
    }
  }

  const rejectRole = async (userId: string) => {
    try {
      await supabase.from('users').update({ pending_role: null }).eq('id', userId)
      toast({ title: 'Sucesso', description: 'Solicitação rejeitada.' })
      setUsers(users.filter((u) => u.id !== userId))
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Erro', description: e.message })
    }
  }

  if (loading)
    return <div className="p-8 text-center text-muted-foreground">Carregando dashboard...</div>

  return (
    <div className="container mx-auto py-8 animate-fade-in-up">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-primary/10 p-4 rounded-xl text-primary">
          <Activity className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Gerencial</h1>
          <p className="text-muted-foreground">
            Visão estratégica em tempo real da equipe e das avaliações
          </p>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 w-full max-w-md grid grid-cols-2">
          <TabsTrigger value="dashboard">Visão Geral</TabsTrigger>
          <TabsTrigger value="approvals" className="relative">
            Aprovações de Equipe
            {users.length > 0 && (
              <span className="absolute top-1 right-2 flex h-2.5 w-2.5 rounded-full bg-red-500 shadow-sm animate-pulse"></span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="m-0 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Avaliações
                </CardTitle>
                <Users className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{total}</div>
              </CardContent>
            </Card>
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Treinos Pendentes
                </CardTitle>
                <Clock className="w-4 h-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-500">{pendentes}</div>
              </CardContent>
            </Card>
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Em Progresso
                </CardTitle>
                <Activity className="w-4 h-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-500">{emProgresso}</div>
              </CardContent>
            </Card>
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Concluídos
                </CardTitle>
                <CheckCircle2 className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{concluidos}</div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/50 shadow-sm bg-muted/20">
            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
              <div className="space-y-1.5 lg:col-span-1">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Busca por Aluno
                </Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Nome do cliente..."
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Professor
                </Label>
                <Select value={profFilter} onValueChange={setProfFilter}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {professors.map((p: any) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Treino
                </Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="em_progresso">Em Progresso</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Reavaliação
                </Label>
                <Select value={reavFilter} onValueChange={setReavFilter}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="vencidas">Vencidas</SelectItem>
                    <SelectItem value="proximas">Próximas (30 dias)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Data Início
                </Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Data Fim
                </Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-9"
                />
              </div>
            </CardContent>
          </Card>

          <DashboardCharts data={filtered} />
          <DashboardTable data={filtered} />
        </TabsContent>

        <TabsContent value="approvals" className="m-0">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>Solicitações de Mudança de Cargo</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Colaborador</TableHead>
                    <TableHead>Cargo Atual</TableHead>
                    <TableHead>Cargo Solicitado</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        Nenhuma solicitação pendente no momento.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.nome}</TableCell>
                        <TableCell className="capitalize text-muted-foreground">{u.role}</TableCell>
                        <TableCell className="capitalize font-semibold text-primary">
                          {u.pending_role}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={() => rejectRole(u.id)}>
                              Recusar
                            </Button>
                            <Button size="sm" onClick={() => approveRole(u.id, u.pending_role)}>
                              Aprovar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
