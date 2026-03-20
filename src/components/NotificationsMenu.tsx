import { useState, useEffect } from 'react'
import { Bell, Check, BellRing } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { calculateDeadline } from '@/lib/holidays'
import { isAfter, startOfDay } from 'date-fns'
import { getNotifications, markAsRead } from '@/services/notifications'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export default function NotificationsMenu({ profile }: { profile: any }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [open, setOpen] = useState(false)

  const loadNotifications = async () => {
    if (!user) return
    try {
      const dbNotifs = await getNotifications(user.id)
      setNotifications(dbNotifs)

      if (profile?.role === 'professor') {
        const { data: evals } = await supabase
          .from('avaliacoes')
          .select('id, nome_cliente, data_avaliacao')
          .eq('professor_id', user.id)
          .neq('status', 'concluido')

        if (evals) {
          const today = startOfDay(new Date())
          const lateEvals = evals.filter((ev) => {
            const deadline = calculateDeadline(ev.data_avaliacao, 3)
            return isAfter(today, deadline)
          })

          const generatedAlerts = lateEvals.map((ev) => ({
            id: `alert-${ev.id}`,
            title: 'Prazo Expirado!',
            message: `A avaliação de ${ev.nome_cliente} está atrasada.`,
            type: 'alert',
            is_read: false,
            created_at: new Date().toISOString(),
          }))
          setAlerts(generatedAlerts)
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadNotifications()

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
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, profile])

  const handleMarkAsRead = async (id: string) => {
    if (id.startsWith('alert-')) return
    try {
      await markAsRead(id)
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
    } catch (e) {
      console.error(e)
    }
  }

  const allItems = [...alerts, ...notifications].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )
  const unreadCount = allItems.filter((n) => !n.is_read).length

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
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
          <h4 className="font-semibold text-sm">Notificações</h4>
          {unreadCount > 0 && (
            <Badge variant="default" className="text-xs">
              {unreadCount} novas
            </Badge>
          )}
        </div>
        <ScrollArea className="h-[350px]">
          {allItems.length === 0 ? (
            <div className="p-8 flex flex-col items-center justify-center text-center text-muted-foreground">
              <Bell className="w-10 h-10 mb-2 opacity-20" />
              <p className="text-sm">Nenhuma notificação no momento.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {allItems.map((notif) => (
                <div
                  key={notif.id}
                  className={cn(
                    'flex items-start gap-3 p-4 border-b border-border transition-colors hover:bg-muted/50',
                    !notif.is_read ? 'bg-primary/5' : 'opacity-75',
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
                            ? 'bg-primary/20 text-primary'
                            : 'bg-muted text-muted-foreground',
                        )}
                      >
                        <Bell className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p
                      className={cn(
                        'text-sm leading-tight',
                        !notif.is_read ? 'font-semibold' : 'font-medium',
                      )}
                    >
                      {notif.title}
                    </p>
                    <p className="text-xs text-muted-foreground leading-snug">{notif.message}</p>
                  </div>
                  {!notif.is_read && notif.type !== 'alert' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-primary hover:bg-primary/20 flex-shrink-0"
                      onClick={() => handleMarkAsRead(notif.id)}
                      title="Marcar como lida"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
