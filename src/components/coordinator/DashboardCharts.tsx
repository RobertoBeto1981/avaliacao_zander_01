import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { BarChart3, PieChart as PieChartIcon } from 'lucide-react'

export function DashboardCharts({ data }: { data: any[] }) {
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
    pendente: { label: 'Pendente', color: '#f59e0b' }, // Amber
    em_progresso: { label: 'Em Progresso', color: '#3b82f6' }, // Blue
    concluido: { label: 'Concluído', color: '#10b981' }, // Emerald
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <Card className="lg:col-span-2 border-border/50 shadow-sm">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg">Distribuição por Professor</CardTitle>
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
                <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Card className="lg:col-span-1 border-border/50 shadow-sm">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <PieChartIcon className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg">Proporção de Status</CardTitle>
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
  )
}
