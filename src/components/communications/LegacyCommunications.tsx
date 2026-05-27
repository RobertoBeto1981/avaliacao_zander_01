import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { useToast } from '@/hooks/use-toast'
import { getUsers } from '@/services/users'
import { supabase } from '@/lib/supabase/client'
import { Send, Loader2, X, Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { InternalCommunications } from '@/components/InternalCommunications'
import { SentCommunications } from '@/components/SentCommunications'
import { MessageLibrary } from '@/components/MessageLibrary'

export default function LegacyCommunications() {
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState('enviar')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [priority, setPriority] = useState('normal')
  const [targetRoles, setTargetRoles] = useState<string[]>([])
  const [targetUsers, setTargetUsers] = useState<string[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [selectedUserId, setSelectedUserId] = useState('none')

  const rolesList = [
    { id: 'todos', label: 'Todos os Colaboradores' },
    { id: 'professor', label: 'Professores' },
    { id: 'avaliador', label: 'Avaliadores' },
    { id: 'fisioterapeuta', label: 'Fisioterapeutas' },
    { id: 'nutricionista', label: 'Nutricionistas' },
    { id: 'coordenador', label: 'Coordenadores' },
  ]

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setFetching(true)
      const data = await getUsers()
      const sorted = data.sort((a: any, b: any) => a.nome.localeCompare(b.nome))
      setUsers(sorted)
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Falha ao carregar usuários.' })
    } finally {
      setFetching(false)
    }
  }

  const handleRoleToggle = (role: string) => {
    if (role === 'todos') {
      if (targetRoles.includes('todos')) setTargetRoles([])
      else setTargetRoles(['todos'])
      return
    }

    let newRoles = [...targetRoles]
    if (newRoles.includes('todos')) newRoles = newRoles.filter((r) => r !== 'todos')

    if (newRoles.includes(role)) newRoles = newRoles.filter((r) => r !== role)
    else newRoles.push(role)

    setTargetRoles(newRoles)
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

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast({
        variant: 'destructive',
        title: 'Aviso',
        description: 'Título e mensagem são obrigatórios.',
      })
      return
    }

    if (targetRoles.length === 0 && targetUsers.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Aviso',
        description: 'Selecione pelo menos um grupo ou colaborador.',
      })
      return
    }

    try {
      setLoading(true)

      let p_file_url = null
      let p_file_name = null

      if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('communications')
          .upload(fileName, file)
        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage.from('communications').getPublicUrl(fileName)

        p_file_url = urlData.publicUrl
        p_file_name = file.name
      }

      const { error } = await supabase.rpc('send_internal_communication', {
        p_target_roles: targetRoles,
        p_target_users: targetUsers,
        p_title: title.trim(),
        p_message: message.trim(),
        p_priority: priority,
        p_file_url,
        p_file_name,
      })

      if (error) throw error

      toast({ title: 'Sucesso', description: 'Comunicado enviado com sucesso!' })
      setTitle('')
      setMessage('')
      setPriority('normal')
      setTargetRoles([])
      setTargetUsers([])
      setFile(null)
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Erro', description: e.message || 'Falha ao enviar.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-zinc-900 border border-zinc-800/50 flex flex-wrap h-auto">
          <TabsTrigger
            value="enviar"
            className="data-[state=active]:bg-zinc-800 data-[state=active]:text-[#84cc16]"
          >
            Novo Comunicado
          </TabsTrigger>
          <TabsTrigger
            value="caixa"
            className="data-[state=active]:bg-zinc-800 data-[state=active]:text-[#84cc16]"
          >
            Caixa de Entrada
          </TabsTrigger>
          <TabsTrigger
            value="enviados"
            className="data-[state=active]:bg-zinc-800 data-[state=active]:text-[#84cc16]"
          >
            Histórico e Rastreio
          </TabsTrigger>
          <TabsTrigger
            value="biblioteca"
            className="data-[state=active]:bg-zinc-800 data-[state=active]:text-[#84cc16]"
          >
            Biblioteca de Mensagens
          </TabsTrigger>
        </TabsList>

        <TabsContent value="caixa" className="m-0">
          <InternalCommunications />
        </TabsContent>
        <TabsContent value="enviados" className="m-0">
          <SentCommunications />
        </TabsContent>
        <TabsContent value="biblioteca" className="m-0">
          <MessageLibrary
            onReuse={(t, m) => {
              setTitle(t)
              setMessage(m)
              setActiveTab('enviar')
            }}
          />
        </TabsContent>

        <TabsContent value="enviar" className="m-0">
          <Card className="bg-zinc-900 border-zinc-800 shadow-md">
            <CardHeader className="border-b border-zinc-800/50 pb-4">
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Send className="w-5 h-5 text-[#84cc16]" /> Novo Comunicado
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Preencha os campos abaixo para enviar uma mensagem a toda a equipe ou a pessoas
                selecionadas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label className="text-zinc-200 font-semibold">Título</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-200 font-semibold">Mensagem</Label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[160px] bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-zinc-200 font-semibold flex items-center gap-2">
                    Enviar por Cargo
                  </Label>
                  <div className="space-y-3 p-4 bg-zinc-800/30 rounded-lg border border-zinc-800/50">
                    {rolesList.map((role) => (
                      <div key={role.id} className="flex items-center space-x-3">
                        <Checkbox
                          id={`role-${role.id}`}
                          checked={targetRoles.includes(role.id)}
                          onCheckedChange={() => handleRoleToggle(role.id)}
                          className="border-zinc-600 data-[state=checked]:bg-[#84cc16]"
                        />
                        <label
                          htmlFor={`role-${role.id}`}
                          className="text-sm font-medium text-zinc-300"
                        >
                          {role.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-zinc-200 font-semibold">Prioridade</Label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high" className="text-red-400">
                          Alta (Urgente)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-200 font-semibold">
                      Adicionar Colaborador Específico
                    </Label>
                    <Select value={selectedUserId} onValueChange={handleAddUser}>
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                        <SelectValue
                          placeholder={fetching ? 'Carregando...' : 'Selecione um colaborador...'}
                        />
                      </SelectTrigger>
                      <SelectContent className="max-h-64">
                        <SelectItem value="none" className="text-zinc-500">
                          Selecione um colaborador...
                        </SelectItem>
                        {users.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            <div className="flex items-center gap-2">
                              <span className="text-white">{u.nome}</span>
                              <span className="text-[11px] text-zinc-400">{u.role}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {targetUsers.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4 p-3 bg-zinc-800/30 rounded-lg border border-zinc-800/50">
                        {targetUsers.map((id) => {
                          const user = users.find((u) => u.id === id)
                          return (
                            <Badge
                              key={id}
                              variant="secondary"
                              className="bg-zinc-700/80 text-zinc-100 flex items-center gap-1.5"
                            >
                              <span>{user?.nome.split(' ')[0]}</span>
                              <button
                                onClick={() => handleRemoveUser(id)}
                                className="ml-1 hover:text-red-500"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </Badge>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 mt-6">
                    <Label className="text-zinc-200 font-semibold">Anexar Arquivo</Label>
                    <Input
                      type="file"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="bg-zinc-800 border-zinc-700 text-zinc-300"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800/50">
                <Button
                  className="w-full bg-[#84cc16] hover:bg-[#65a30d] text-zinc-900 font-bold"
                  onClick={handleSend}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" /> Enviar Comunicado
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
