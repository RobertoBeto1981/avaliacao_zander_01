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
import { Search, FileText, MessageSquare, Activity, Scale, Loader2, Edit } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { format } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { AcompanhamentoDialog } from '@/components/AcompanhamentoDialog'
import { cn } from '@/lib/utils'

export default function ProfessorDashboard() {
  const { profile } = useAuth()
  const [evaluations, setEvaluations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [acompanhamentoEval, setAcompanhamentoEval] = useState<{
    id: string
    nome: string
    evo_id?: string
  } | null>(null)
  const { toast } = useToast()

  const loadData = async () => {
    try {
      const data = await getEvaluations()
      setEvaluations(data.filter((e: any) => e.professor_id === profile?.id))
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
          <h1 className="text-3xl font-bold">Painel do Professor</h1>
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
          <div className="flex flex-wrap gap-4 mb-6 items-center">
            <div className="relative w-full sm:w-[300px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar aluno ou EVO..."
                className="pl-9 bg-background"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
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
                    <CardHeader className="p-4 pb-2 border-b border-border/10 flex flex-row items-start justify-between gap-2">
                      <div className="flex flex-col gap-1 min-w-0">
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
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary hover:bg-primary/10 shrink-0 -mr-2 -mt-2"
                            asChild
                          >
                            <Link to={`/evaluation/edit/${ev.id}`}>
                              <Edit className="w-4 h-4" />
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Editar</TooltipContent>
                      </Tooltip>
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
                      <div className="pt-2 border-t border-border/40 mt-auto">
                        <span className="text-muted-foreground text-[11px] uppercase tracking-wider font-medium block mb-1">
                          Status do Treino
                        </span>
                        <Select
                          value={ev.status || 'pendente'}
                          onValueChange={(val) => handleStatusChange(ev.id, val)}
                        >
                          <SelectTrigger
                            className={cn(
                              'h-8 text-xs font-bold w-full',
                              (!ev.status || ev.status === 'pendente') &&
                                'border-amber-500/30 text-amber-600 bg-amber-500/10',
                              ev.status === 'em_progresso' &&
                                'border-blue-500/30 text-blue-600 bg-blue-500/10',
                              ev.status === 'concluido' &&
                                'border-primary/40 text-primary bg-primary/10',
                            )}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pendente">Pendente</SelectItem>
                            <SelectItem value="em_progresso">Em Progresso</SelectItem>
                            <SelectItem value="concluido">Concluído</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex flex-col gap-3 bg-muted/10 border-t border-border/10">
                      <div className="flex w-full pt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs bg-background shadow-sm"
                          onClick={() =>
                            setAcompanhamentoEval({
                              id: ev.id,
                              nome: ev.nome_cliente,
                              evo_id: ev.evo_id,
                            })
                          }
                        >
                          <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-primary" /> Anotações e
                          Acompanhamentos
                        </Button>
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
                  Nenhum aluno atribuído a você.
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
    </div>
  )
}
