import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
import { PlayCircle, MessageCircle, CheckCircle2, ListTodo, Send, Trophy } from 'lucide-react'
import { getPendingVideosForToday, logVideoSent } from '@/services/videos'
import { getPendingDesafioZander, markDesafioZanderSent } from '@/services/evaluations'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'

const getFullVideoUrl = (url: string | null | undefined) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  return url.startsWith('/')
    ? `${supabaseUrl}/storage/v1/object/public${url}`
    : `${supabaseUrl}/storage/v1/object/public/${url}`
}

export function TodayQueueTab() {
  const { toast } = useToast()
  const [queue, setQueue] = useState<any[]>([])
  const [desafioQueue, setDesafioQueue] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processedKeys, setProcessedKeys] = useState<Set<string>>(new Set())
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    fetchQueue()

    // Configurando Supabase Realtime para atualizações em tempo real na fila
    const channel = supabase
      .channel('queue-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'videos_agendados' }, () => {
        fetchQueue()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'avaliacoes' }, () => {
        fetchQueue()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchQueue = async () => {
    try {
      setLoading(true)
      const [videos, desafios] = await Promise.all([
        getPendingVideosForToday(),
        getPendingDesafioZander(),
      ])
      setQueue(videos)
      setDesafioQueue(desafios)
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar fila',
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async (item: any) => {
    const itemKey = `${item.avaliacao.id}_${item.config.dias_trigger}`
    if (processedKeys.has(itemKey)) return

    try {
      setProcessingId(itemKey)
      let phone = item.avaliacao.telefone_cliente?.replace(/\D/g, '')

      if (!phone) {
        toast({
          variant: 'destructive',
          title: 'Telefone inválido',
          description: `O cliente ${item.avaliacao.nome_cliente} não possui um telefone válido.`,
        })
        setProcessingId(null)
        return
      }

      if (!phone.startsWith('55')) {
        phone = '55' + phone
      }

      const firstName = item.avaliacao.nome_cliente.trim().split(' ')[0]
      let message =
        item.config.message_template || 'Olá {{nome}}, aqui está seu vídeo: {{link_video}}'
      message = message.replace(/\{\{nome\}\}/g, firstName)
      message = message.replace(/\{\{link_video\}\}/g, getFullVideoUrl(item.config.video_url))

      const encodedMsg = encodeURIComponent(message)
      const waUrl = `https://wa.me/${phone}?text=${encodedMsg}`

      // Open WhatsApp Web
      window.open(waUrl, '_blank')

      // Log the action to the database
      await logVideoSent(item.avaliacao.id, item.config.dias_trigger, item.config.video_url)

      // Mark as processed locally
      setProcessedKeys((prev) => new Set(prev).add(itemKey))

      toast({
        title: 'Sucesso',
        description: 'Redirecionado para o WhatsApp e marcado como enviado.',
      })
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao registrar envio',
        description: err.message,
      })
    } finally {
      setProcessingId(null)
    }
  }

  const handleSendNext = () => {
    const nextItem = queue.find(
      (q) => !processedKeys.has(`${q.avaliacao.id}_${q.config.dias_trigger}`),
    )
    if (nextItem) {
      handleSend(nextItem)
    }
  }

  const handleSendDesafio = async (item: any) => {
    try {
      setProcessingId(`desafio_${item.id}`)
      let phone = item.telefone_cliente?.replace(/\D/g, '')

      if (!phone) {
        toast({
          variant: 'destructive',
          title: 'Telefone inválido',
          description: `O cliente ${item.nome_cliente} não possui um telefone válido.`,
        })
        setProcessingId(null)
        return
      }

      if (!phone.startsWith('55')) {
        phone = '55' + phone
      }

      const firstName = item.nome_cliente.trim().split(' ')[0]
      const message = `Fala, ${firstName}! 🚀🔥\n\nQue incrível que você aceitou o *#DesafioZander*! Parabéns pela sua decisão de buscar a sua melhor versão.\n\nO foco agora é total na sua evolução: o professor entrará em contato em breve para alinharmos todos os detalhes e garantirmos que você chegue na sua reavaliação daqui a 30 dias com resultados impressionantes!\n\nVamos pra cima! 💪🏋️‍♂️`

      const encodedMsg = encodeURIComponent(message)
      const waUrl = `https://wa.me/${phone}?text=${encodedMsg}`

      window.open(waUrl, '_blank')

      await markDesafioZanderSent(item.id)

      setDesafioQueue((prev) => prev.filter((d) => d.id !== item.id))

      toast({
        title: 'Sucesso',
        description: 'Redirecionado para o WhatsApp e marcado como enviado.',
      })
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao registrar envio',
        description: err.message,
      })
    } finally {
      setProcessingId(null)
    }
  }

  const handleSendNextDesafio = () => {
    if (desafioQueue.length > 0) {
      handleSendDesafio(desafioQueue[0])
    }
  }

  const pendingCount = queue.filter(
    (q) => !processedKeys.has(`${q.avaliacao.id}_${q.config.dias_trigger}`),
  ).length

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground animate-pulse">
        Buscando fila de envios...
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <Card className="border-border/50 shadow-md">
        <CardHeader className="bg-muted/10 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-primary" />
              Fila de Envios do Dia
            </CardTitle>
            <CardDescription className="mt-1.5">
              Estes são os vídeos agendados para serem disparados hoje.
            </CardDescription>
          </div>
          {pendingCount > 0 && (
            <Button onClick={handleSendNext} className="gap-2 shadow-md w-full sm:w-auto">
              <Send className="w-4 h-4" />
              Processar Próximo ({pendingCount} restantes)
            </Button>
          )}
        </CardHeader>
        <CardContent className="pt-0 p-0 overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Aluno</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Gatilho / Vídeo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {queue.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center text-muted-foreground gap-3">
                      <CheckCircle2 className="w-12 h-12 text-green-500/50" />
                      <p className="text-lg font-medium">Tudo limpo por hoje!</p>
                      <p className="text-sm">Não há nenhum vídeo agendado para ser enviado hoje.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                queue.map((item) => {
                  const itemKey = `${item.avaliacao.id}_${item.config.dias_trigger}`
                  const isProcessed = processedKeys.has(itemKey)
                  const isProcessing = processingId === itemKey

                  return (
                    <TableRow key={itemKey} className={isProcessed ? 'bg-muted/30' : ''}>
                      <TableCell className="font-medium">{item.avaliacao.nome_cliente}</TableCell>
                      <TableCell>
                        {item.avaliacao.telefone_cliente || (
                          <span className="text-red-500 text-xs">Sem telefone</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-medium">
                            {item.config.dias_trigger} Dias pós-avaliação
                          </span>
                          {item.config.video_url && (
                            <a
                              href={getFullVideoUrl(item.config.video_url)}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-blue-600 hover:underline flex items-center gap-1 w-fit"
                            >
                              <PlayCircle className="w-3 h-3" /> Ver Vídeo
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={isProcessed ? 'default' : 'secondary'}
                          className={isProcessed ? 'bg-green-500 hover:bg-green-600' : ''}
                        >
                          {isProcessed ? 'Enviado Hoje' : 'Pendente'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant={isProcessed ? 'outline' : 'default'}
                          size="sm"
                          onClick={() => handleSend(item)}
                          disabled={isProcessed || isProcessing || !item.avaliacao.telefone_cliente}
                          className="gap-2"
                        >
                          {isProcessed ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                              OK
                            </>
                          ) : (
                            <>
                              <MessageCircle className="w-4 h-4" />
                              {isProcessing ? 'Abrindo...' : 'Enviar WA'}
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {desafioQueue.length > 0 && (
        <Card className="border-orange-500/30 shadow-md mt-6 animate-fade-in-up delay-100">
          <CardHeader className="bg-orange-500/10 border-b border-orange-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl flex items-center gap-2 text-orange-700 dark:text-orange-500">
                <Trophy className="w-5 h-5" />
                Fila do #DesafioZander
              </CardTitle>
              <CardDescription className="mt-1.5 text-orange-600/80 dark:text-orange-400/80">
                Alunos que aceitaram o desafio e aguardam a mensagem de boas-vindas.
              </CardDescription>
            </div>
            <Button
              onClick={handleSendNextDesafio}
              className="gap-2 shadow-md w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Send className="w-4 h-4" />
              Processar Próximo ({desafioQueue.length} restantes)
            </Button>
          </CardHeader>
          <CardContent className="pt-0 p-0 overflow-hidden">
            <Table>
              <TableHeader className="bg-orange-500/5 border-b-orange-500/20">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-orange-700/80 dark:text-orange-400/80">
                    Aluno
                  </TableHead>
                  <TableHead className="text-orange-700/80 dark:text-orange-400/80">
                    Contato
                  </TableHead>
                  <TableHead className="text-orange-700/80 dark:text-orange-400/80">
                    Status
                  </TableHead>
                  <TableHead className="text-right text-orange-700/80 dark:text-orange-400/80">
                    Ação
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {desafioQueue.map((item) => (
                  <TableRow
                    key={`desafio_${item.id}`}
                    className="hover:bg-orange-50/50 dark:hover:bg-orange-950/20"
                  >
                    <TableCell className="font-medium text-orange-900 dark:text-orange-200">
                      {item.nome_cliente}
                    </TableCell>
                    <TableCell>
                      {item.telefone_cliente ? (
                        <span className="text-orange-800/80 dark:text-orange-300/80">
                          {item.telefone_cliente}
                        </span>
                      ) : (
                        <span className="text-red-500 text-xs font-semibold">Sem telefone</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800"
                      >
                        Pendente
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        onClick={() => handleSendDesafio(item)}
                        disabled={processingId === `desafio_${item.id}` || !item.telefone_cliente}
                        className="gap-2 bg-orange-600 hover:bg-orange-700 text-white shadow-sm"
                      >
                        <MessageCircle className="w-4 h-4" />
                        {processingId === `desafio_${item.id}` ? 'Abrindo...' : 'Enviar WA'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
