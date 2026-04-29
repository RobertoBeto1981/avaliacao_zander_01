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
import {
  MessageSquare,
  Paperclip,
  Trash2,
  Download,
  Eye,
  FileText,
  Image as ImageIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Link, useLocation } from 'react-router-dom'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export function InternalCommunications() {
  const { profile } = useAuth()
  const { toast } = useToast()
  const location = useLocation()
  const [messages, setMessages] = useState<any[]>([])
  const [viewingFile, setViewingFile] = useState<{
    url: string
    name: string
    type: string
  } | null>(null)

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
                      {msg.priority === 'high' && !msg.is_read && (
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

                  {msg.bulk_messages?.file_url && (
                    <div className="mb-4 p-4 border rounded-md bg-muted/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0">
                          {msg.bulk_messages.file_url.match(/\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i) ||
                          (msg.bulk_messages.file_name || '').match(
                            /\.(jpeg|jpg|gif|png|webp)$/i,
                          ) ? (
                            <ImageIcon className="w-6 h-6" />
                          ) : (
                            <FileText className="w-6 h-6" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-foreground line-clamp-1">
                            {msg.bulk_messages.file_name || 'Documento Anexado'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Clique em Visualizar para abrir sem sair do sistema
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-8"
                          onClick={(e) => {
                            e.stopPropagation()
                            const isImage =
                              msg.bulk_messages.file_url.match(
                                /\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i,
                              ) ||
                              (msg.bulk_messages.file_name || '').match(
                                /\.(jpeg|jpg|gif|png|webp)$/i,
                              )
                            const isPdf =
                              msg.bulk_messages.file_url.match(/\.(pdf)(\?.*)?$/i) ||
                              (msg.bulk_messages.file_name || '').match(/\.(pdf)$/i)
                            setViewingFile({
                              url: msg.bulk_messages.file_url,
                              name: msg.bulk_messages.file_name || 'Anexo',
                              type: isImage ? 'image' : isPdf ? 'pdf' : 'other',
                            })
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Visualizar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8"
                          onClick={(e) => {
                            e.stopPropagation()
                            const downloadUrl = `${msg.bulk_messages.file_url}${msg.bulk_messages.file_url.includes('?') ? '&' : '?'}download=`
                            window.open(downloadUrl, '_blank')
                          }}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4">
                    <div />
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

      <Dialog open={!!viewingFile} onOpenChange={(open) => !open && setViewingFile(null)}>
        <DialogContent className="max-w-4xl w-[95vw] h-[90vh] flex flex-col p-0 overflow-hidden bg-background">
          <DialogHeader className="p-4 border-b shrink-0 flex flex-row items-center justify-between">
            <DialogTitle className="text-base font-semibold truncate pr-4">
              {viewingFile?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden bg-muted/30 relative flex items-center justify-center">
            {viewingFile?.type === 'image' ? (
              <div className="w-full h-full overflow-auto p-4 flex items-center justify-center">
                <img
                  src={viewingFile.url}
                  alt={viewingFile.name}
                  className="max-w-full max-h-full object-contain rounded-md shadow-sm"
                />
              </div>
            ) : viewingFile?.type === 'pdf' ? (
              <iframe
                src={`${viewingFile.url}#toolbar=0`}
                className="w-full h-full border-0"
                title={viewingFile.name}
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <FileText className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">Visualização não disponível</p>
                <p className="text-sm text-muted-foreground mb-6 max-w-md">
                  Este tipo de arquivo não pode ser visualizado diretamente no sistema. Por favor,
                  faça o download para abri-lo em seu computador.
                </p>
                <Button
                  onClick={() => {
                    if (viewingFile) {
                      const downloadUrl = `${viewingFile.url}${viewingFile.url.includes('?') ? '&' : '?'}download=`
                      window.open(downloadUrl, '_blank')
                    }
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Fazer Download
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
