import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { getEvaluations, updateEvaluationStatus } from '@/services/evaluations'
import { InternalCommunications } from '@/components/InternalCommunications'
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
  const [acompanhamentoEval, setAcompanhamentoEval] = useState<{
    id: string
    nome: string
    evo_id?: string
  } | null>(null)
  const [isNewStudentOpen, setIsNewStudentOpen] = useState(false)
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

  useEffect(() => {
    if (profile?.id) loadData()
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
    return evaluations.filter((ev) => {
      const matchesSearch =
        ev.nome_cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.evo_id?.includes(searchTerm)
      const matchesType = filterType === 'meus' ? ev.professor_id === profile?.id : true
      return matchesSearch && matchesType
    })
  }, [evaluations, searchTerm, filterType, profile?.id])

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
          <TabsTrigger value="comunicados">Comunicado Interno</TabsTrigger>
        </TabsList>

        <TabsContent value="inicio">
          <div className="flex flex-wrap gap-4 mb-6 items-center justify-between">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
              <div className="relative w-full sm:w-[300px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar aluno ou EVO..."
                  className="pl-9 bg-background w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="bg-zinc-800/50 p-1 rounded-md flex w-full sm:w-auto items-center border border-zinc-700/50">
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
