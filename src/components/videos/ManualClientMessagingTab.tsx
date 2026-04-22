import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { Send, X, MessageSquare, CheckCircle2, Search } from 'lucide-react'

export function ManualClientMessagingTab() {
  const { toast } = useToast()
  const [message, setMessage] = useState('')
  const [targetFilters, setTargetFilters] = useState<string[]>([])
  const [targetUsers, setTargetUsers] = useState<string[]>([])
  const [avaliacoes, setAvaliacoes] = useState<any[]>([])
  const [fetching, setFetching] = useState(true)
  const [selectedUserId, setSelectedUserId] = useState('none')
  const [sendQueue, setSendQueue] = useState<any[]>([])

  const filterOptions = [
    { id: '1', label: 'Clientes (1 Dia após avaliação)' },
    { id: '7', label: 'Clientes (7 Dias após avaliação)' },
    { id: '15', label: 'Clientes (15 Dias após avaliação)' },
    { id: '30', label: 'Clientes (30 Dias após avaliação)' },
    { id: '60', label: 'Clientes (60 Dias após avaliação)' },
    { id: '90', label: 'Clientes (90 Dias após avaliação)' },
  ]

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('avaliacoes')
        .select('id, nome_cliente, telefone_cliente, data_avaliacao')
        .order('data_avaliacao', { ascending: false })

      if (data) {
        // Remove duplicados de telefone mantendo o mais recente
        const uniqueClients = new Map()
        data.forEach((a) => {
          if (a.telefone_cliente && !uniqueClients.has(a.telefone_cliente)) {
            uniqueClients.set(a.telefone_cliente, a)
          }
        })
        // Ordena por nome
        const sorted = Array.from(uniqueClients.values()).sort((a, b) =>
          a.nome_cliente.localeCompare(b.nome_cliente),
        )
        setAvaliacoes(sorted)
      }
      setFetching(false)
    }
    load()
  }, [])

  const handleFilterToggle = (id: string) => {
    if (targetFilters.includes(id)) {
      setTargetFilters(targetFilters.filter((f) => f !== id))
    } else {
      setTargetFilters([...targetFilters, id])
    }
  }

  const handleAddUser = (userId: string) => {
    if (userId !== 'none' && !targetUsers.includes(userId)) {
      setTargetUsers([...targetUsers, userId])
    }
    setTimeout(() => setSelectedUserId('none'), 10)
  }

  const handleRemoveUser = (userId: string) => {
    setTargetUsers(targetUsers.filter((id) => id !== userId))
  }

  const handlePrepare = () => {
    if (!message.trim()) {
      toast({
        variant: 'destructive',
        title: 'Aviso',
        description: 'Digite o conteúdo da mensagem que deseja enviar.',
      })
      return
    }
    if (targetFilters.length === 0 && targetUsers.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Aviso',
        description: 'Selecione pelo menos um grupo de clientes ou clientes individuais.',
      })
      return
    }

    const selectedClients = new Map()

    targetUsers.forEach((id) => {
      const client = avaliacoes.find((a) => a.id === id)
      if (client && client.telefone_cliente) selectedClients.set(id, client)
    })

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    targetFilters.forEach((daysStr) => {
      const days = parseInt(daysStr)
      const targetDate = new Date(today)
      targetDate.setDate(targetDate.getDate() - days)
      const targetDateStr = targetDate.toISOString().split('T')[0]

      avaliacoes.forEach((client) => {
        if (client.data_avaliacao === targetDateStr && client.telefone_cliente) {
          selectedClients.set(client.id, client)
        }
      })
    })

    const queue = Array.from(selectedClients.values()).map((client) => {
      const firstName = client.nome_cliente.trim().split(' ')[0]
      const msg = message.replace(/\{\{\s*nome\s*\}\}/gi, firstName)
      return { ...client, compiledMessage: msg, sent: false }
    })

    if (queue.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Fila Vazia',
        description:
          'Nenhum cliente foi encontrado com os filtros aplicados (ou os clientes não possuem telefone cadastrado).',
      })
      return
    }

    setSendQueue(queue)
    toast({
      title: 'Fila Gerada',
      description: `${queue.length} destinatários preparados com sucesso.`,
    })
  }

  const handleSendWa = (clientId: string, phone: string, msg: string) => {
    let cleanPhone = phone.replace(/\D/g, '')
    if (!cleanPhone.startsWith('55')) cleanPhone = '55' + cleanPhone

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`
    window.open(url, '_blank')

    setSendQueue((prev) => prev.map((c) => (c.id === clientId ? { ...c, sent: true } : c)))
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <Card className="border-border/50 shadow-md">
        <CardHeader className="border-b border-border/50 pb-4 bg-muted/10">
          <CardTitle className="text-xl flex items-center gap-2 text-primary">
            <Send className="w-5 h-5" />
            Envio Direto de Mensagens aos Alunos
          </CardTitle>
          <CardDescription>
            Componha uma mensagem e selecione os clientes (individualmente ou por dias desde a
            avaliação) para iniciar uma transmissão manual.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label className="font-semibold text-foreground">Mensagem Personalizada</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Olá {{nome}}, tudo bem? Passando para avisar que..."
              className="min-h-[120px] resize-y text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Dica de variável: Use{' '}
              <code className="bg-muted px-1 rounded font-mono">{'{{nome}}'}</code> para preencher
              automaticamente o primeiro nome do cliente.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label className="font-semibold flex items-center gap-2 text-foreground">
                Filtrar por Ciclo da Avaliação
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-muted/20 rounded-lg border border-border/50">
                {filterOptions.map((opt) => (
                  <div key={opt.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={`filter-${opt.id}`}
                      checked={targetFilters.includes(opt.id)}
                      onCheckedChange={() => handleFilterToggle(opt.id)}
                      className="data-[state=checked]:bg-[#95c23d] data-[state=checked]:text-black"
                    />
                    <label
                      htmlFor={`filter-${opt.id}`}
                      className="text-sm font-medium leading-none cursor-pointer hover:text-foreground transition-colors text-muted-foreground"
                    >
                      {opt.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="font-semibold flex items-center gap-2 text-foreground">
                Selecionar Clientes Manualmente
              </Label>
              <Select value={selectedUserId} onValueChange={handleAddUser}>
                <SelectTrigger className="h-11">
                  <SelectValue
                    placeholder={
                      fetching
                        ? 'Carregando base de clientes...'
                        : 'Busque e selecione um cliente...'
                    }
                  />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  <SelectItem value="none" className="text-muted-foreground italic">
                    Selecione um cliente na lista...
                  </SelectItem>
                  {avaliacoes.map((a) => (
                    <SelectItem key={a.id} value={a.id} className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{a.nome_cliente}</span>
                        <span className="text-[11px] text-muted-foreground">
                          {a.data_avaliacao
                            ? new Date(a.data_avaliacao).toLocaleDateString('pt-BR')
                            : 'Sem data'}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {targetUsers.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4 p-3 bg-muted/20 rounded-lg border border-border/50 min-h-[48px]">
                  {targetUsers.map((id) => {
                    const user = avaliacoes.find((u) => u.id === id)
                    return (
                      <Badge
                        key={id}
                        variant="secondary"
                        className="bg-background border border-border/50 shadow-sm pr-1 py-1 pl-3 flex items-center gap-1.5"
                      >
                        <span className="font-medium text-foreground">
                          {user?.nome_cliente.split(' ')[0]}
                        </span>
                        <button
                          onClick={() => handleRemoveUser(id)}
                          className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5 transition-colors focus:outline-none"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </Badge>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-border/50">
            <Button
              className="w-full bg-[#95c23d] hover:bg-[#85b035] text-black font-bold h-12 shadow-sm"
              onClick={handlePrepare}
            >
              <Search className="w-5 h-5 mr-2" />
              Preparar Fila de Transmissão
            </Button>
          </div>
        </CardContent>
      </Card>

      {sendQueue.length > 0 && (
        <Card className="border-[#95c23d]/30 shadow-md border-2 animate-fade-in">
          <CardHeader className="bg-[#95c23d]/5 border-b border-[#95c23d]/20 py-4 flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              <ListTodo className="w-5 h-5 text-[#85b035]" />
              Fila de Transmissão Gerada
            </CardTitle>
            <Badge variant="outline" className="bg-background font-bold text-sm">
              {sendQueue.filter((q) => q.sent).length} de {sendQueue.length}
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50 max-h-[500px] overflow-y-auto bg-card">
              {sendQueue.map((client) => (
                <div
                  key={client.id}
                  className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                    client.sent ? 'bg-[#95c23d]/10' : 'hover:bg-muted/30'
                  }`}
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground text-base">
                        {client.nome_cliente}
                      </span>
                      {client.sent && (
                        <Badge
                          variant="outline"
                          className="bg-[#95c23d] text-black border-[#85b035] gap-1 text-[10px] font-bold"
                        >
                          <CheckCircle2 className="w-3 h-3" /> Enviado
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground font-mono">
                      {client.telefone_cliente}
                    </p>
                    <div className="mt-3 p-3 rounded-md bg-muted/40 border border-border/50 relative">
                      <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                        {client.compiledMessage}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={client.sent ? 'outline' : 'default'}
                    className={`shrink-0 shadow-sm h-10 ${
                      !client.sent
                        ? 'bg-[#95c23d] text-black hover:bg-[#85b035]'
                        : 'border-[#95c23d]/50 text-[#85b035] hover:bg-[#95c23d]/10'
                    }`}
                    onClick={() =>
                      handleSendWa(client.id, client.telefone_cliente, client.compiledMessage)
                    }
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    {client.sent ? 'Reenviar no WhatsApp' : 'Abrir no WhatsApp'}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
