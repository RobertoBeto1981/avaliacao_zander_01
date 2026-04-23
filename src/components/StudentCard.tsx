import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Clock,
  MessageSquare,
  Edit,
  Activity,
  Scale,
  HeartPulse,
  Target,
  FileEdit,
  Loader2,
} from 'lucide-react'
import { format } from 'date-fns'
import { cn, formatPhone } from '@/lib/utils'
import { requestProfessorChange } from '@/services/professor_requests'
import { calculateDeadline } from '@/lib/holidays'
import { useToast } from '@/hooks/use-toast'
import { updateEvaluationFull } from '@/services/evaluations'
import { getAvaliacaoHistory } from '@/services/reavaliacoes'

interface StudentCardProps {
  ev: any
  currentUserRoles: string[]
  currentUserId: string
  professors?: any[]
  onStatusChange: (id: string, status: string) => void
  onAnotacoesClick: (ev: any) => void
  onHistoricoClick: (ev: any) => void
  onProfessorChange?: (id: string, profId: string) => void
}

export function StudentCard({
  ev,
  currentUserRoles,
  currentUserId,
  professors,
  onStatusChange,
  onAnotacoesClick,
  onHistoricoClick,
  onProfessorChange,
}: StudentCardProps) {
  const isCoordenador = currentUserRoles.includes('coordenador')
  const isProfessor = currentUserRoles.includes('professor')
  const isAvaliador = currentUserRoles.includes('avaliador')
  const { toast } = useToast()
  const [isRequesting, setIsRequesting] = useState(false)
  const [hasRequested, setHasRequested] = useState(false)
  const [isLoadingRequest, setIsLoadingRequest] = useState(true)
  const [isEditCadastroOpen, setIsEditCadastroOpen] = useState(false)
  const [isEditAvaliacaoOpen, setIsEditAvaliacaoOpen] = useState(false)

  useEffect(() => {
    if (isProfessor && ev.professor_id !== currentUserId) {
      const checkRequest = async () => {
        try {
          const { data } = await supabase
            .from('professor_change_requests')
            .select('id, status')
            .eq('avaliacao_id', ev.id)
            .eq('professor_id', currentUserId)
            .eq('status', 'pendente')
            .maybeSingle()

          if (data) {
            setHasRequested(true)
          }
        } catch (error) {
          console.error(error)
        } finally {
          setIsLoadingRequest(false)
        }
      }
      checkRequest()
    } else {
      setIsLoadingRequest(false)
    }
  }, [ev.id, currentUserId, isProfessor, ev.professor_id])

  // Regra: Professor edita apenas situação "TREINO" se o aluno foi distribuído para ele
  const canEditTreino = isCoordenador || (isProfessor && ev.professor_id === currentUserId)

  // Regra: Avaliador/Nutri/Fisio só pode editar o cadastro se ele próprio incluiu o aluno (avaliador_id)
  const isCreator = ev.avaliador_id === currentUserId || ev.user_id === currentUserId

  // Regra: O botão Editar fica ativo se o usuário tiver permissão, senão inativo (não desaparece)
  const canEditButton = isCoordenador || isProfessor || isCreator

  const links = ev.links_avaliacao?.[0] || {}
  const evalDate = ev.data_avaliacao ? new Date(ev.data_avaliacao + 'T12:00:00') : null
  const reevalDate = ev.data_reavaliacao ? new Date(ev.data_reavaliacao + 'T12:00:00') : null

  let prazoTreino = null
  if (
    ev.desafio_zander_status &&
    ev.desafio_zander_status !== 'nenhum' &&
    ev.desafio_zander_ativado_em
  ) {
    prazoTreino = calculateDeadline(ev.desafio_zander_ativado_em.split('T')[0], 3)
  } else if (ev.data_avaliacao) {
    prazoTreino = calculateDeadline(ev.data_avaliacao, 3)
  }

  const handleSolicitar = async () => {
    try {
      setIsRequesting(true)
      await requestProfessorChange(ev.id, currentUserId)
      setHasRequested(true)
      toast({ title: 'Solicitação enviada', description: 'O coordenador foi notificado.' })
    } catch (e: any) {
      if (e.code === '23505' || e.message?.includes('duplicate key')) {
        setHasRequested(true)
        toast({ title: 'Aviso', description: 'Você já solicitou este aluno.' })
      } else {
        toast({ variant: 'destructive', title: 'Erro', description: e.message })
      }
    } finally {
      setIsRequesting(false)
    }
  }

  return (
    <Card className="flex flex-col h-full bg-[#3f3f46] border-[#52525b] text-white shadow-lg overflow-hidden">
      <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5 min-w-0">
          <CardTitle
            className="text-[15px] font-bold uppercase tracking-wide truncate text-white"
            title={ev.nome_cliente}
          >
            {ev.nome_cliente}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-[#84cc16] text-sm font-bold">
              {ev.nao_cliente ? 'NÃO CLIENTE' : ev.evo_id ? `EVO: ${ev.evo_id}` : 'EVO: -'}
            </div>
            {ev.desafio_zander_status &&
              ev.desafio_zander_status !== 'nenhum' &&
              ev.status !== 'concluido' && (
                <span className="bg-purple-500/20 text-purple-400 border border-purple-500/50 text-[10px] px-1.5 py-0.5 rounded-full font-bold tracking-wider whitespace-nowrap">
                  #DesafioZander
                </span>
              )}
          </div>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-700 shrink-0"
              onClick={() => onHistoricoClick(ev)}
            >
              <Clock className="w-5 h-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Ver Histórico</TooltipContent>
        </Tooltip>
      </CardHeader>

      <CardContent className="p-4 pt-4 flex-grow text-sm grid grid-cols-2 gap-y-5 gap-x-2">
        <div className="flex flex-col gap-5">
          <div>
            <span className="text-zinc-400 text-[10px] font-bold tracking-wider block mb-1">
              DATA AVALIAÇÃO
            </span>
            <span className="font-bold text-white text-[15px] break-words">
              {evalDate ? format(evalDate, 'dd/MM/yyyy') : '-'}
            </span>
          </div>
          <div>
            <span className="text-zinc-400 text-[10px] font-bold tracking-wider block mb-1">
              PERÍODO
            </span>
            <span className="font-bold text-white text-[15px] capitalize break-words">
              {ev.periodo_treino || '-'}
            </span>
          </div>
          <div>
            <span className="text-zinc-400 text-[10px] font-bold tracking-wider block mb-1.5">
              PROFESSOR
            </span>
            {isCoordenador && professors ? (
              <Select
                value={ev.professor_id || 'unassigned'}
                onValueChange={(val) => onProfessorChange && onProfessorChange(ev.id, val)}
              >
                <SelectTrigger className="h-6 text-[11px] font-bold w-full rounded-md border-zinc-700 bg-zinc-800 text-white">
                  <SelectValue placeholder="-" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">-</SelectItem>
                  {professors.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : ev.professor ? (
              <span className="bg-[#84cc16] text-zinc-900 px-2.5 py-0.5 text-xs font-bold rounded-full">
                {ev.professor.nome?.split(' ')[0]}
              </span>
            ) : (
              <span className="text-zinc-500 font-bold">-</span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <span className="text-zinc-400 text-[10px] font-bold tracking-wider block mb-1">
              REAVALIAÇÃO
            </span>
            <div className="flex items-center gap-1.5 font-bold text-[#84cc16] text-[15px]">
              <div className="w-2 h-2 rounded-full bg-[#84cc16]"></div>
              {reevalDate ? format(reevalDate, 'dd/MM/yyyy') : '-'}
            </div>
          </div>
          <div>
            <span className="text-zinc-400 text-[10px] font-bold tracking-wider block mb-1">
              PRAZO (TREINO)
            </span>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 font-bold text-[#84cc16] text-[15px]">
                <div className="w-2 h-2 rounded-full bg-[#84cc16]"></div>
                {prazoTreino ? format(prazoTreino, 'dd/MM/yyyy') : '-'}
              </div>
              <span className="text-[11px] text-zinc-400 font-medium mt-0.5">3 dias úteis</span>
            </div>
          </div>
          <div>
            <span className="text-zinc-400 text-[10px] font-bold tracking-wider block mb-1.5">
              TREINO
            </span>
            <Select
              value={ev.status || 'pendente'}
              onValueChange={(val) => onStatusChange(ev.id, val)}
              disabled={!canEditTreino}
            >
              <SelectTrigger
                className={cn(
                  'h-7 text-[12px] font-bold w-full rounded-md border',
                  (!ev.status || ev.status === 'pendente') &&
                    'border-amber-500/50 text-amber-500 bg-transparent',
                  ev.status === 'em_progresso' && 'border-blue-500/50 text-blue-400 bg-blue-500/10',
                  ev.status === 'concluido' && 'border-[#84cc16]/50 text-[#84cc16] bg-[#84cc16]/10',
                  !canEditTreino && 'opacity-60 cursor-not-allowed',
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
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-2 flex flex-col gap-3">
        {isProfessor && ev.professor_id !== currentUserId && (
          <Button
            variant="outline"
            className="w-full text-xs font-bold h-8 border-purple-500/50 text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 disabled:opacity-50"
            onClick={handleSolicitar}
            disabled={isRequesting || isLoadingRequest || hasRequested}
          >
            {isLoadingRequest
              ? 'Carregando...'
              : hasRequested
                ? 'Aluno Solicitado'
                : isRequesting
                  ? 'Solicitando...'
                  : 'Solicitar Aluno'}
          </Button>
        )}
        <div className="flex items-center justify-between w-full bg-zinc-800/50 p-2 rounded-md border border-zinc-700/50">
          <span className="text-[10px] font-bold text-zinc-400 tracking-widest pl-2">LINKS</span>
          <div className="flex items-center gap-1.5 pr-1">
            <LinkIcon
              href={links.mapeamento_sintomas_url}
              icon={<HeartPulse className="w-4 h-4" />}
              tooltip="Sintomas"
            />
            <LinkIcon
              href={links.mapeamento_dor_url}
              icon={<Activity className="w-4 h-4" />}
              tooltip="Dor"
            />
            <LinkIcon href={links.bia_url} icon={<Scale className="w-4 h-4" />} tooltip="BIA" />
            <LinkIcon
              href={links.my_score_url}
              icon={<Target className="w-4 h-4" />}
              tooltip="My Score"
            />
          </div>
        </div>

        <div className="flex gap-1.5 w-full pt-1">
          <Button
            variant="outline"
            className="flex-[1] bg-zinc-700 hover:bg-zinc-600 border-zinc-600 text-white font-bold text-[11px] h-9 px-1 min-w-0 overflow-hidden"
            onClick={() => onAnotacoesClick(ev)}
          >
            <MessageSquare className="w-3.5 h-3.5 sm:mr-1.5 shrink-0" />
            <span className="truncate hidden sm:inline">Anotações</span>
          </Button>

          <Button
            className="flex-[1.2] bg-[#84cc16] hover:bg-[#65a30d] text-zinc-900 font-bold text-[11px] h-9 px-1 min-w-0 overflow-hidden"
            asChild
          >
            <Link to={`/evaluation/${ev.id}`} className="flex items-center justify-center">
              <span className="truncate">Avaliação</span>
            </Link>
          </Button>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="w-9 h-9 shrink-0 border-blue-500/50 text-blue-400 bg-transparent hover:bg-blue-500/10"
                onClick={() => setIsEditCadastroOpen(true)}
              >
                <Edit className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Editar Cadastro</TooltipContent>
          </Tooltip>

          {(isCoordenador || isAvaliador) && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="w-9 h-9 shrink-0 border-[#84cc16]/50 text-[#84cc16] bg-transparent hover:bg-[#84cc16]/10"
                  onClick={() => setIsEditAvaliacaoOpen(true)}
                >
                  <FileEdit className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Editar Avaliação</TooltipContent>
            </Tooltip>
          )}
        </div>
      </CardFooter>

      <EditarCadastroDialog
        open={isEditCadastroOpen}
        onOpenChange={setIsEditCadastroOpen}
        ev={ev}
      />
      <EditarAvaliacaoDialog
        open={isEditAvaliacaoOpen}
        onOpenChange={setIsEditAvaliacaoOpen}
        ev={ev}
      />
    </Card>
  )
}

export function EditarCadastroDialog({
  open,
  onOpenChange,
  ev,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  ev: any
}) {
  const [evoId, setEvoId] = useState(ev.evo_id || '')
  const [nome, setNome] = useState(ev.nome_cliente || '')
  const [telefone, setTelefone] = useState(ev.telefone_cliente || '')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      setEvoId(ev.evo_id || '')
      setNome(ev.nome_cliente || '')
      setTelefone(ev.telefone_cliente || '')
    }
  }, [open, ev])

  const handleSave = async () => {
    if (!nome) {
      toast({ title: 'Atenção', description: 'Nome é obrigatório.', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      await updateEvaluationFull(
        ev.id,
        { evo_id: evoId, nome_cliente: nome.trim().toUpperCase(), telefone_cliente: telefone },
        null,
      )
      toast({ title: 'Sucesso', description: 'Cadastro atualizado com sucesso.' })
      onOpenChange(false)
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] border-zinc-800 bg-zinc-900 text-white">
        <DialogHeader>
          <DialogTitle>Editar Cadastro</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Atualize as informações básicas do aluno.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor={`evo_id_${ev.id}`}>ID EVO</Label>
            <Input
              id={`evo_id_${ev.id}`}
              value={evoId}
              onChange={(e) => setEvoId(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`nome_${ev.id}`}>Nome do Cliente *</Label>
            <Input
              id={`nome_${ev.id}`}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`tel_${ev.id}`}>Telefone</Label>
            <Input
              id={`tel_${ev.id}`}
              value={telefone}
              onChange={(e) => setTelefone(formatPhone(e.target.value))}
              maxLength={19}
              className="bg-zinc-800 border-zinc-700"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || !nome}
            className="bg-[#84cc16] text-zinc-900 hover:bg-[#65a30d]"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function EditarAvaliacaoDialog({
  open,
  onOpenChange,
  ev,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  ev: any
}) {
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<{ original: any; reavaliacoes: any[] }>({
    original: null,
    reavaliacoes: [],
  })
  const [selectedId, setSelectedId] = useState<string>('')
  const [selectedType, setSelectedType] = useState<'original' | 'reavaliacao'>('original')
  const navigate = useNavigate()

  useEffect(() => {
    if (open && ev?.id) {
      if (ev.is_pre_avaliacao || !ev.data_avaliacao) {
        setHistory({ original: ev, reavaliacoes: [] })
        setSelectedId('')
        setLoading(false)
        return
      }

      setLoading(true)
      getAvaliacaoHistory(ev.id)
        .then((res) => {
          setHistory(res)
          if (res.reavaliacoes.length > 0) {
            const last = res.reavaliacoes[res.reavaliacoes.length - 1]
            setSelectedId(last.id)
            setSelectedType('reavaliacao')
          } else if (res.original) {
            setSelectedId(res.original.id)
            setSelectedType('original')
          }
          setLoading(false)
        })
        .catch((e) => {
          console.error(e)
          setLoading(false)
        })
    }
  }, [open, ev])

  const handleEdit = () => {
    if (!selectedId) return
    if (selectedType === 'original') {
      navigate(`/evaluation/edit/${selectedId}`)
    } else {
      navigate(`/reevaluation/edit/${selectedId}`)
    }
    onOpenChange(false)
  }

  const items: { id: string; label: string; date: string | null; type: string }[] = []
  if (
    history.reavaliacoes.length === 0 &&
    history.original &&
    !history.original.is_pre_avaliacao &&
    history.original.data_avaliacao
  ) {
    items.push({
      id: history.original.id,
      label: 'Avaliação Inicial',
      date: history.original.data_avaliacao,
      type: 'original',
    })
  } else if (history.reavaliacoes.length > 0) {
    history.reavaliacoes.forEach((r, idx) => {
      items.push({
        id: r.id,
        label: idx === 0 ? 'Avaliação Inicial' : `Reavaliação ${idx}`,
        date: r.data_reavaliacao,
        type: 'reavaliacao',
      })
    })
  }

  const noEval = !ev || ev.is_pre_avaliacao || !ev.data_avaliacao

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] border-zinc-800 bg-zinc-900 text-white">
        <DialogHeader>
          <DialogTitle>Editar Avaliação</DialogTitle>
          <DialogDescription className="text-zinc-400">
            {noEval ? 'Aviso sobre o aluno' : 'Selecione qual avaliação física você deseja editar.'}
          </DialogDescription>
        </DialogHeader>
        <div className="py-6">
          {loading ? (
            <div className="flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-[#84cc16]" />
            </div>
          ) : noEval ? (
            <div className="text-center p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50 text-amber-400 text-sm">
              Aluno não realizou nenhuma avaliação
            </div>
          ) : (
            <div className="space-y-3">
              <Label>Selecione a avaliação</Label>
              <Select
                value={selectedId}
                onValueChange={(val) => {
                  setSelectedId(val)
                  const item = items.find((i) => i.id === val)
                  if (item) setSelectedType(item.type as any)
                }}
              >
                <SelectTrigger className="w-full bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700 text-white max-h-[200px]">
                  {items.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.label} (
                      {item.date
                        ? format(new Date(item.date + 'T12:00:00'), 'dd/MM/yyyy')
                        : 'Sem data'}
                      )
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            {noEval ? 'Fechar' : 'Cancelar'}
          </Button>
          {!noEval && (
            <Button
              onClick={handleEdit}
              disabled={loading || !selectedId}
              className="bg-[#84cc16] text-zinc-900 hover:bg-[#65a30d]"
            >
              Editar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function LinkIcon({
  href,
  icon,
  tooltip,
}: {
  href?: string
  icon: React.ReactNode
  tooltip: string
}) {
  const isActive = !!href
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <a
          href={href || '#'}
          target={isActive ? '_blank' : undefined}
          rel={isActive ? 'noreferrer' : undefined}
          className={cn(
            'p-1.5 rounded transition-colors flex items-center justify-center',
            isActive ? 'text-[#84cc16] hover:bg-[#84cc16]/20' : 'text-zinc-600 cursor-not-allowed',
          )}
          onClick={(e) => {
            if (!isActive) e.preventDefault()
          }}
        >
          {icon}
        </a>
      </TooltipTrigger>
      {isActive && <TooltipContent>{tooltip}</TooltipContent>}
    </Tooltip>
  )
}
