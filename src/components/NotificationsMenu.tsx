import { useState, useEffect } from 'react'
import { Bell, Check, BellRing, Archive, Megaphone, Paperclip } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { calculateDeadline } from '@/lib/holidays'
import { isAfter, startOfDay } from 'date-fns'
import { getNotifications, markAsRead } from '@/services/notifications'
import { getPendingAcompanhamentos } from '@/services/acompanhamentos'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

export default function NotificationsMenu({ profile }: { profile: any }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<'active' | 'archived'>('active')
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([])
  const [archivedAlerts, setArchivedAlerts] = useState<string[]>([])

  useEffect(() => {
    if (user) {
      try {
        const savedDismissed = localStorage.getItem(`dismissed_alerts_${user.id}`)
        if (savedDismissed) setDismissedAlerts(JSON.parse(savedDismissed))

        const savedArchived = localStorage.getItem(`archived_alerts_${user.id}`)
        if (savedArchived) setArchivedAlerts(JSON.parse(savedArchived))
      } catch (e) {
        console.error('Error parsing alerts state', e)
      }
    }
  }, [user])

  const loadNotifications = async () => {
    if (!user) return
    try {
      const dbNotifs = await getNotifications(user.id)
      setNotifications(dbNotifs)

      let generatedAlerts: any[] = []

      if (profile?.role === 'professor') {
        const { data: evals } = await supabase
          .from('avaliacoes')
          .select('id, nome_cliente, data_avaliacao, created_at')
          .eq('professor_id', user.id)
          .neq('status', 'concluido')

        if (evals) {
          const today = startOfDay(new Date())
          const lateEvals = evals.filter((ev) => {
            if (!ev.data_avaliacao) return false
            const deadline = calculateDeadline(ev.data_avaliacao, 3)
            return isAfter(today, deadline)
          })

          generatedAlerts = lateEvals.map((ev) => ({
            id: `alert-${ev.id}`,
            title: 'Prazo Expirado!',
            message: `A avaliação de ${ev.nome_cliente} está atrasada para a montagem de treino.`,
            type: 'alert',
            is_read: false,
            is_archived: false,
            created_at: ev.created_at || new Date().toISOString(),
          }))
        }
      }

      const pendingTasks = await getPendingAcompanhamentos()
      const myPendingTasks = pendingTasks.filter((t: any) => t.autor_id === user.id)

      const taskAlerts = myPendingTasks.map((t: any) => {
        const dateFormatted = t.prazo
          ? new Date(t.prazo + 'T12:00:00').toLocaleDateString('pt-BR')
          : 'Sem prazo'

        return {
          id: `task-${t.id}-${t.prazo || 'sem-prazo'}`,
          title: 'Tarefa Pendente!',
          message: `Prazo: ${dateFormatted} - ${t.observacao.substring(0, 40)}${t.observacao.length > 40 ? '...' : ''} (Cliente: ${t.avaliacao?.nome_cliente || 'Desconhecido'})`,
          type: 'alert',
          is_read: false,
          is_archived: false,
          created_at: t.created_at || new Date().toISOString(),
        }
      })

      setAlerts([...generatedAlerts, ...taskAlerts])
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadNotifications()

    const handleUpdate = () => loadNotifications()
    window.addEventListener('acompanhamento_updated', handleUpdate)
    window.addEventListener('avaliacao_updated', handleUpdate)
    window.addEventListener('notifications_updated', handleUpdate)

    if (!user) return

    const channel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev])
          window.dispatchEvent(new CustomEvent('notifications_updated'))
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      window.removeEventListener('acompanhamento_updated', handleUpdate)
      window.removeEventListener('avaliacao_updated', handleUpdate)
      window.removeEventListener('notifications_updated', handleUpdate)
    }
  }, [user, profile])

  useEffect(() => {
    if (open) {
      loadNotifications()
    }
  }, [open])

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()

    if (id.startsWith('alert-') || id.startsWith('task-')) {
      setDismissedAlerts((prev) => {
        if (prev.includes(id)) return prev
        const next = [...prev, id]
        if (user) localStorage.setItem(`dismissed_alerts_${user.id}`, JSON.stringify(next))
        return next
      })
      return
    }

    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))

    try {
      await markAsRead(id)
      window.dispatchEvent(new CustomEvent('notifications_updated'))
    } catch (e) {
      console.error(e)
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: false } : n)))
    }
  }

  const handleArchive = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()

    if (id.startsWith('alert-') || id.startsWith('task-')) {
      if (!dismissedAlerts.includes(id)) {
        handleMarkAsRead(id)
      }
      setArchivedAlerts((prev) => {
        if (prev.includes(id)) return prev
        const next = [...prev, id]
        if (user) localStorage.setItem(`archived_alerts_${user.id}`, JSON.stringify(next))
        return next
      })
      return
    }

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_archived: true, is_read: true } : n)),
    )
    try {
      await supabase.from('notifications').update({ is_archived: true, is_read: true }).eq('id', id)
      window.dispatchEvent(new CustomEvent('notifications_updated'))
    } catch (e) {
      console.error(e)
    }
  }

  const handleArchiveAllRead = async () => {
    if (!user) return
    try {
      // Atualiza a UI imediatamente para melhor responsividade
      setNotifications((prev) => prev.map((n) => (n.is_read ? { ...n, is_archived: true } : n)))

      const readAlertsIds = alerts
        .filter((a) => dismissedAlerts.includes(a.id) && !archivedAlerts.includes(a.id))
        .map((a) => a.id)

      if (readAlertsIds.length > 0) {
        setArchivedAlerts((prev) => {
          const next = Array.from(new Set([...prev, ...readAlertsIds]))
          localStorage.setItem(`archived_alerts_${user.id}`, JSON.stringify(next))
          return next
        })
      }

      await supabase
        .from('notifications')
        .update({ is_archived: true })
        .eq('user_id', user.id)
        .eq('is_read', true)
        .eq('is_archived', false)

      window.dispatchEvent(new CustomEvent('notifications_updated'))
      toast({ title: 'Sucesso', description: 'Notificações lidas foram arquivadas.' })
    } catch (e) {
      console.error(e)
      toast({
        title: 'Erro',
        description: 'Falha ao arquivar notificações.',
        variant: 'destructive',
      })
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!user) return
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))

      const newDismissed = alerts.map((a) => a.id)
      setDismissedAlerts((prev) => {
        const next = Array.from(new Set([...prev, ...newDismissed]))
        localStorage.setItem(`dismissed_alerts_${user.id}`, JSON.stringify(next))
        return next
      })

      window.dispatchEvent(new CustomEvent('notifications_updated'))
      toast({ title: 'Sucesso', description: 'Todas marcadas como lidas.' })
    } catch (e) {
      console.error(e)
    }
  }

  const allItems = [
    ...alerts.map((a) => ({
      ...a,
      is_read: dismissedAlerts.includes(a.id),
      is_archived: archivedAlerts.includes(a.id),
    })),
    ...notifications,
  ]

  const activeItems = allItems
    .filter((n) => !n.is_archived)
    .sort((a, b) => {
      if (a.type === 'alert' && b.type !== 'alert') return -1
      if (b.type === 'alert' && a.type !== 'alert') return 1

      const aHigh = a.priority === 'high' && !a.is_read
      const bHigh = b.priority === 'high' && !b.is_read
      if (aHigh && !bHigh) return -1
      if (bHigh && !aHigh) return 1

      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  const archivedItems = allItems
    .filter((n) => n.is_archived)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const displayItems = view === 'active' ? activeItems : archivedItems
  const unreadCount = activeItems.filter((n) => !n.is_read).length

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 flex h-2.5 w-2.5 rounded-full bg-red-600">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 shadow-lg border-border/50">
        <div className="flex flex-col border-b border-border bg-muted/30">
          <div className="flex items-center justify-between px-4 py-3">
            <h4 className="font-semibold text-sm">Notificações</h4>
            {unreadCount > 0 && view === 'active' && (
              <Badge variant="default" className="text-xs">
                {unreadCount} novas
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 px-3 pb-2">
            <Button
              variant={view === 'active' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setView('active')}
              className="h-7 text-xs flex-1 shadow-none"
            >
              Ativas
            </Button>
            <Button
              variant={view === 'archived' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setView('archived')}
              className="h-7 text-xs flex-1 shadow-none"
            >
              Arquivadas
            </Button>
          </div>
          {view === 'active' && (
            <div className="px-4 pb-2 flex justify-between items-center">
              <Button
                variant="link"
                size="sm"
                className="h-6 text-xs text-muted-foreground p-0 hover:text-primary disabled:opacity-50"
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
              >
                <Check className="w-3 h-3 mr-1" />
                Marcar Todas Lidas
              </Button>
              <Button
                variant="link"
                size="sm"
                className="h-6 text-xs text-muted-foreground p-0 hover:text-primary disabled:opacity-50"
                onClick={handleArchiveAllRead}
                disabled={!activeItems.some((n) => n.is_read)}
              >
                <Archive className="w-3 h-3 mr-1" />
                Limpar Lidas
              </Button>
            </div>
          )}
        </div>
        <ScrollArea className="h-[350px]">
          {displayItems.length === 0 ? (
            <div className="p-8 flex flex-col items-center justify-center text-center text-muted-foreground h-full">
              {view === 'active' ? (
                <>
                  <Bell className="w-10 h-10 mb-3 opacity-20" />
                  <p className="text-sm">Nenhuma notificação no momento.</p>
                </>
              ) : (
                <>
                  <Archive className="w-10 h-10 mb-3 opacity-20" />
                  <p className="text-sm">Nenhuma notificação arquivada.</p>
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col">
              {displayItems.map((notif) => (
                <div
                  key={notif.id}
                  onClick={(e) => {
                    if (!notif.is_read) {
                      handleMarkAsRead(notif.id, e)
                    }
                  }}
                  className={cn(
                    'flex items-start gap-3 p-4 border-b border-border transition-colors hover:bg-muted/50 group',
                    !notif.is_read && 'cursor-pointer',
                    !notif.is_read ? 'bg-primary/5' : 'opacity-75',
                    notif.priority === 'high' && !notif.is_read
                      ? 'border-l-4 border-l-red-500 bg-red-50/50 dark:bg-red-950/20'
                      : '',
                  )}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {notif.type === 'alert' ? (
                      <div className="bg-red-100 dark:bg-red-950/50 p-1.5 rounded-full">
                        <BellRing className="h-4 w-4 text-red-600 dark:text-red-500" />
                      </div>
                    ) : (
                      <div
                        className={cn(
                          'p-1.5 rounded-full',
                          !notif.is_read
                            ? notif.priority === 'high'
                              ? 'bg-red-100 text-red-600'
                              : 'bg-primary/20 text-primary'
                            : 'bg-muted text-muted-foreground',
                        )}
                      >
                        {notif.type === 'message' ? (
                          <Megaphone className="h-4 w-4" />
                        ) : (
                          <Bell className="h-4 w-4" />
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={cn(
                          'text-sm leading-tight break-words',
                          !notif.is_read ? 'font-semibold' : 'font-medium',
                        )}
                      >
                        {notif.title}
                      </p>
                      {notif.priority === 'high' && !notif.is_read && (
                        <Badge
                          variant="destructive"
                          className="text-[9px] px-1 h-4 flex-shrink-0 uppercase tracking-wider"
                        >
                          Urgente
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-snug break-words whitespace-pre-wrap">
                      {notif.message}
                    </p>
                    {notif.bulk_messages?.file_url && (
                      <div className="pt-1.5 pb-0.5">
                        <a
                          href={`${notif.bulk_messages.file_url}${notif.bulk_messages.file_url.includes('?') ? '&' : '?'}download=`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium bg-primary/10 hover:bg-primary/20 transition-colors px-2.5 py-1.5 rounded-md w-fit border border-primary/20"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Paperclip className="w-3.5 h-3.5" />
                          <span
                            className="truncate max-w-[150px]"
                            title={notif.bulk_messages.file_name || 'Baixar Anexo'}
                          >
                            {notif.bulk_messages.file_name || 'Baixar Anexo'}
                          </span>
                        </a>
                      </div>
                    )}
                    <p className="text-[10px] text-muted-foreground/60 pt-1">
                      {new Date(notif.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    {!notif.is_read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-[10px] text-primary hover:bg-primary/20"
                        onClick={(e) => handleMarkAsRead(notif.id, e)}
                        title="Marcar como lida"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Lida
                      </Button>
                    )}
                    {view === 'active' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-[10px] text-muted-foreground hover:text-primary hover:bg-primary/10"
                        onClick={(e) => handleArchive(notif.id, e)}
                        title="Arquivar notificação"
                      >
                        <Archive className="h-3 w-3 mr-1" />
                        Arquivar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
