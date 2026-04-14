import { useState, useEffect } from 'react'
import { getNotifications, markAsRead, archiveNotification } from '@/services/notifications'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { MessageSquare, Paperclip, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Link, useLocation } from 'react-router-dom'

export function InternalCommunications() {
  const { profile } = useAuth()
  const { toast } = useToast()
  const location = useLocation()
  const [messages, setMessages] = useState<any[]>([])

  const isCommunicationsPage = location.pathname === '/communications'

  useEffect(() => {
    if (profile?.id) {
      loadMessages()
    }
  }, [profile?.id])

  const loadMessages = async () => {
    try {
      const data = await getNotifications(profile!.id)
      setMessages(data.filter((n: any) => n.type === 'message'))
    } catch (e) {
      console.error(e)
    }
  }

  const handleArchive = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await archiveNotification(id)
      setMessages((prev) => prev.filter((m) => m.id !== id))
      toast({ title: 'Mensagem apagada', description: 'O comunicado foi removido da sua caixa.' })
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível apagar a mensagem.',
      })
    }
  }

  const handleRead = async (id: string, isRead: boolean) => {
    if (!isRead) {
      try {
        await markAsRead(id)
        setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, is_read: true } : m)))
      } catch (e) {
        console.error(e)
      }
    }
  }

  return (
    <Card className="border-border/50 shadow-md animate-fade-in">
      <CardHeader className="border-b border-border/50 bg-muted/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Comunicados Internos
          </CardTitle>
          <CardDescription>
            Acompanhe aqui os recados e arquivos recebidos. Ao abrir uma mensagem, ela é registrada
            como lida automaticamente.
          </CardDescription>
        </div>
        {!isCommunicationsPage && (
          <Button asChild size="sm" className="w-full sm:w-auto font-bold shrink-0">
            <Link to="/communications">
              <MessageSquare className="w-4 h-4 mr-2" />
              Enviar Recado
            </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent className="pt-6">
        {messages.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
            Nenhum comunicado recebido.
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full space-y-4">
            {messages.map((msg) => (
              <AccordionItem key={msg.id} value={msg.id} className="border rounded-lg px-4 bg-card">
                <AccordionTrigger
                  className="hover:no-underline py-4"
                  onClick={() => handleRead(msg.id, msg.is_read)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full pr-4 gap-4">
                    <div className="flex flex-col text-left gap-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-semibold text-base line-clamp-1 ${!msg.is_read ? 'text-foreground' : 'text-muted-foreground'}`}
                        >
                          {msg.title}
                        </span>
                        {!msg.is_read && (
                          <Badge
                            variant="default"
                            className="h-5 px-1.5 py-0 text-[10px] bg-primary hover:bg-primary"
                          >
                            Novo
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(msg.created_at).toLocaleString('pt-BR', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {msg.bulk_messages?.file_url && (
                        <Badge variant="secondary" className="text-xs">
                          <Paperclip className="w-3 h-3 mr-1" /> Anexo
                        </Badge>
                      )}
                      {msg.priority === 'high' && (
                        <Badge variant="destructive" className="text-xs">
                          Urgente
                        </Badge>
                      )}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4 border-t border-border/50">
                  <div className="mb-4 bg-muted/30 p-4 rounded-md border text-sm text-foreground/90 whitespace-pre-wrap">
                    {msg.message}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4">
                    {msg.bulk_messages?.file_url ? (
                      <a
                        href={msg.bulk_messages.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium bg-primary/10 hover:bg-primary/20 transition-colors px-3 py-2 rounded-md border border-primary/20 w-fit"
                      >
                        <Paperclip className="w-4 h-4" />
                        Baixar Anexo: {msg.bulk_messages.file_name || 'Documento'}
                      </a>
                    ) : (
                      <div />
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 w-fit"
                      onClick={(e) => handleArchive(msg.id, e)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Apagar Mensagem
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  )
}
