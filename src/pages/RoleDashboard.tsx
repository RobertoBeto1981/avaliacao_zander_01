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
    const result = evaluations.filter(
      (ev) =>
        ev.nome_cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.evo_id?.includes(searchTerm),
    )
    return result.sort((a, b) => {
      const statusA = a.status || 'pendente'
      const statusB = b.status || 'pendente'
      return (statusOrder[statusA] || 99) - (statusOrder[statusB] || 99)
    })
  }, [evaluations, searchTerm])

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
            <div className="relative w-full sm:w-[300px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar aluno ou EVO..."
                className="pl-9 bg-background"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
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
