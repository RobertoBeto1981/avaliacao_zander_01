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
import { Video } from 'lucide-react'
import { getScheduledVideos } from '@/services/videos'
import { format, addDays } from 'date-fns'

export function HistoryTab() {
  const [scheduledVideos, setScheduledVideos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getScheduledVideos()
      .then(setScheduledVideos)
      .finally(() => setLoading(false))
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
            {scheduledVideos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhum registro de envio encontrado.
                </TableCell>
              </TableRow>
            ) : (
              scheduledVideos.map((video) => {
                const dataAvaliacao = video.avaliacoes?.data_avaliacao
                  ? new Date(video.avaliacoes.data_avaliacao + 'T00:00:00')
                  : null
                const dataEstimada = dataAvaliacao
                  ? addDays(dataAvaliacao, video.dias_apos_avaliacao)
                  : null

                return (
                  <TableRow key={video.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col gap-1.5 items-start">
                        <span>{video.avaliacoes?.nome_cliente || 'Avaliação Removida'}</span>
                        {video.avaliacoes?.evo_id && (
                          <Badge
                            variant="outline"
                            className="w-fit text-[10px] px-1.5 py-0.5 border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-400"
                          >
                            EVO: {video.avaliacoes.evo_id}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{video.dias_apos_avaliacao} Dias</TableCell>
                    <TableCell>{dataEstimada ? format(dataEstimada, 'dd/MM/yyyy') : '-'}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          video.status === 'enviado'
                            ? 'default'
                            : video.status === 'erro'
                              ? 'destructive'
                              : 'secondary'
                        }
                        className={
                          video.status === 'enviado' ? 'bg-green-500 hover:bg-green-600' : ''
                        }
                      >
                        {video.status === 'enviado'
                          ? 'Enviado'
                          : video.status === 'erro'
                            ? 'Erro'
                            : 'Pendente'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {video.data_envio
                        ? format(new Date(video.data_envio), 'dd/MM/yyyy HH:mm')
                        : '-'}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
