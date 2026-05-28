import { useState, useEffect, useRef } from 'react'
import { getMessages, sendMessage, deleteChatMessage } from '@/services/chat'
import { supabase } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Send, FileText, Check, ChevronsUpDown, Trash2 } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ClientQuickView } from './ClientQuickView'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { cn } from '@/lib/utils'

export function ChatArea({ contact, currentUser, evaluations }: any) {
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [selectedAvaliacaoId, setSelectedAvaliacaoId] = useState<string>('none')
  const [quickViewAvaliacao, setQuickViewAvaliacao] = useState<string | null>(null)
  const [openCombo, setOpenCombo] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const isCoordenador =
    currentUser?.roles?.includes('coordenador') || currentUser?.role === 'coordenador'

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
        const isPendingOptimistic = prev.some(
          (m) => m.isOptimistic && m.message === data.message && m.sender_id === data.sender_id,
        )
        if (isPendingOptimistic) return prev
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
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'internal_chats' },
        (payload) => {
          setMessages((prev) => prev.filter((m) => m.id !== payload.old.id))
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

    const tempId = `temp-${Date.now()}`
    const optimisticMsg = {
      id: tempId,
      ...payload,
      sender_id: currentUser?.id,
      created_at: new Date().toISOString(),
      sender: { nome: currentUser?.nome, role: currentUser?.roles?.[0] || currentUser?.role },
      avaliacao:
        selectedAvaliacaoId !== 'none'
          ? evaluations.find((ev: any) => ev.id === selectedAvaliacaoId)
          : null,
      isOptimistic: true,
    }

    setMessages((prev) => [...prev, optimisticMsg])
    scrollToBottom()
    setNewMessage('')
    setSelectedAvaliacaoId('none')

    try {
      const savedMsg = await sendMessage(payload)
      if (savedMsg) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId
              ? { ...savedMsg, sender: optimisticMsg.sender, avaliacao: optimisticMsg.avaliacao }
              : m,
          ),
        )
      }
    } catch (e) {
      console.error(e)
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente apagar esta mensagem?')) return
    try {
      await deleteChatMessage(id)
    } catch (error) {
      console.error(error)
    }
  }

  const selectedEvalName =
    selectedAvaliacaoId !== 'none'
      ? evaluations.find((e: any) => e.id === selectedAvaliacaoId)?.nome_cliente
      : 'Nenhum vínculo'

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
                className={cn('flex flex-col group', isMe ? 'items-end' : 'items-start')}
              >
                <div className="flex items-center gap-2 mb-1">
                  {!isMe && (
                    <span className="text-xs text-zinc-500 font-medium">{msg.sender?.nome}</span>
                  )}
                </div>
                <div className={cn('flex items-end gap-2', isMe ? 'flex-row-reverse' : 'flex-row')}>
                  <div
                    className={cn(
                      'max-w-[75%] rounded-lg p-3 text-sm relative shadow-sm break-words',
                      isMe
                        ? 'bg-[#84cc16] text-zinc-900 rounded-tr-none'
                        : 'bg-zinc-800 text-zinc-100 rounded-tl-none border border-zinc-700',
                      msg.isOptimistic && 'opacity-70',
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

                  {isCoordenador && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                      onClick={() => handleDelete(msg.id)}
                      title="Apagar mensagem"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
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
          <Popover open={openCombo} onOpenChange={setOpenCombo}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openCombo}
                className="w-[280px] h-8 text-xs bg-zinc-800 border-zinc-700 text-zinc-300 justify-between"
              >
                <span className="truncate">{selectedEvalName}</span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-0 border-zinc-700 bg-zinc-800" side="top">
              <Command className="bg-transparent">
                <CommandInput placeholder="Buscar aluno por Nome ou EVO..." className="h-9" />
                <CommandList>
                  <CommandEmpty>Nenhum aluno encontrado.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value="none"
                      onSelect={() => {
                        setSelectedAvaliacaoId('none')
                        setOpenCombo(false)
                      }}
                      className="text-zinc-400 italic"
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          selectedAvaliacaoId === 'none' ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      Nenhum vínculo
                    </CommandItem>
                    {evaluations.map((e: any) => (
                      <CommandItem
                        key={e.id}
                        value={`${e.nome_cliente} ${e.evo_id || ''}`}
                        onSelect={() => {
                          setSelectedAvaliacaoId(e.id)
                          setOpenCombo(false)
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            selectedAvaliacaoId === e.id ? 'opacity-100' : 'opacity-0',
                          )}
                        />
                        <div className="flex flex-col">
                          <span>{e.nome_cliente}</span>
                          {e.evo_id && (
                            <span className="text-[10px] text-zinc-500">EVO: {e.evo_id}</span>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
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
