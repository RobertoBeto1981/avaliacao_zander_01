import { useState, useEffect, useMemo } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { format } from 'date-fns'
import { FileText, Plus, UserPlus, Search, Loader2 } from 'lucide-react'
import { getEvaluations } from '@/services/evaluations'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { NovoAlunoDialog } from '@/components/NovoAlunoDialog'
import { cn } from '@/lib/utils'

export default function Index() {
  const [evaluations, setEvaluations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isNewStudentOpen, setIsNewStudentOpen] = useState(false)
  const { toast } = useToast()
  const { profile, loading: authLoading } = useAuth()

  if (authLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!profile) return <Navigate to="/login" replace />

  const userRoles = profile.roles || (profile.role ? [profile.role] : [])
  const canCreateEval = userRoles.includes('avaliador') || userRoles.includes('coordenador')
  const canCreatePre = userRoles.includes('professor')

  const loadData = async () => {
    try {
      const data = await getEvaluations()
      setEvaluations(data)
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Erro', description: e.message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filtered = useMemo(() => {
    if (!search) return evaluations
    const lower = search.toLowerCase()
    return evaluations.filter(
      (ev) =>
        ev.nome_cliente.toLowerCase().includes(lower) ||
        (ev.evo_id && ev.evo_id.toLowerCase().includes(lower)),
    )
  }, [evaluations, search])

  if (loading)
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )

  return (
    <div className="container mx-auto py-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Início - Todos os Alunos</h1>
          <p className="text-muted-foreground mt-1">
            Visão geral de todos os alunos cadastrados na academia.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canCreatePre && (
            <Button variant="outline" onClick={() => setIsNewStudentOpen(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Novo Aluno (Pré)
            </Button>
          )}
          {canCreateEval && (
            <Button asChild>
              <Link to="/evaluation/new">
                <Plus className="w-4 h-4 mr-2" />
                Nova Avaliação
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="mb-6 max-w-md relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou ID EVO..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card className="overflow-hidden border-border/50 shadow-sm">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead>Nome do Cliente</TableHead>
              <TableHead>Data Avaliação</TableHead>
              <TableHead>Avaliador</TableHead>
              <TableHead>Professor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((ev) => {
              const evalDate = ev.data_avaliacao ? new Date(ev.data_avaliacao + 'T00:00:00') : null
              return (
                <TableRow
                  key={ev.id}
                  className={cn('hover:bg-muted/30', ev.is_pre_avaliacao && 'bg-primary/5')}
                >
                  <TableCell className="font-medium">
                    <div className="flex flex-col gap-1.5">
                      <span>{ev.nome_cliente}</span>
                      <div className="flex gap-1.5 items-center flex-wrap">
                        {ev.is_pre_avaliacao && (
                          <Badge variant="destructive" className="text-[10px] px-1.5 py-0.5">
                            Pré-Avaliação
                          </Badge>
                        )}
                        {ev.evo_id && (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0.5 border-primary/30 text-primary/80"
                          >
                            EVO: {ev.evo_id}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {evalDate && !ev.is_pre_avaliacao ? format(evalDate, 'dd/MM/yyyy') : '-'}
                  </TableCell>
                  <TableCell>{ev.avaliador?.nome || '-'}</TableCell>
                  <TableCell>{ev.professor?.nome || '-'}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        ev.status === 'concluido'
                          ? 'default'
                          : ev.status === 'em_progresso'
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {ev.status === 'pendente'
                        ? 'Pendente'
                        : ev.status === 'em_progresso'
                          ? 'Em Progresso'
                          : ev.status === 'concluido'
                            ? 'Concluído'
                            : ev.status || 'Pendente'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/evaluation/${ev.id}`}>
                        <FileText className="w-4 h-4 mr-2" />
                        Ver Resumo
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhum aluno encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <NovoAlunoDialog
        open={isNewStudentOpen}
        onOpenChange={setIsNewStudentOpen}
        onSuccess={() => {
          setIsNewStudentOpen(false)
          loadData()
        }}
      />
    </div>
  )
}
