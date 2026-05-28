import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { FileText, Link as LinkIcon, Activity, Target, Trash2, Paperclip } from 'lucide-react'
import { getAcompanhamentos, deleteAcompanhamento } from '@/services/acompanhamentos'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'

export function ClientQuickView({
  avaliacaoId,
  onClose,
}: {
  avaliacaoId: string | null
  onClose: () => void
}) {
  const { profile } = useAuth()
  const isCoordenador = profile?.roles?.includes('coordenador') || profile?.role === 'coordenador'
  const [data, setData] = useState<any>(null)
  const [latestRespostas, setLatestRespostas] = useState<any>({})
  const [acompanhamentos, setAcompanhamentos] = useState<any[]>([])

  useEffect(() => {
    if (!avaliacaoId) return
    const fetchAv = async () => {
      const { data: av } = await supabase
        .from('avaliacoes')
        .select(`
        *,
        links_avaliacao (*),
        reavaliacoes (id, created_at, data_reavaliacao, respostas_novas)
      `)
        .eq('id', avaliacaoId)
        .single()

      if (av) {
        setData(av)
        let latest = av.respostas || {}
        if (av.reavaliacoes && av.reavaliacoes.length > 0) {
          const sortedReavs = av.reavaliacoes.sort(
            (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
          )
          latest = { ...latest, ...sortedReavs[0].respostas_novas }
        }
        setLatestRespostas(latest)
      }
    }

    const fetchAcomps = async () => {
      try {
        const result = await getAcompanhamentos(avaliacaoId)
        setAcompanhamentos(result || [])
      } catch (e) {
        console.error(e)
      }
    }

    fetchAv()
    fetchAcomps()
  }, [avaliacaoId])

  const handleDeleteAcomp = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta anotação?')) return
    try {
      await deleteAcompanhamento(id)
      setAcompanhamentos((prev) => prev.filter((a) => a.id !== id))
    } catch (e) {
      console.error(e)
    }
  }

  if (!avaliacaoId) return null

  const links = data?.links_avaliacao?.[0] || {}

  const formatDays = (days: any) => {
    if (Array.isArray(days)) return days.join(', ')
    if (typeof days === 'string') {
      try {
        const parsed = JSON.parse(days)
        if (Array.isArray(parsed)) return parsed.join(', ')
      } catch {
        /* intentionally ignored */
      }
      return days
    }
    return '-'
  }

  return (
    <Sheet open={!!avaliacaoId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="bg-zinc-900 border-zinc-800 text-zinc-100 sm:max-w-md w-full overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-white text-xl flex items-center gap-2 border-b border-zinc-800 pb-4">
            <FileText className="w-5 h-5 text-[#84cc16]" />
            {data?.nome_cliente || 'Carregando...'}
          </SheetTitle>
        </SheetHeader>

        {data && (
          <div className="mt-6 space-y-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-[#84cc16] flex items-center gap-2">
                <Target className="w-4 h-4" /> Campo Treinamento
              </h3>
              <div className="bg-zinc-800/50 p-3 rounded-md text-sm text-zinc-300 space-y-3">
                <div>
                  <span className="text-zinc-500 text-xs block mb-1">Período de Treino:</span>
                  <span className="font-medium capitalize">
                    {data.periodo_treino || latestRespostas.periodo_treino || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 text-xs block mb-1">Dias Disponíveis:</span>
                  <span className="capitalize block">
                    {formatDays(latestRespostas.dias_treino || latestRespostas.available_days)}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 text-xs block mb-1">Frequência:</span>
                  <span className="capitalize block">
                    {latestRespostas.frequencia_semanal ||
                      latestRespostas.training_frequency ||
                      '-'}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 text-xs block mb-1">Objetivos Selecionados:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {data.objectives?.length ? (
                      data.objectives.map((o: string) => (
                        <span
                          key={o}
                          className="bg-zinc-700/50 text-zinc-200 px-2 py-0.5 rounded text-xs"
                        >
                          {o}
                        </span>
                      ))
                    ) : (
                      <span>-</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-[#84cc16] flex items-center gap-2">
                <Activity className="w-4 h-4" /> Preferência de Treino
              </h3>
              <div className="bg-zinc-800/50 p-3 rounded-md text-sm text-zinc-300 space-y-3">
                <div>
                  <span className="text-zinc-500 text-xs block mb-1">Gosta de Treinar:</span>
                  <span>
                    {latestRespostas.enjoys_training?.join(', ') ||
                      latestRespostas.gosta_treinar ||
                      '-'}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 text-xs block mb-1">Não Gosta de Treinar:</span>
                  <span>
                    {latestRespostas.dislikes_training?.join(', ') ||
                      latestRespostas.nao_gosta_treinar ||
                      '-'}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 text-xs block mb-1">Exercícios Favoritos:</span>
                  <span>
                    {latestRespostas.favorite_exercises ||
                      latestRespostas.exercicios_favoritos ||
                      '-'}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 text-xs block mb-1">Exercícios que Odeia:</span>
                  <span>
                    {latestRespostas.hated_exercises || latestRespostas.exercicios_odiados || '-'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-[#84cc16]">Links e Documentos</h3>
              <div className="bg-zinc-800/50 p-3 rounded-md flex flex-col gap-3">
                {links.mapeamento_sintomas_url && (
                  <a
                    href={links.mapeamento_sintomas_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-2"
                  >
                    <LinkIcon className="w-4 h-4" /> Mapeamento de Sintomas
                  </a>
                )}
                {links.mapeamento_dor_url && (
                  <a
                    href={links.mapeamento_dor_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-2"
                  >
                    <LinkIcon className="w-4 h-4" /> Mapeamento de Dor
                  </a>
                )}
                {links.bia_url && (
                  <a
                    href={links.bia_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-2"
                  >
                    <LinkIcon className="w-4 h-4" /> BIA
                  </a>
                )}
                {links.my_score_url && (
                  <a
                    href={links.my_score_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-2"
                  >
                    <LinkIcon className="w-4 h-4" /> My Score
                  </a>
                )}
                {links.relatorio_pdf_url && (
                  <a
                    href={links.relatorio_pdf_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#84cc16] hover:text-[#65a30d] text-sm flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" /> PDF de Acompanhamento do Cliente
                  </a>
                )}

                {!links.bia_url &&
                  !links.my_score_url &&
                  !links.mapeamento_dor_url &&
                  !links.relatorio_pdf_url &&
                  !links.mapeamento_sintomas_url && (
                    <p className="text-sm text-zinc-500">Nenhum link adicionado ainda.</p>
                  )}
              </div>
            </div>

            {acompanhamentos.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-[#84cc16]">Anotações</h3>
                <div className="space-y-3">
                  {acompanhamentos.map((acomp) => (
                    <div
                      key={acomp.id}
                      className="bg-zinc-800/50 p-3 rounded-md relative group flex flex-col gap-1 border border-zinc-700/50"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-zinc-400">
                          {acomp.autor?.nome || 'Sistema'}
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          {new Date(acomp.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-300 whitespace-pre-wrap">
                        {acomp.observacao}
                      </p>
                      {acomp.file_name && (
                        <div className="flex items-center gap-1 text-xs text-blue-400 mt-1">
                          <Paperclip className="w-3 h-3" />
                          <span>{acomp.file_name}</span>
                        </div>
                      )}
                      {isCoordenador && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 w-6 h-6 text-red-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDeleteAcomp(acomp.id)}
                          title="Excluir anotação"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
