import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { CalendarClock, AlertCircle } from 'lucide-react'
import { getScheduledVideos } from '@/services/videos'
import { format, addDays } from 'date-fns'
import { supabase } from '@/lib/supabase/client'

export function ProgramadosTab() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState('')
  const [gatilhoFilter, setGatilhoFilter] = useState('todos')

  useEffect(() => {
    const loadItems = async () => {
      try {
        const videos = await getScheduledVideos()

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const formatted = videos
          .filter((v) => v.status === 'pendente' && v.avaliacoes?.data_avaliacao)
          .map((v) => {
            const dataAvaliacao = new Date(v.avaliacoes!.data_avaliacao + 'T00:00:00')
            const dataEstimada = addDays(dataAvaliacao, v.dias_apos_avaliacao)

            return {
              id: v.id,
              avaliacao_id: v.avaliacao_id,
              nome_cliente: v.avaliacoes?.nome_cliente || 'Avaliação Removida',
              telefone: v.avaliacoes?.telefone_cliente,
              dias_apos_avaliacao: v.dias_apos_avaliacao,
              evo_id: v.avaliacoes?.evo_id,
              gatilho: `${v.dias_apos_avaliacao} Dias`,
              data_estimada: dataEstimada,
              status: v.status,
            }
          })
          .filter((v) => v.data_estimada > today) // Exclui vídeos atrasados e os de hoje (centralizados na Fila do Dia)
          .sort((a, b) => {
            const dateA = a.data_estimada.getTime()
            const dateB = b.data_estimada.getTime()
            return dateA - dateB
          })

        setItems(formatted)
      } catch (error) {
        console.error('Erro ao carregar programados', error)
      } finally {
        setLoading(false)
      }
    }

    loadItems()

    const channel = supabase
      .channel('programados-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'videos_agendados' }, () => {
        loadItems()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const filteredItems = items.filter((item) => {
    const matchSearch =
      item.nome_cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.evo_id && item.evo_id.includes(searchTerm))
    const matchGatilho =
      gatilhoFilter === 'todos' || item.dias_apos_avaliacao?.toString() === gatilhoFilter
    return matchSearch && matchGatilho
  })

  if (loading)
    return <div className="p-8 text-center text-muted-foreground">Carregando programados...</div>

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Buscar por nome ou ID EVO..."
            className="w-full h-10 px-3 border rounded-md bg-background text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="h-10 px-3 border rounded-md bg-background text-sm w-full sm:w-[150px]"
          value={gatilhoFilter}
          onChange={(e) => setGatilhoFilter(e.target.value)}
        >
          <option value="todos">Todos Gatilhos</option>
          <option value="1">1 Dia</option>
          <option value="7">7 Dias</option>
          <option value="30">30 Dias</option>
          <option value="60">60 Dias</option>
          <option value="90">90 Dias</option>
        </select>
      </div>

      <Card className="border-border/50 shadow-md">
        <CardHeader className="bg-muted/10 border-b border-border/50">
          <CardTitle className="text-xl flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-primary" />
            Vídeos Programados na Fila
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 p-0 overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Aluno</TableHead>
                <TableHead>Gatilho</TableHead>
                <TableHead>Data Prevista</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Nenhum registro programado encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => {
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col gap-1.5 items-start">
                          <span>{item.nome_cliente}</span>
                          {item.evo_id && (
                            <Badge
                              variant="outline"
                              className="w-fit text-[10px] px-1.5 py-0.5 border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-400"
                            >
                              EVO: {item.evo_id}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{item.gatilho}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{format(item.data_estimada, 'dd/MM/yyyy')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">Na Fila</Badge>
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
