import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { getEvaluations } from '@/services/evaluations'
import { InternalCommunications } from '@/components/InternalCommunications'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Search,
  Plus,
  UserPlus,
  FileText,
  MessageSquare,
  Activity,
  Scale,
  Loader2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { format } from 'date-fns'
import { NovoAlunoDialog } from '@/components/NovoAlunoDialog'
import { AcompanhamentoDialog } from '@/components/AcompanhamentoDialog'

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

  const filtered = useMemo(() => {
    return evaluations.filter(
      (ev) =>
        ev.nome_cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.evo_id?.includes(searchTerm),
    )
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
              {filtered.map((ev) => {
                const links = ev.links_avaliacao?.[0] || {}
                const evalDate = ev.data_avaliacao
                  ? new Date(ev.data_avaliacao + 'T12:00:00')
                  : null

                return (
                  <Card
                    key={ev.id}
                    className="flex flex-col h-full hover:border-primary/50 transition-colors shadow-sm"
                  >
                    <CardHeader className="p-4 pb-2 border-b border-border/10">
                      <CardTitle
                        className="text-base font-bold line-clamp-2"
                        title={ev.nome_cliente}
                      >
                        {ev.nome_cliente}
                      </CardTitle>
                      {ev.evo_id && (
                        <Badge variant="outline" className="w-fit text-[10px]">
                          EVO: {ev.evo_id}
                        </Badge>
                      )}
                    </CardHeader>
                    <CardContent className="p-4 flex-grow text-sm flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground text-xs uppercase font-medium tracking-wider">
                          Avaliação
                        </span>
                        <span className="font-semibold">
                          {ev.is_pre_avaliacao
                            ? '-'
                            : evalDate
                              ? format(evalDate, 'dd/MM/yyyy')
                              : '-'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground text-xs uppercase font-medium tracking-wider">
                          Professor
                        </span>
                        <span
                          className="font-medium truncate max-w-[120px]"
                          title={ev.professor?.nome}
                        >
                          {ev.professor?.nome || '-'}
                        </span>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex flex-col gap-3 bg-muted/10 border-t border-border/10">
                      <div className="flex gap-2 w-full pt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs bg-background shadow-sm"
                          onClick={() =>
                            setAcompanhamentoEval({
                              id: ev.id,
                              nome: ev.nome_cliente,
                              evo_id: ev.evo_id,
                            })
                          }
                        >
                          <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-primary" /> Anotações
                        </Button>
                        {!isRestricted && !ev.is_pre_avaliacao && (
                          <Button variant="default" size="sm" className="flex-1 text-xs" asChild>
                            <Link to={`/evaluation/edit/${ev.id}`}>Editar</Link>
                          </Button>
                        )}
                      </div>
                      <div className="flex justify-center gap-1 pt-2">
                        {ev.is_pre_avaliacao ? (
                          <span className="text-xs text-muted-foreground font-medium py-1.5">
                            Avaliação pendente
                          </span>
                        ) : (
                          <>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Link
                                  to={`/evaluation/${ev.id}`}
                                  className="p-1.5 hover:bg-primary/20 rounded text-primary transition-colors"
                                >
                                  <FileText className="w-5 h-5" />
                                </Link>
                              </TooltipTrigger>
                              <TooltipContent>Ver Resumo</TooltipContent>
                            </Tooltip>
                            {links.mapeamento_sintomas_url && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <a
                                    href={links.mapeamento_sintomas_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1.5 hover:bg-primary/20 rounded text-primary transition-colors"
                                  >
                                    <Activity className="w-5 h-5" />
                                  </a>
                                </TooltipTrigger>
                                <TooltipContent>Sintomas</TooltipContent>
                              </Tooltip>
                            )}
                            {links.bia_url && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <a
                                    href={links.bia_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1.5 hover:bg-primary/20 rounded text-primary transition-colors"
                                  >
                                    <Scale className="w-5 h-5" />
                                  </a>
                                </TooltipTrigger>
                                <TooltipContent>BIA</TooltipContent>
                              </Tooltip>
                            )}
                          </>
                        )}
                      </div>
                    </CardFooter>
                  </Card>
                )
              })}
              {filtered.length === 0 && (
                <div className="col-span-full py-16 text-center text-muted-foreground border-2 border-dashed rounded-xl">
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
