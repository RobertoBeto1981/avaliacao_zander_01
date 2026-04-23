import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { supabase } from '@/lib/supabase/client'
import { RefreshCw, Search, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export function MessageLibrary({
  onReuse,
  type = 'internal',
}: {
  onReuse: (title: string, message: string) => void
  type?: 'internal' | 'external'
}) {
  const [messages, setMessages] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast()

  const fetchMessages = async () => {
    let query = supabase
      .from('bulk_messages')
      .select('*')
      .eq('hidden_from_library', false)
      .order('created_at', { ascending: false })

    if (type === 'internal') {
      query = query.neq('target_role', 'clientes')
    } else {
      query = query.eq('target_role', 'clientes')
    }

    const { data, error } = await query

    if (!error && data) {
      const unique = []
      const seen = new Set()
      for (const msg of data) {
        const key = `${msg.title}|${msg.message}`
        if (!seen.has(key)) {
          seen.add(key)
          unique.push(msg)
        }
      }
      setMessages(unique)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [type])

  const handleDelete = async (msg: any) => {
    let query = supabase
      .from('bulk_messages')
      .update({ hidden_from_library: true })
      .eq('title', msg.title)
      .eq('message', msg.message)

    if (type === 'internal') {
      query = query.neq('target_role', 'clientes')
    } else {
      query = query.eq('target_role', 'clientes')
    }

    const { error } = await query

    if (!error) {
      setMessages((prev) => prev.filter((m) => m.id !== msg.id))
      toast({ title: 'Sucesso', description: 'Mensagem removida da biblioteca.' })
    } else {
      toast({ variant: 'destructive', title: 'Erro', description: 'Falha ao remover mensagem.' })
    }
  }

  const filteredMessages = messages.filter(
    (m) =>
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.message.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <Card className="bg-zinc-900 border-zinc-800 shadow-md h-[600px] flex flex-col">
      <CardHeader className="border-b border-zinc-800/50 pb-4 shrink-0">
        <CardTitle className="text-white text-lg">Biblioteca de Mensagens</CardTitle>
        <CardDescription className="text-zinc-400">
          Reutilize comunicados enviados anteriormente.
        </CardDescription>
        <div className="relative mt-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Buscar por título ou conteúdo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-zinc-800 border-zinc-700 text-white"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMessages.map((msg) => (
              <Card key={msg.id} className="bg-zinc-800/50 border-zinc-700 flex flex-col group">
                <CardHeader className="pb-3 border-b border-zinc-700/50 flex flex-row items-start justify-between gap-2 space-y-0">
                  <div className="space-y-1 pr-2">
                    <CardTitle className="text-zinc-100 text-base line-clamp-1" title={msg.title}>
                      {msg.title}
                    </CardTitle>
                    <CardDescription className="text-zinc-400 text-xs">
                      Último envio: {format(new Date(msg.created_at), 'dd/MM/yyyy')}
                    </CardDescription>
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-white">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir da Biblioteca?</AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-400">
                          Esta mensagem será removida da biblioteca, mas o histórico de envio será
                          mantido no sistema.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 hover:text-white">
                          Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(msg)}
                          className="bg-red-500 hover:bg-red-600 text-white"
                        >
                          Sim, excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardHeader>
                <CardContent className="pt-4 flex flex-col gap-4 flex-1">
                  <p className="text-sm text-zinc-300 line-clamp-4 whitespace-pre-wrap flex-1">
                    {msg.message}
                  </p>
                  <Button
                    variant="outline"
                    className="w-full mt-auto border-zinc-600 text-zinc-200 hover:bg-[#84cc16] hover:text-zinc-900 hover:border-[#84cc16] transition-colors"
                    onClick={() => onReuse(msg.title, msg.message)}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reutilizar Mensagem
                  </Button>
                </CardContent>
              </Card>
            ))}
            {filteredMessages.length === 0 && (
              <div className="col-span-full text-center py-12 text-zinc-500 border-2 border-dashed border-zinc-700 rounded-lg">
                Nenhuma mensagem encontrada na biblioteca.
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
