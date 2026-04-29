import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { getEvaluations, updateEvaluationStatus } from '@/services/evaluations'
import { InternalCommunications } from '@/components/InternalCommunications'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus, UserPlus, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { NovoAlunoDialog } from '@/components/NovoAlunoDialog'
import { AcompanhamentoDialog } from '@/components/AcompanhamentoDialog'
import { StudentCard } from '@/components/StudentCard'

export default function RoleDashboard() {
  const { profile } = useAuth()
  const [evaluations, setEvaluations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [cycleFilter, setCycleFilter] = useState<string>('all')
  const [isNewStudentOpen, setIsNewStudentOpen] = useState(false)
  const [acompanhamentoEval, setAcompanhamentoEval] = useState<{
    id: string
    nome: string
    evo_id?: string
  } | null>(null)
  const { toast } = useToast()

  const role = profile?.role || ''
  const isRestricted = role === 'fisioterapeuta' || role === 'nutricionista'

  const loadData = async () => {
    try {
      const data = await getEvaluations()
      setEvaluations(data)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

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

      let matchCycle = true
      if (cycleFilter !== 'all') {
        if (!ev.data_avaliacao) {
          matchCycle = false
        } else {
          const evalDate = new Date(ev.data_avaliacao + 'T12:00:00')
          const timeDiff = today.getTime() - evalDate.getTime()
          const daysSinceEval = Math.floor(timeDiff / (1000 * 3600 * 24))

          if (cycleFilter === '30') matchCycle = daysSinceEval <= 29
          else if (cycleFilter === '60') matchCycle = daysSinceEval >= 30 && daysSinceEval <= 59
          else if (cycleFilter === '90') matchCycle = daysSinceEval >= 60 && daysSinceEval <= 90
          else if (cycleFilter === 'over_90') matchCycle = daysSinceEval > 90
        }
      }

      return matchStatus && matchesSearch && matchCycle
    })
    return result.sort((a, b) => {
      const statusA = a.status || 'pendente'
      const statusB = b.status || 'pendente'
      return (statusOrder[statusA] || 99) - (statusOrder[statusB] || 99)
    })
  }, [evaluations, searchTerm, statusFilter, cycleFilter])

  return (
    <div className="container mx-auto py-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold capitalize">Painel - {role}</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Gerencie alunos e acompanhe comunicados.
          </p>
        </div>
      </div>

      <Tabs defaultValue="inicio">
        <TabsList className="mb-6">
          <TabsTrigger value="inicio">Início</TabsTrigger>
          <TabsTrigger value="comunicados">Comunicado Interno</TabsTrigger>
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
                <SelectTrigger className="w-full lg:w-[220px] bg-background shrink-0">
                  <SelectValue placeholder="Prazo de Reavaliação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Prazos</SelectItem>
                  <SelectItem value="30">Até 30 dias</SelectItem>
                  <SelectItem value="60">De 31 a 60 dias</SelectItem>
                  <SelectItem value="90">De 61 a 90 dias</SelectItem>
                  <SelectItem value="over_90">Mais de 90 dias (Atrasada)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {isRestricted ? (
              <Button onClick={() => setIsNewStudentOpen(true)}>
                <UserPlus className="w-4 h-4 mr-2" /> Novo Aluno
              </Button>
            ) : (
              <Button asChild>
                <Link to="/evaluation/new">
                  <Plus className="w-4 h-4 mr-2" /> Nova Avaliação
                </Link>
              </Button>
            )}
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
                  onHistoricoClick={(evalData) =>
                    setAcompanhamentoEval({
                      id: evalData.id,
                      nome: evalData.nome_cliente,
                      evo_id: evalData.evo_id,
                    })
                  }
                />
              ))}
              {filtered.length === 0 && (
                <div className="col-span-full py-16 text-center text-muted-foreground border-2 border-dashed border-zinc-700/50 rounded-xl">
                  Nenhum aluno encontrado.
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="comunicados">
          <InternalCommunications />
        </TabsContent>
      </Tabs>

      <NovoAlunoDialog
        open={isNewStudentOpen}
        onOpenChange={setIsNewStudentOpen}
        onSuccess={loadData}
      />
      <AcompanhamentoDialog
        open={!!acompanhamentoEval}
        onOpenChange={(o) => !o && setAcompanhamentoEval(null)}
        avaliacaoId={acompanhamentoEval?.id || ''}
        nomeCliente={acompanhamentoEval?.nome || ''}
        evoId={acompanhamentoEval?.evo_id}
      />
    </div>
  )
}
