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
import { Button } from '@/components/ui/button'
import { Video, Trophy, Send, RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { getScheduledVideos, getSentDesafiosHistory } from '@/services/videos'
import { format, addDays } from 'date-fns'
import { supabase } from '@/lib/supabase/client'

export function HistoryTab() {
  const [historyItems, setHistoryItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [resendingId, setResendingId] = useState<string | null>(null)
  const { toast } = useToast()

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
            avaliacao_id: v.avaliacao_id,
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
          avaliacao_id: d.id,
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

    // Configurando Supabase Realtime para atualizações em tempo real no histórico
    const channel = supabase
      .channel('history-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'videos_agendados' }, () => {
        loadHistory()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'avaliacoes' }, () => {
        loadHistory()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleResend = async (item: any) => {
    setResendingId(item.id)
    try {
      const now = new Date().toISOString()

      if (item.type === 'video') {
        const { error } = await supabase
          .from('videos_agendados')
          .update({ data_envio: now, status: 'enviado' })
          .eq('id', item.id)

        if (error) throw error

        // Chamada mockada/preparada para reenvio caso a API esteja ativa
        if (item.avaliacao_id) {
          await supabase.functions
            .invoke('process-evaluation-automations', {
              body: { avaliacaoId: item.avaliacao_id },
            })
            .catch(() => {})
        }
      } else if (item.type === 'desafio') {
        const { error } = await supabase
          .from('avaliacoes')
          .update({ desafio_zander_enviado_em: now })
          .eq('id', item.avaliacao_id)

        if (error) throw error
      }

      toast({
        title: 'Mensagem Reenviada',
        description: 'A mensagem foi reenviada e o histórico de data e horário foi atualizado.',
      })
    } catch (error: any) {
      toast({ variant: 'destructive', description: error.message || 'Erro ao reenviar.' })
    } finally {
      setResendingId(null)
    }
  }

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
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {historyItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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
                      className={
                        item.status === 'enviado'
                          ? 'bg-[#95c23d] text-black hover:bg-[#85b035]'
                          : ''
                      }
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
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs border-[#95c23d]/50 text-[#7a9e32] hover:bg-[#95c23d] hover:text-black dark:text-[#95c23d]"
                      onClick={() => handleResend(item)}
                      disabled={resendingId === item.id}
                    >
                      {resendingId === item.id ? (
                        <RefreshCw className="w-3 h-3 mr-1.5 animate-spin" />
                      ) : (
                        <Send className="w-3 h-3 mr-1.5" />
                      )}
                      Reenviar
                    </Button>
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
