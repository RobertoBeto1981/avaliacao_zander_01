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
              <TableHead>Link do Vídeo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Enviado Em</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scheduledVideos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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
                      {video.avaliacoes?.nome_cliente || 'Avaliação Removida'}
                    </TableCell>
                    <TableCell>{video.dias_apos_avaliacao} Dias</TableCell>
                    <TableCell>{dataEstimada ? format(dataEstimada, 'dd/MM/yyyy') : '-'}</TableCell>
                    <TableCell>
                      {video.url_google_drive ? (
                        <a
                          href={video.url_google_drive}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline max-w-[200px] truncate block"
                        >
                          Ver Vídeo
                        </a>
                      ) : (
                        '-'
                      )}
                    </TableCell>
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
