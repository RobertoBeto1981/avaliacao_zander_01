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
import { getScheduledVideos, getSentDesafiosHistory, getVideoConfigs } from '@/services/videos'
import { format, addDays } from 'date-fns'
import { supabase } from '@/lib/supabase/client'

export function HistoryTab() {
  const [historyItems, setHistoryItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [resendingId, setResendingId] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [gatilhoFilter, setGatilhoFilter] = useState('todos')
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
            telefone: v.avaliacoes?.telefone_cliente,
            dias_apos_avaliacao: v.dias_apos_avaliacao,
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
          telefone: d.telefone_cliente,
          evo_id: d.evo_id,
          gatilho: '#DesafioZander',
          data_estimada: d.desafio_zander_enviado_em ? new Date(d.desafio_zander_enviado_em) : null,
          status: 'enviado',
          data_envio: d.desafio_zander_enviado_em,
        }))

        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        const thirtyDaysAgoTime = thirtyDaysAgo.getTime()

        const combined = [...formattedVideos, ...formattedDesafios]
          .filter((item) => item.status !== 'pendente') // Histórico shows only non-pending
          .filter((item) => {
            if (!item.data_envio) return false
            return new Date(item.data_envio).getTime() >= thirtyDaysAgoTime
          })
          .sort((a, b) => {
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
      if (!item.telefone) {
        throw new Error('Cliente sem telefone cadastrado.')
      }

      const phone = item.telefone.replace(/\D/g, '')
      const firstName = item.nome_cliente.trim().split(' ')[0]
      let waLink = ''

      if (item.type === 'video') {
        const configs = await getVideoConfigs()
        const config = configs.find((c) => c.dias_trigger === item.dias_apos_avaliacao)

        if (!config) {
          throw new Error('Configuração de gatilho não encontrada.')
        }

        const msgTpl = config.message_template || 'Olá {{nome}}, tudo bem?'
        const videoUrl = config.video_url || ''

        const message = msgTpl.replace(/{{nome}}/g, firstName).replace(/{{link_video}}/g, videoUrl)

        if (videoUrl) {
          navigator.clipboard.writeText(videoUrl).catch(() => {})
          toast({
            title: 'Vídeo copiado!',
            description: 'O link do vídeo foi copiado. Cole no WhatsApp se necessário.',
          })
        }

        waLink = `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`

        window.open(waLink, '_blank')

        const now = new Date().toISOString()
        const { error } = await supabase
          .from('videos_agendados')
          .update({ data_envio: now, status: 'enviado' })
          .eq('id', item.id)

        if (error) throw error
      } else if (item.type === 'desafio') {
        const now = new Date().toISOString()
        const { error } = await supabase
          .from('avaliacoes')
          .update({ desafio_zander_enviado_em: now })
          .eq('id', item.avaliacao_id)

        if (error) throw error

        waLink = `https://wa.me/55${phone}?text=${encodeURIComponent(`Olá ${firstName}, reenvio do #DesafioZander!`)}`
        window.open(waLink, '_blank')
      }

      toast({
        title: 'WhatsApp Aberto',
        description: 'A janela do WhatsApp foi aberta e o histórico foi atualizado.',
      })
    } catch (error: any) {
      toast({ variant: 'destructive', description: error.message || 'Erro ao reenviar.' })
    } finally {
      setResendingId(null)
    }
  }

  const filteredItems = historyItems.filter((item) => {
    const matchSearch =
      item.nome_cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.evo_id && item.evo_id.includes(searchTerm))
    const matchStatus = statusFilter === 'todos' || item.status === statusFilter
    const matchGatilho =
      gatilhoFilter === 'todos' || item.dias_apos_avaliacao?.toString() === gatilhoFilter
    return matchSearch && matchStatus && matchGatilho
  })

  if (loading)
    return <div className="p-8 text-center text-muted-foreground">Carregando histórico...</div>

  return (
    <div className="space-y-4">
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
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="todos">Todos Status</option>
          <option value="enviado">Enviados</option>
          <option value="erro">Com Erro</option>
        </select>
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
            <Video className="w-5 h-5 text-primary" />
            Histórico de Envios
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
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum registro encontrado com os filtros atuais.
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow
                    key={item.id}
                    className={
                      item.type === 'desafio' ? 'bg-orange-50/20 dark:bg-orange-950/10' : ''
                    }
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
                      {item.data_envio
                        ? format(new Date(item.data_envio), 'dd/MM/yyyy HH:mm')
                        : '-'}
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
    </div>
  )
}
