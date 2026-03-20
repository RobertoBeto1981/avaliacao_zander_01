import { useState, useEffect } from 'react'
import { sendBulkMessage, getSentMessagesStats } from '@/services/notifications'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { Send, Users, Megaphone, CheckCheck, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Communications() {
  const { toast } = useToast()
  const [targetRole, setTargetRole] = useState('todos')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [isHighPriority, setIsHighPriority] = useState(false)
  const [sending, setSending] = useState(false)
  const [stats, setStats] = useState<any[]>([])

  const loadStats = async () => {
    try {
      const data = await getSentMessagesStats()
      setStats(data)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    try {
      await sendBulkMessage(targetRole, title, message, isHighPriority ? 'high' : 'normal')
      toast({
        title: 'Sucesso',
        description: 'Mensagem enviada com sucesso para os destinatários.',
      })
      setTitle('')
      setMessage('')
      setIsHighPriority(false)
      loadStats()
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erro ao enviar', description: err.message })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl animate-fade-in-up">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-primary/10 p-4 rounded-xl text-primary">
          <Megaphone className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Central de Comunicados</h1>
          <p className="text-muted-foreground text-lg">
            Envie mensagens, priorize avisos e acompanhe o histórico de leitura
          </p>
        </div>
      </div>

      <Tabs defaultValue="new" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8 h-12">
          <TabsTrigger value="new" className="text-base">
            Novo Comunicado
          </TabsTrigger>
          <TabsTrigger value="history" className="text-base">
            Histórico e Leituras
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new">
          <Card className="border-border/50 shadow-md">
            <CardHeader className="border-b border-border/50 bg-muted/10">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Nova Mensagem
              </CardTitle>
              <CardDescription>
                A notificação aparecerá imediatamente no sistema dos colaboradores selecionados.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSend} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="targetRole" className="text-base">
                    Destinatários
                  </Label>
                  <Select value={targetRole} onValueChange={setTargetRole} required>
                    <SelectTrigger id="targetRole" className="h-12 text-base">
                      <SelectValue placeholder="Selecione o público alvo..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos (Toda a Equipe)</SelectItem>
                      <SelectItem value="professor">Apenas Professores</SelectItem>
                      <SelectItem value="avaliador">Apenas Avaliadores</SelectItem>
                      <SelectItem value="fisioterapeuta">Apenas Fisioterapeutas</SelectItem>
                      <SelectItem value="nutricionista">Apenas Nutricionistas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title" className="text-base">
                    Título do Comunicado
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Reunião Geral nesta Sexta-feira"
                    className="h-12 text-base"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-base">
                    Mensagem
                  </Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Escreva os detalhes do comunicado aqui..."
                    className="min-h-[160px] text-base resize-none"
                    required
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                  <div className="space-y-0.5">
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <AlertTriangle
                        className={cn(
                          'w-4 h-4',
                          isHighPriority ? 'text-red-500' : 'text-muted-foreground',
                        )}
                      />
                      Prioridade Alta (Urgente)
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Fixar no topo das notificações dos usuários com destaque visual especial
                    </p>
                  </div>
                  <Switch checked={isHighPriority} onCheckedChange={setIsHighPriority} />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full font-bold text-lg"
                  disabled={sending}
                >
                  {sending ? (
                    'Enviando...'
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" /> Enviar Comunicado
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card className="border-border/50 shadow-md">
            <CardHeader className="border-b border-border/50 bg-muted/10">
              <CardTitle className="flex items-center gap-2">
                <CheckCheck className="w-5 h-5 text-primary" />
                Histórico de Envios
              </CardTitle>
              <CardDescription>
                Acompanhe as mensagens enviadas e verifique quem já visualizou.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {stats.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  Nenhuma mensagem enviada ainda.
                </div>
              ) : (
                <Accordion type="single" collapsible className="w-full space-y-4">
                  {stats.map((stat) => {
                    const readCount = stat.notifications?.filter((n: any) => n.is_read).length || 0
                    const totalCount = stat.notifications?.length || 0

                    return (
                      <AccordionItem
                        key={stat.id}
                        value={stat.id}
                        className="border rounded-lg px-4 bg-card"
                      >
                        <AccordionTrigger className="hover:no-underline py-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full pr-4 gap-4">
                            <div className="flex flex-col text-left gap-1">
                              <span className="font-semibold text-base line-clamp-1">
                                {stat.title}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(stat.created_at).toLocaleString('pt-BR', {
                                  dateStyle: 'short',
                                  timeStyle: 'short',
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              {stat.priority === 'high' && (
                                <Badge variant="destructive" className="text-xs">
                                  Urgente
                                </Badge>
                              )}
                              <Badge variant="outline" className="capitalize text-xs">
                                {stat.target_role}
                              </Badge>
                              <div className="flex items-center gap-1.5 text-sm font-medium bg-muted px-2 py-1 rounded-md">
                                <CheckCheck className="w-4 h-4 text-green-500" />
                                {readCount}/{totalCount}
                              </div>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-2 pb-4 border-t border-border/50">
                          <div className="mb-6 bg-muted/30 p-4 rounded-md border text-sm text-foreground/90 whitespace-pre-wrap">
                            {stat.message}
                          </div>
                          <h4 className="font-semibold text-sm mb-3">Confirmações de Leitura:</h4>
                          {totalCount === 0 ? (
                            <p className="text-sm text-muted-foreground">
                              Nenhum destinatário encontrado para esta mensagem.
                            </p>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {stat.notifications?.map((notif: any) => (
                                <div
                                  key={notif.id}
                                  className="flex items-center justify-between p-2.5 rounded-md border bg-background/50"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <Avatar className="h-7 w-7 border">
                                      <AvatarImage
                                        src={notif.users?.foto_url}
                                        className="object-cover"
                                      />
                                      <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                        {notif.users?.nome?.substring(0, 2).toUpperCase() || 'UN'}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span
                                      className="text-sm font-medium truncate"
                                      title={notif.users?.nome}
                                    >
                                      {notif.users?.nome || 'Usuário'}
                                    </span>
                                  </div>
                                  {notif.is_read ? (
                                    <Badge
                                      variant="default"
                                      className="bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20 text-[10px]"
                                    >
                                      Lido
                                    </Badge>
                                  ) : (
                                    <Badge
                                      variant="secondary"
                                      className="text-[10px] text-muted-foreground"
                                    >
                                      Pendente
                                    </Badge>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    )
                  })}
                </Accordion>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
