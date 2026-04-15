import { useState, useEffect } from 'react'
import { getSentMessagesStats } from '@/services/notifications'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { format } from 'date-fns'
import { Users, CheckCircle2, Circle, Eye } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

export function SentCommunications() {
  const [stats, setStats] = useState<any[]>([])

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const data = await getSentMessagesStats()
      setStats(data)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <Card className="border-border/50 shadow-md animate-fade-in bg-zinc-900 border-zinc-800">
      <CardHeader className="border-b border-zinc-800/50 pb-4">
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <Eye className="w-5 h-5 text-[#84cc16]" />
          Histórico e Rastreabilidade
        </CardTitle>
        <CardDescription className="text-zinc-400">
          Acompanhe quem recebeu e quem já visualizou os seus comunicados.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {stats.length === 0 ? (
          <div className="text-center py-10 text-zinc-500 border-2 border-dashed border-zinc-800 rounded-lg">
            Nenhum comunicado enviado.
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full space-y-4">
            {stats.map((msg) => {
              const notifications = msg.notifications || []
              const total = notifications.length
              const readCount = notifications.filter((n: any) => n.is_read).length

              return (
                <AccordionItem
                  key={msg.id}
                  value={msg.id}
                  className="border border-zinc-800 rounded-lg px-4 bg-zinc-800/30"
                >
                  <AccordionTrigger className="hover:no-underline py-4 text-white hover:text-white">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full pr-4 gap-4">
                      <div className="flex flex-col text-left gap-1">
                        <span className="font-semibold text-base line-clamp-1">{msg.title}</span>
                        <span className="text-xs text-zinc-400">
                          {format(new Date(msg.created_at), "dd/MM/yyyy 'às' HH:mm")}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <Badge
                          variant="outline"
                          className="flex gap-1.5 items-center bg-zinc-800 text-zinc-300 border-zinc-700"
                        >
                          <Users className="w-3 h-3" />
                          {total} Envios
                        </Badge>
                        <Badge
                          className={`flex gap-1.5 items-center ${readCount === total && total > 0 ? 'bg-[#84cc16] text-zinc-900 hover:bg-[#84cc16]' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-700'}`}
                        >
                          <Eye className="w-3 h-3" />
                          {readCount} Lidos
                        </Badge>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4 border-t border-zinc-800/50 space-y-4">
                    <div className="bg-zinc-950 p-4 rounded-md border border-zinc-800 text-sm text-zinc-300 whitespace-pre-wrap">
                      {msg.message}
                    </div>

                    <div>
                      <h4 className="font-medium text-sm text-zinc-200 mb-3">Status de Leitura:</h4>
                      <ScrollArea className="h-[200px] border border-zinc-800 rounded-md p-2 bg-zinc-900/50">
                        <div className="space-y-1">
                          {notifications.length === 0 ? (
                            <p className="text-sm text-zinc-500 p-2">Nenhum destinatário.</p>
                          ) : (
                            notifications.map((n: any) => (
                              <div
                                key={n.id}
                                className="flex items-center justify-between p-2 hover:bg-zinc-800 rounded-md transition-colors"
                              >
                                <span className="text-sm font-medium text-zinc-300">
                                  {n.users?.nome || 'Usuário Removido'}
                                </span>
                                {n.is_read ? (
                                  <Badge className="bg-[#84cc16] text-zinc-900 hover:bg-[#84cc16] gap-1 text-[10px]">
                                    <CheckCircle2 className="w-3 h-3" /> Visualizou
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="secondary"
                                    className="bg-zinc-800 text-zinc-400 hover:bg-zinc-800 gap-1 text-[10px]"
                                  >
                                    <Circle className="w-3 h-3" /> Não lido
                                  </Badge>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        )}
      </CardContent>
    </Card>
  )
}
