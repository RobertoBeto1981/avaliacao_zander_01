import { useState, useEffect, useRef } from 'react'
import { getMessages, sendMessage } from '@/services/chat'
import { supabase } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Send, FileText } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ClientQuickView } from './ClientQuickView'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export function ChatArea({ contact, currentUser, evaluations }: any) {
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [selectedAvaliacaoId, setSelectedAvaliacaoId] = useState<string>('none')
  const [quickViewAvaliacao, setQuickViewAvaliacao] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const loadMessages = async () => {
    const data = await getMessages(contact.id, contact.type)
    setMessages(data)
    scrollToBottom()
  }

  const fetchSingleMessage = async (id: string) => {
    const { data } = await supabase
      .from('internal_chats')
      .select(`
      *,
      sender:sender_id (nome, role),
      avaliacao:avaliacao_id (id, nome_cliente, status)
    `)
      .eq('id', id)
      .single()

    if (data) {
      setMessages((prev) => {
        if (prev.find((m) => m.id === data.id)) return prev
        return [...prev, data]
      })
      scrollToBottom()
    }
  }

  useEffect(() => {
    loadMessages()

    const channel = supabase
      .channel(`chat_${contact.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'internal_chats' },
        (payload) => {
          const isGroupMatch = contact.type === 'group' && payload.new.target_role === contact.id
          const isUserMatch =
            contact.type === 'user' &&
            ((payload.new.sender_id === currentUser.id && payload.new.receiver_id === contact.id) ||
              (payload.new.sender_id === contact.id && payload.new.receiver_id === currentUser.id))

          if (isGroupMatch || isUserMatch) {
            fetchSingleMessage(payload.new.id)
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [contact.id])

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const payload = {
      message: newMessage,
      avaliacao_id: selectedAvaliacaoId === 'none' ? null : selectedAvaliacaoId,
      receiver_id: contact.type === 'user' ? contact.id : null,
      target_role: contact.type === 'group' ? contact.id : null,
    }

    try {
      setNewMessage('')
      setSelectedAvaliacaoId('none')
      await sendMessage(payload)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-zinc-900 border-l border-zinc-800 rounded-r-lg">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/80">
        <div>
          <h3 className="font-semibold text-white">{contact.name}</h3>
          <span className="text-xs text-zinc-400 capitalize">
            {contact.type === 'group' ? 'Grupo' : contact.role}
          </span>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg, idx) => {
            const isMe = msg.sender_id === currentUser?.id
            return (
              <div
                key={msg.id || idx}
                className={cn('flex flex-col', isMe ? 'items-end' : 'items-start')}
              >
                <div className="flex items-center gap-2 mb-1">
                  {!isMe && (
                    <span className="text-xs text-zinc-500 font-medium">{msg.sender?.nome}</span>
                  )}
                </div>
                <div
                  className={cn(
                    'max-w-[75%] rounded-lg p-3 text-sm relative shadow-sm',
                    isMe
                      ? 'bg-[#84cc16] text-zinc-900 rounded-tr-none'
                      : 'bg-zinc-800 text-zinc-100 rounded-tl-none border border-zinc-700',
                  )}
                >
                  {msg.avaliacao && (
                    <div
                      className={cn(
                        'mb-2 p-2 rounded cursor-pointer text-xs font-semibold flex items-center gap-2 transition-colors',
                        isMe
                          ? 'bg-black/10 hover:bg-black/20 text-zinc-900'
                          : 'bg-white/5 hover:bg-white/10 text-white',
                      )}
                      onClick={() => setQuickViewAvaliacao(msg.avaliacao.id)}
                    >
                      <FileText className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Ficha: {msg.avaliacao.nome_cliente}</span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                </div>
                <span className="text-[10px] text-zinc-500 mt-1">
                  {new Date(msg.created_at).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            )
          })}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-zinc-800 bg-zinc-900/80">
        <form onSubmit={handleSend} className="flex flex-col gap-3">
          <Select value={selectedAvaliacaoId} onValueChange={setSelectedAvaliacaoId}>
            <SelectTrigger className="w-[260px] h-8 text-xs bg-zinc-800 border-zinc-700 text-zinc-300">
              <SelectValue placeholder="Vincular a um aluno (Opcional)" />
            </SelectTrigger>
            <SelectContent className="max-h-48 border-zinc-700 bg-zinc-800 text-zinc-100">
              <SelectItem value="none" className="text-zinc-400 italic">
                Nenhum vínculo
              </SelectItem>
              {evaluations.map((e: any) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.nome_cliente}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-1 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-[#84cc16]"
            />
            <Button
              type="submit"
              size="icon"
              className="bg-[#84cc16] hover:bg-[#65a30d] text-zinc-900 shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>

      <ClientQuickView
        avaliacaoId={quickViewAvaliacao}
        onClose={() => setQuickViewAvaliacao(null)}
      />
    </div>
  )
}
