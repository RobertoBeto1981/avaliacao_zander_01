import { useEffect, useState, useMemo } from 'react'
import { getEvaluations, deleteEvaluation } from '@/services/evaluations'
import { getUsers } from '@/services/users'
import { supabase } from '@/lib/supabase/client'
import { isAfter, startOfDay, differenceInDays } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Clock, Activity, CheckCircle2, Search, FilePlus2 } from 'lucide-react'
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
import { DashboardCharts } from '@/components/coordinator/DashboardCharts'
import { DashboardTable } from '@/components/coordinator/DashboardTable'
import { UserManagementTab } from '@/components/coordinator/UserManagementTab'
import { RoleViewTab } from '@/components/coordinator/RoleViewTab'
import { useToast } from '@/hooks/use-toast'
import { Link } from 'react-router-dom'

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

      const allUsers = await getUsers()
      setUsers(allUsers || [])
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Erro ao carregar dados', description: e.message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()

    // Real-time subscription
    const channel = supabase
      .channel('avaliacoes_coordinator')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'avaliacoes' }, () =>
        loadData(),
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => loadData())
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

  const professors = useMemo(
    () => Array.from(new Set(evaluations.map((e) => e.professor?.nome).filter(Boolean))).sort(),
    [evaluations],
  )

  const total = filtered.length
  const pendentes = filtered.filter((e) => !e.status || e.status === 'pendente').length
  const emProgresso = filtered.filter((e) => e.status === 'em_progresso').length
  const concluidos = filtered.filter((e) => e.status === 'concluido').length

  const pendingUsersCount = users.filter((u) => u.pending_role).length

  const handleDeleteEvaluation = async (id: string) => {
    if (
      !confirm(
        'Atenção: Tem certeza que deseja excluir esta avaliação? Esta ação não pode ser desfeita e todo o histórico será perdido.',
      )
    )
      return
    try {
      await deleteEvaluation(id)
      toast({ title: 'Excluído', description: 'Avaliação removida com sucesso.' })
      loadData()
    } catch (e: any) {
      toast({ variant: 'destructive', description: e.message })
    }
  }

  if (loading)
    return <div className="p-8 text-center text-muted-foreground">Carregando painel central...</div>

  return (
    <div className="container mx-auto py-8 animate-fade-in-up max-w-[1400px]">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-primary/20 p-4 rounded-xl text-primary">
          <Activity className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Painel do Coordenador</h1>
          <p className="text-muted-foreground text-lg">
            Gestão centralizada de clientes, equipe e acompanhamento geral.
          </p>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 w-full max-w-3xl grid grid-cols-2 md:grid-cols-4 h-auto rounded-lg">
          <TabsTrigger value="dashboard" className="py-2.5">
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="clients" className="py-2.5">
            Gestão de Clientes
          </TabsTrigger>
          <TabsTrigger value="team" className="relative py-2.5">
            Gestão de Equipe
            {pendingUsersCount > 0 && (
              <span className="absolute top-2 right-2 flex h-2.5 w-2.5 rounded-full bg-red-500 shadow-sm animate-pulse"></span>
            )}
          </TabsTrigger>
          <TabsTrigger value="role-view" className="py-2.5">
            Visão de Cargo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="m-0 space-y-8 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
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
            <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
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
            <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
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
            <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
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

          <DashboardCharts data={filtered} />
        </TabsContent>

        <TabsContent value="clients" className="m-0 space-y-4 animate-fade-in">
          <Card className="border-border/50 shadow-sm bg-muted/10">
            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
              <div className="space-y-1.5 lg:col-span-1">
                <Label className="text-xs font-semibold uppercase tracking-wider">
                  Busca por Aluno
                </Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Nome do cliente..."
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    className="pl-9 h-10"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider">Professor</Label>
                <Select value={profFilter} onValueChange={setProfFilter}>
                  <SelectTrigger className="h-10">
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
                <Label className="text-xs font-semibold uppercase tracking-wider">Treino</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-10">
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
                <Label className="text-xs font-semibold uppercase tracking-wider">
                  Reavaliação
                </Label>
                <Select value={reavFilter} onValueChange={setReavFilter}>
                  <SelectTrigger className="h-10">
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
                <Label className="text-xs font-semibold uppercase tracking-wider">
                  Data Início
                </Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider">Data Fim</Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-10"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end pt-2 pb-2">
            <Button asChild size="lg" className="font-bold">
              <Link to="/evaluation/new">
                <FilePlus2 className="w-5 h-5 mr-2" /> Nova Avaliação
              </Link>
            </Button>
          </div>

          <DashboardTable data={filtered} onDelete={handleDeleteEvaluation} />
        </TabsContent>

        <TabsContent value="team" className="m-0">
          <UserManagementTab users={users} onUpdate={loadData} />
        </TabsContent>

        <TabsContent value="role-view" className="m-0">
          <RoleViewTab users={users} evaluations={evaluations} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
