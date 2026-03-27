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
import { PlayCircle, MessageCircle, CheckCircle2, ListTodo, Send } from 'lucide-react'
import { getPendingVideosForToday, logVideoSent } from '@/services/videos'
import { useToast } from '@/hooks/use-toast'

export function TodayQueueTab() {
  const { toast } = useToast()
  const [queue, setQueue] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processedKeys, setProcessedKeys] = useState<Set<string>>(new Set())
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    fetchQueue()
  }, [])

  const fetchQueue = async () => {
    try {
      setLoading(true)
      const data = await getPendingVideosForToday()
      setQueue(data)
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
      message = message.replace(/\{\{link_video\}\}/g, item.config.video_url || '')

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
                              href={item.config.video_url}
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
    </div>
  )
}
