import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { supabase } from '@/lib/supabase/client'
import { RefreshCw, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'

export function MessageLibrary({ onReuse }: { onReuse: (title: string, message: string) => void }) {
  const [messages, setMessages] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('bulk_messages')
        .select('*')
        .order('created_at', { ascending: false })

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
    fetchMessages()
  }, [])

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
              <Card key={msg.id} className="bg-zinc-800/50 border-zinc-700 flex flex-col">
                <CardHeader className="pb-3 border-b border-zinc-700/50">
                  <CardTitle className="text-zinc-100 text-base line-clamp-1" title={msg.title}>
                    {msg.title}
                  </CardTitle>
                  <CardDescription className="text-zinc-400 text-xs">
                    Último envio: {format(new Date(msg.created_at), 'dd/MM/yyyy')}
                  </CardDescription>
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
