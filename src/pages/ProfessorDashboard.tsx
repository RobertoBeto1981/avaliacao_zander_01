import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { getEvaluations, updateEvaluationStatus } from '@/services/evaluations'
import { InternalCommunications } from '@/components/InternalCommunications'
import { getNotifications } from '@/services/notifications'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  FileText,
  MessageSquare,
  Activity,
  Scale,
  Loader2,
  Edit,
  UserPlus,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { format } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { AcompanhamentoDialog } from '@/components/AcompanhamentoDialog'
import { NovoAlunoDialog } from '@/components/NovoAlunoDialog'
import { StudentCard } from '@/components/StudentCard'
import { cn } from '@/lib/utils'

export default function ProfessorDashboard() {
  const { profile } = useAuth()
  const [evaluations, setEvaluations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'meus' | 'todos'>('meus')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [cycleFilter, setCycleFilter] = useState<string>('all')
  const [acompanhamentoEval, setAcompanhamentoEval] = useState<{
    id: string
    nome: string
    evo_id?: string
  } | null>(null)
  const [isNewStudentOpen, setIsNewStudentOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const { toast } = useToast()

  const loadData = async () => {
    try {
      const data = await getEvaluations()
      setEvaluations(data)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const loadUnreadCount = async () => {
    if (!profile?.id) return
    try {
      const data = await getNotifications(profile.id)
      setUnreadCount(data.filter((n: any) => !n.is_read && n.type === 'message').length)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    if (profile?.id) {
      loadData()
      loadUnreadCount()
    }

    const handleUpdate = () => loadUnreadCount()
    window.addEventListener('notifications_updated', handleUpdate)
    return () => window.removeEventListener('notifications_updated', handleUpdate)
  }, [profile?.id])

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateEvaluationStatus(id, status)
      setEvaluations((prev) => prev.map((ev) => (ev.id === id ? { ...ev, status } : ev)))
      toast({ title: 'Sucesso', description: 'Status atualizado.' })
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Erro', description: e.message })
    }
  }

  const filtered = useMemo(() => {
    const statusOrder: Record<string, number> = {
      pendente: 1,
      em_progresso: 2,
      concluido: 3,
    }
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const result = evaluations.filter((ev) => {
      const matchStatus = statusFilter === 'all' || (ev.status || 'pendente') === statusFilter
      const matchesSearch =
        ev.nome_cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.evo_id?.includes(searchTerm)
      const matchesType = filterType === 'meus' ? ev.professor_id === profile?.id : true

      let matchCycle = true
      if (cycleFilter !== 'all') {
        const reavDateStr = ev.data_reavaliacao
        if (!reavDateStr) {
          matchCycle = false
        } else {
          const reavDate = new Date(reavDateStr + 'T12:00:00')
          const timeDiff = reavDate.getTime() - today.getTime()
          const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24))

          if (cycleFilter === 'late') matchCycle = daysRemaining < 0
          else if (cycleFilter === '30') matchCycle = daysRemaining >= 0 && daysRemaining <= 30
          else if (cycleFilter === '60') matchCycle = daysRemaining >= 31 && daysRemaining <= 60
          else if (cycleFilter === '90') matchCycle = daysRemaining >= 61
        }
      }

      return matchStatus && matchesSearch && matchesType && matchCycle
    })
    return result.sort((a, b) => {
      const statusA = a.status || 'pendente'
      const statusB = b.status || 'pendente'
      return (statusOrder[statusA] || 99) - (statusOrder[statusB] || 99)
    })
  }, [evaluations, searchTerm, filterType, statusFilter, cycleFilter, profile?.id])

  return (
    <div className="container mx-auto py-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Painel do Professor</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Acompanhe as montagens de treino e comunicados.
          </p>
        </div>
      </div>

      <Tabs defaultValue="inicio">
        <TabsList className="mb-6">
          <TabsTrigger value="inicio">Início</TabsTrigger>
          <TabsTrigger value="comunicados" className="relative group">
            Comunicado Interno
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] text-white font-bold animate-pulse shadow-sm shadow-red-900/50">
                {unreadCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inicio">
          <div className="flex flex-wrap gap-4 mb-6 items-center justify-between">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 w-full md:w-auto flex-1">
              <div className="relative w-full lg:w-[300px] shrink-0">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar aluno ou EVO..."
                  className="pl-9 bg-background w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full lg:w-[180px] bg-background shrink-0">
                  <SelectValue placeholder="Status do Treino" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="em_progresso">Em Progresso</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                </SelectContent>
              </Select>
              <Select value={cycleFilter} onValueChange={setCycleFilter}>
                <SelectTrigger className="w-full lg:w-[260px] bg-background shrink-0">
                  <SelectValue placeholder="Prazo para Reavaliação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Qualquer Prazo</SelectItem>
                  <SelectItem value="late">Atrasada (Passou do prazo)</SelectItem>
                  <SelectItem value="30">Vence em até 30 dias</SelectItem>
                  <SelectItem value="60">Vence entre 31 e 60 dias</SelectItem>
                  <SelectItem value="90">Vence entre 61 e 90 dias</SelectItem>
                </SelectContent>
              </Select>
              <div className="bg-zinc-800/50 p-1 rounded-md flex w-full lg:w-auto items-center border border-zinc-700/50 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-8 text-xs px-4 flex-1 sm:flex-none',
                    filterType === 'meus' &&
                      'bg-[#84cc16] text-zinc-900 font-bold hover:bg-[#84cc16]/90 hover:text-zinc-900',
                  )}
                  onClick={() => setFilterType('meus')}
                >
                  Meus Alunos
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-8 text-xs px-4 flex-1 sm:flex-none',
                    filterType === 'todos' &&
                      'bg-[#84cc16] text-zinc-900 font-bold hover:bg-[#84cc16]/90 hover:text-zinc-900',
                  )}
                  onClick={() => setFilterType('todos')}
                >
                  Todos
                </Button>
              </div>
            </div>
            <Button onClick={() => setIsNewStudentOpen(true)}>
              <UserPlus className="w-4 h-4 mr-2" /> Novo Aluno
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((ev) => (
                <StudentCard
                  key={ev.id}
                  ev={ev}
                  currentUserRoles={profile?.roles || [profile?.role]}
                  currentUserId={profile?.id}
                  onStatusChange={handleStatusChange}
                  onAnotacoesClick={(evalData) =>
                    setAcompanhamentoEval({
                      id: evalData.id,
                      nome: evalData.nome_cliente,
                      evo_id: evalData.evo_id,
                    })
                  }
                  onHistoricoClick={(evalData) => {
                    // Utilizando o acompanhamento para o histórico conforme permissões solicitadas
                    setAcompanhamentoEval({
                      id: evalData.id,
                      nome: evalData.nome_cliente,
                      evo_id: evalData.evo_id,
                    })
                  }}
                />
              ))}
              {filtered.length === 0 && (
                <div className="col-span-full py-16 text-center text-muted-foreground border-2 border-dashed border-zinc-700/50 rounded-xl">
                  {filterType === 'meus'
                    ? 'Nenhum aluno atribuído a você no momento.'
                    : 'Nenhum aluno encontrado.'}
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="comunicados">
          <InternalCommunications />
        </TabsContent>
      </Tabs>

      <AcompanhamentoDialog
        open={!!acompanhamentoEval}
        onOpenChange={(o) => !o && setAcompanhamentoEval(null)}
        avaliacaoId={acompanhamentoEval?.id || ''}
        nomeCliente={acompanhamentoEval?.nome || ''}
        evoId={acompanhamentoEval?.evo_id}
      />
      <NovoAlunoDialog
        open={isNewStudentOpen}
        onOpenChange={setIsNewStudentOpen}
        onSuccess={loadData}
      />
    </div>
  )
}
