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
import { Video, Trophy } from 'lucide-react'
import { getScheduledVideos, getSentDesafiosHistory } from '@/services/videos'
import { format, addDays } from 'date-fns'

export function HistoryTab() {
  const [historyItems, setHistoryItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const [videos, desafios] = await Promise.all([
          getScheduledVideos(),
          getSentDesafiosHistory(),
        ])

        const formattedVideos = videos.map((v) => {
          const dataAvaliacao = v.avaliacoes?.data_avaliacao
            ? new Date(v.avaliacoes.data_avaliacao + 'T00:00:00')
            : null
          const dataEstimada = dataAvaliacao ? addDays(dataAvaliacao, v.dias_apos_avaliacao) : null

          return {
            type: 'video',
            id: v.id,
            nome_cliente: v.avaliacoes?.nome_cliente || 'Avaliação Removida',
            evo_id: v.avaliacoes?.evo_id,
            gatilho: `${v.dias_apos_avaliacao} Dias`,
            data_estimada: dataEstimada,
            status: v.status,
            data_envio: v.data_envio,
          }
        })

        const formattedDesafios = desafios.map((d) => ({
          type: 'desafio',
          id: `desafio_${d.id}`,
          nome_cliente: d.nome_cliente,
          evo_id: d.evo_id,
          gatilho: '#DesafioZander',
          data_estimada: d.desafio_zander_enviado_em ? new Date(d.desafio_zander_enviado_em) : null,
          status: 'enviado',
          data_envio: d.desafio_zander_enviado_em,
        }))

        const combined = [...formattedVideos, ...formattedDesafios].sort((a, b) => {
          const dateA = a.data_envio ? new Date(a.data_envio).getTime() : 0
          const dateB = b.data_envio ? new Date(b.data_envio).getTime() : 0
          return dateB - dateA
        })

        setHistoryItems(combined)
      } catch (error) {
        console.error('Erro ao carregar histórico', error)
      } finally {
        setLoading(false)
      }
    }

    loadHistory()
  }, [])

  if (loading)
    return <div className="p-8 text-center text-muted-foreground">Carregando histórico...</div>

  return (
    <Card className="border-border/50 shadow-md">
      <CardHeader className="bg-muted/10 border-b border-border/50">
        <CardTitle className="text-xl flex items-center gap-2">
          <Video className="w-5 h-5 text-primary" />
          Histórico de Envios Automáticos
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 p-0 overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead>Aluno</TableHead>
              <TableHead>Gatilho</TableHead>
              <TableHead>Data Estimada</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Enviado Em</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {historyItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhum registro de envio encontrado.
                </TableCell>
              </TableRow>
            ) : (
              historyItems.map((item) => (
                <TableRow
                  key={item.id}
                  className={item.type === 'desafio' ? 'bg-orange-50/20 dark:bg-orange-950/10' : ''}
                >
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
                    {item.type === 'desafio' ? (
                      <Badge
                        variant="outline"
                        className="bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800 shadow-sm font-semibold whitespace-nowrap"
                      >
                        <Trophy className="w-3 h-3 mr-1.5" /> #DesafioZander
                      </Badge>
                    ) : (
                      <span className="font-medium">{item.gatilho}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.data_estimada ? format(item.data_estimada, 'dd/MM/yyyy') : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        item.status === 'enviado'
                          ? 'default'
                          : item.status === 'erro'
                            ? 'destructive'
                            : 'secondary'
                      }
                      className={item.status === 'enviado' ? 'bg-green-500 hover:bg-green-600' : ''}
                    >
                      {item.status === 'enviado'
                        ? 'Enviado'
                        : item.status === 'erro'
                          ? 'Erro'
                          : 'Pendente'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {item.data_envio ? format(new Date(item.data_envio), 'dd/MM/yyyy HH:mm') : '-'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
