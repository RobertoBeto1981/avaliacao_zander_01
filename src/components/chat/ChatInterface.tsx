import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { ChatSidebar } from './ChatSidebar'
import { ChatArea } from './ChatArea'
import { getUsers } from '@/services/users'
import { getEvaluations } from '@/services/evaluations'
import { MessageSquare } from 'lucide-react'

export type ChatContact = {
  id: string
  name: string
  type: 'user' | 'group'
  role?: string
}

export function ChatInterface() {
  const { profile } = useAuth()
  const [users, setUsers] = useState<any[]>([])
  const [evaluations, setEvaluations] = useState<any[]>([])
  const [activeContact, setActiveContact] = useState<ChatContact | null>(null)

  useEffect(() => {
    getUsers().then((data) => {
      const sorted = data
        .filter((u) => u.id !== profile?.id)
        .sort((a, b) => a.nome.localeCompare(b.nome))
      setUsers(sorted)
    })
    getEvaluations().then((data) => setEvaluations(data))
  }, [profile?.id])

  const groups: ChatContact[] = [
    { id: 'todos', name: 'Todos da Equipe', type: 'group' },
    { id: 'professor', name: 'Professores', type: 'group' },
    { id: 'avaliador', name: 'Avaliadores', type: 'group' },
    { id: 'fisioterapeuta', name: 'Fisioterapeutas', type: 'group' },
    { id: 'nutricionista', name: 'Nutricionistas', type: 'group' },
    { id: 'coordenador', name: 'Coordenadores', type: 'group' },
  ]

  return (
    <div className="flex w-full h-full text-zinc-100 rounded-lg overflow-hidden border border-zinc-800 shadow-xl bg-zinc-900">
      <ChatSidebar
        users={users}
        groups={groups}
        activeContact={activeContact}
        onSelectContact={setActiveContact}
      />
      {activeContact ? (
        <ChatArea contact={activeContact} currentUser={profile} evaluations={evaluations} />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-zinc-900/50">
          <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
            <MessageSquare className="w-8 h-8 text-zinc-500" />
          </div>
          <p className="text-zinc-400 font-medium">Selecione uma conversa para iniciar</p>
          <p className="text-zinc-500 text-sm mt-1">
            Converse com a equipe ou vincule mensagens a alunos.
          </p>
        </div>
      )}
    </div>
  )
}
