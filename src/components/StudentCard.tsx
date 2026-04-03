import { useState } from 'react'
import { Link } from 'react-router-dom'
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
import { Clock, MessageSquare, Edit, Activity, Scale, HeartPulse, Target } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { requestProfessorChange } from '@/services/professor_requests'
import { calculateDeadline } from '@/lib/holidays'
import { useToast } from '@/hooks/use-toast'

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
      toast({ title: 'Solicitação enviada', description: 'O coordenador foi notificado.' })
    } catch (e: any) {
      if (e.code === '23505') {
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
            {ev.desafio_zander_status === 'ativo' && ev.status !== 'concluido' && (
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
            className="w-full text-xs font-bold h-8 border-purple-500/50 text-purple-400 bg-purple-500/10 hover:bg-purple-500/20"
            onClick={handleSolicitar}
            disabled={isRequesting}
          >
            {isRequesting ? 'Solicitando...' : 'Solicitar Aluno'}
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
            className="flex-[1.2] bg-zinc-700 hover:bg-zinc-600 border-zinc-600 text-white font-bold text-[11px] h-9 px-0 min-w-0 overflow-hidden"
            onClick={() => onAnotacoesClick(ev)}
          >
            <MessageSquare className="w-3.5 h-3.5 sm:mr-1.5 shrink-0" />
            <span className="truncate px-1">Anotações</span>
          </Button>

          <Button
            className="flex-[1.5] bg-[#84cc16] hover:bg-[#65a30d] text-zinc-900 font-bold text-[11px] h-9 px-0 min-w-0 overflow-hidden"
            asChild
          >
            <Link to={`/evaluation/${ev.id}`} className="truncate px-1">
              Avaliação
            </Link>
          </Button>

          <Button
            variant="outline"
            size="icon"
            className={cn(
              'flex-[0.4] shrink-0 h-9 border-[#84cc16] text-[#84cc16] bg-transparent hover:bg-[#84cc16]/10',
              !canEditButton && 'opacity-40 cursor-not-allowed grayscale',
            )}
            asChild={canEditButton}
            onClick={(e) => {
              if (!canEditButton) e.preventDefault()
            }}
          >
            {canEditButton ? (
              <Link to={`/evaluation/edit/${ev.id}`}>
                <Edit className="w-4 h-4 shrink-0" />
              </Link>
            ) : (
              <button type="button" disabled>
                <Edit className="w-4 h-4 shrink-0" />
              </button>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
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
