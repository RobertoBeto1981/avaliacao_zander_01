import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import {
  Loader2,
  History,
  Activity,
  UserCheck,
  CheckCircle2,
  MessageSquarePlus,
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getAvaliacaoHistory } from '@/services/history'
import { useToast } from '@/hooks/use-toast'

export function HistoryDialog({
  avaliacaoId,
  nomeCliente,
  evoId,
  open,
  onOpenChange,
}: {
  avaliacaoId: string
  nomeCliente: string
  evoId?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { toast } = useToast()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (open && avaliacaoId) {
      loadData()
    }
  }, [open, avaliacaoId])

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await getAvaliacaoHistory(avaliacaoId)
      setItems(data || [])
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar histórico',
        description: e.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'STATUS_CHANGE':
        return <Activity className="w-4 h-4 text-blue-500" />
      case 'PROFESSOR_ASSIGNED':
        return <UserCheck className="w-4 h-4 text-purple-500" />
      case 'ACOMPANHAMENTO_ADDED':
        return <MessageSquarePlus className="w-4 h-4 text-emerald-500" />
      case 'ACOMPANHAMENTO_TOGGLED':
        return <CheckCircle2 className="w-4 h-4 text-orange-500" />
      default:
        return <History className="w-4 h-4 text-muted-foreground" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] flex flex-col h-[70vh] max-h-[700px]">
        <DialogHeader>
          <DialogTitle className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              <span>Histórico - {nomeCliente}</span>
            </div>
            {evoId && (
              <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-xs px-2 py-0.5 rounded-md font-semibold w-fit">
                ID EVO: {evoId}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0 overflow-hidden mt-4">
          <ScrollArea className="flex-1 pr-4 mb-4">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm flex flex-col items-center gap-3">
                <History className="w-10 h-10 opacity-20" />
                Nenhum evento de auditoria registrado para este cliente ainda.
              </div>
            ) : (
              <div className="relative border-l border-muted-foreground/30 ml-3 space-y-6 pb-4">
                {items.map((item) => (
                  <div key={item.id} className="relative pl-6">
                    <span className="absolute left-[-13px] top-1 p-1 bg-background border shadow-sm rounded-full">
                      {getIcon(item.action_type)}
                    </span>
                    <div className="bg-muted/30 p-3 rounded-lg border border-border/60 hover:bg-muted/50 transition-colors">
                      <p className="text-sm font-medium text-foreground">{item.description}</p>
                      <div className="flex justify-between items-center mt-2.5">
                        <span className="text-xs font-semibold text-muted-foreground">
                          {item.user?.nome || 'Sistema Automático'}
                        </span>
                        <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border/50">
                          {format(new Date(item.created_at), "dd/MM/yy 'às' HH:mm")}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
