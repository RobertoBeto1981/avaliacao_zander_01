import { useState, useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import {
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Users,
  Target,
  UserMinus,
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function DashboardCharts({ data }: { data: any[] }) {
  const [viewMode, setViewMode] = useState<'performance' | 'classic'>('performance')

  const barData = useMemo(() => {
    const counts: Record<string, number> = {}
    data.forEach((ev) => {
      const p = ev.professor?.nome || 'Sem Professor'
      counts[p] = (counts[p] || 0) + 1
    })
    return Object.entries(counts)
      .map(([prof, count]) => ({ professor: prof, total: count }))
      .sort((a, b) => b.total - a.total)
  }, [data])

  const pieData = useMemo(() => {
    let p = 0,
      e = 0,
      c = 0
    data.forEach((ev) => {
      const s = ev.status || 'pendente'
      if (s === 'pendente') p++
      else if (s === 'em_progresso') e++
      else if (s === 'concluido') c++
    })
    return [
      { status: 'Pendente', count: p, fill: 'var(--color-pendente)' },
      { status: 'Em Progresso', count: e, fill: 'var(--color-em_progresso)' },
      { status: 'Concluído', count: c, fill: 'var(--color-concluido)' },
    ].filter((d) => d.count > 0)
  }, [data])

  const barConfig = {
    total: { label: 'Avaliações/Treinos', color: 'hsl(var(--primary))' },
  }

  const pieConfig = {
    pendente: { label: 'Pendente', color: '#f59e0b' },
    em_progresso: { label: 'Em Progresso', color: '#3b82f6' },
    concluido: { label: 'Concluído', color: '#10b981' },
  }

  const perfData = useMemo(() => {
    let semProf = 0
    let totalComProf = 0
    let concluidoComProf = 0

    const profStats: Record<
      string,
      { nome: string; total: number; concluido: number; pendente: number; emProgresso: number }
    > = {}

    data.forEach((ev) => {
      const isSemProfessor = !ev.professor_id || ev.professor_id === 'unassigned'
      if (isSemProfessor) {
        semProf++
      } else {
        totalComProf++
        const pName = ev.professor?.nome || 'Desconhecido'
        const s = ev.status || 'pendente'

        if (s === 'concluido') concluidoComProf++

        if (!profStats[ev.professor_id]) {
          profStats[ev.professor_id] = {
            nome: pName,
            total: 0,
            concluido: 0,
            pendente: 0,
            emProgresso: 0,
          }
        }
        profStats[ev.professor_id].total++

        if (s === 'concluido') profStats[ev.professor_id].concluido++
        else if (s === 'em_progresso') profStats[ev.professor_id].emProgresso++
        else profStats[ev.professor_id].pendente++
      }
    })

    const taxa = totalComProf > 0 ? Math.round((concluidoComProf / totalComProf) * 100) : 0

    const board = Object.values(profStats)
      .map((p) => ({
        ...p,
        taxa: p.total > 0 ? Math.round((p.concluido / p.total) * 100) : 0,
      }))
      .sort((a, b) => b.taxa - a.taxa || b.total - a.total)

    return {
      semProfessor: semProf,
      totalComProfessor: totalComProf,
      concluidoComProfessor: concluidoComProf,
      taxaConversao: taxa,
      leaderboard: board,
    }
  }, [data])

  return (
    <div className="space-y-6 mb-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-muted/30 p-4 rounded-xl border border-border/50 gap-4">
        <div>
          <h3 className="font-bold text-lg">Visão Estratégica do Painel</h3>
          <p className="text-sm text-muted-foreground">
            {viewMode === 'performance'
              ? 'Acompanhamento de performance operacional focado na equipe.'
              : 'Visualização padrão dos dados brutos com todos os alunos.'}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Label
            htmlFor="view-mode"
            className={cn(
              'text-sm cursor-pointer transition-colors',
              viewMode === 'performance' ? 'font-bold text-primary' : 'text-muted-foreground',
            )}
          >
            Performance
          </Label>
          <Switch
            id="view-mode"
            checked={viewMode === 'classic'}
            onCheckedChange={(checked) => setViewMode(checked ? 'classic' : 'performance')}
            className="data-[state=checked]:bg-muted-foreground data-[state=unchecked]:bg-primary"
          />
          <Label
            htmlFor="view-mode"
            className={cn(
              'text-sm cursor-pointer transition-colors',
              viewMode === 'classic' ? 'font-bold text-muted-foreground' : 'text-muted-foreground',
            )}
          >
            Clássico
          </Label>
        </div>
      </div>

      {viewMode === 'performance' ? (
        <div className="space-y-6 animate-fade-in-up">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            <Card className="border-primary/30 bg-primary/5 shadow-sm">
              <CardContent className="p-5 lg:p-6 flex flex-col gap-4 h-full">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/20 text-primary rounded-lg shrink-0">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium leading-none mb-1">
                      Taxa de Conversão
                    </p>
                    <h4 className="text-2xl font-bold text-foreground">
                      {perfData.taxaConversao}%
                    </h4>
                  </div>
                </div>
                <div className="mt-auto space-y-2">
                  <Progress value={perfData.taxaConversao} className="h-2 bg-primary/10" />
                  <p className="text-xs text-muted-foreground">
                    Dos <strong>{perfData.totalComProfessor}</strong> alunos designados,{' '}
                    <strong>{perfData.concluidoComProfessor}</strong> treinos concluídos.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-500/30 bg-amber-500/5 shadow-sm">
              <CardContent className="p-5 lg:p-6 flex flex-col gap-4 h-full">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg shrink-0">
                    <UserMinus className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium leading-none mb-1">
                      Fila de Espera
                    </p>
                    <h4 className="text-2xl font-bold text-foreground">{perfData.semProfessor}</h4>
                  </div>
                </div>
                <div className="mt-auto">
                  <Badge
                    variant="outline"
                    className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 w-fit"
                  >
                    Aguardando professor
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-2">
                    Alunos importados ou novos sem atribuição.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-500/30 bg-blue-500/5 shadow-sm">
              <CardContent className="p-5 lg:p-6 flex flex-col gap-4 h-full">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg shrink-0">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium leading-none mb-1">
                      Volume Operacional
                    </p>
                    <h4 className="text-2xl font-bold text-foreground">
                      {perfData.totalComProfessor}
                    </h4>
                  </div>
                </div>
                <div className="mt-auto">
                  <Badge
                    variant="outline"
                    className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30 w-fit"
                  >
                    Base Ativa
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-2">
                    Total de alunos vinculados à equipe.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/50 shadow-sm overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-muted/10 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Leaderboard da Equipe
              </CardTitle>
              <CardDescription>
                Acompanhe a eficiência de cada professor. O ranking é baseado na taxa de conclusão
                de treinos dos alunos designados.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {perfData.leaderboard.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    Nenhum professor com alunos atribuídos no momento.
                  </div>
                ) : (
                  perfData.leaderboard.map((prof, i) => (
                    <div
                      key={i}
                      className="p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4 hover:bg-muted/5 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="font-bold text-base truncate">{prof.nome}</span>
                          <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                            {prof.total} {prof.total === 1 ? 'aluno' : 'alunos'}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Concluídos:{' '}
                            <span className="text-foreground">{prof.concluido}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div> Em progresso:{' '}
                            <span className="text-foreground">{prof.emProgresso}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-amber-500"></div> Pendentes:{' '}
                            <span className="text-foreground">{prof.pendente}</span>
                          </div>
                        </div>
                      </div>
                      <div className="w-full md:w-72 flex items-center gap-4 shrink-0">
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-1.5 font-bold">
                            <span>Progresso</span>
                            <span
                              className={cn(
                                prof.taxa >= 80
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : prof.taxa >= 50
                                    ? 'text-blue-600 dark:text-blue-400'
                                    : 'text-amber-600 dark:text-amber-400',
                              )}
                            >
                              {prof.taxa}%
                            </span>
                          </div>
                          <Progress
                            value={prof.taxa}
                            className={cn(
                              'h-2.5',
                              prof.taxa >= 80
                                ? '[&>div]:bg-emerald-500'
                                : prof.taxa >= 50
                                  ? '[&>div]:bg-blue-500'
                                  : '[&>div]:bg-amber-500',
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up">
          <Card className="lg:col-span-2 border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Distribuição por Professor (Bruto)</CardTitle>
            </CardHeader>
            <CardContent>
              {barData.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Nenhum dado encontrado.
                </div>
              ) : (
                <ChartContainer config={barConfig} className="h-[300px] w-full">
                  <BarChart data={barData} margin={{ top: 20, right: 20, left: -20, bottom: 20 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="professor"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                      fontSize={12}
                      tickFormatter={(val) => val.split(' ')[0]}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                      fontSize={12}
                      allowDecimals={false}
                    />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      cursor={{ fill: 'hsl(var(--muted))' }}
                    />
                    <Bar
                      dataKey="total"
                      fill="var(--color-total)"
                      radius={[4, 4, 0, 0]}
                      barSize={40}
                    />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-1 border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <PieChartIcon className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Proporção Geral (Bruto)</CardTitle>
            </CardHeader>
            <CardContent>
              {pieData.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Nenhum dado encontrado.
                </div>
              ) : (
                <ChartContainer config={pieConfig} className="h-[300px] w-full">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Pie
                      data={pieData}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} stroke="transparent" />
                      ))}
                    </Pie>
                    <ChartLegend content={<ChartLegendContent />} className="mt-4" />
                  </PieChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
