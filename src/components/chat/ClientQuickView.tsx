import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { FileText, Link as LinkIcon, Activity, Target } from 'lucide-react'

export function ClientQuickView({
  avaliacaoId,
  onClose,
}: {
  avaliacaoId: string | null
  onClose: () => void
}) {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    if (!avaliacaoId) return
    const fetchAv = async () => {
      const { data: av } = await supabase
        .from('avaliacoes')
        .select(`
        *,
        links_avaliacao (*)
      `)
        .eq('id', avaliacaoId)
        .single()
      setData(av)
    }
    fetchAv()
  }, [avaliacaoId])

  if (!avaliacaoId) return null

  const respostas = data?.respostas || {}
  const links = data?.links_avaliacao?.[0] || {}

  // Extrair circunferências se existirem de forma plana ou em objeto aninhado
  const getCirc = (key: string) =>
    respostas[key] || respostas.circunferencias?.[key] || respostas.medidas?.[key]

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
                <Activity className="w-4 h-4" /> Antropometria
              </h3>
              <div className="bg-zinc-800/50 p-3 rounded-md text-sm text-zinc-300 grid grid-cols-2 gap-y-3 gap-x-2">
                <p>
                  <span className="text-zinc-500 block text-xs">Peso</span>
                  {respostas.peso ? `${respostas.peso} kg` : '-'}
                </p>
                <p>
                  <span className="text-zinc-500 block text-xs">Altura</span>
                  {respostas.altura ? `${respostas.altura} cm` : '-'}
                </p>
                <p>
                  <span className="text-zinc-500 block text-xs">Massa Magra</span>
                  {respostas.massa_magra ? `${respostas.massa_magra} kg` : '-'}
                </p>
                <p>
                  <span className="text-zinc-500 block text-xs">Gordura</span>
                  {respostas.gordura_percentual ? `${respostas.gordura_percentual}%` : '-'}
                </p>

                {/* Circunferências Comuns */}
                {getCirc('cintura') && (
                  <p>
                    <span className="text-zinc-500 block text-xs">Cintura</span>
                    {getCirc('cintura')} cm
                  </p>
                )}
                {getCirc('abdomen') && (
                  <p>
                    <span className="text-zinc-500 block text-xs">Abdômen</span>
                    {getCirc('abdomen')} cm
                  </p>
                )}
                {getCirc('quadril') && (
                  <p>
                    <span className="text-zinc-500 block text-xs">Quadril</span>
                    {getCirc('quadril')} cm
                  </p>
                )}
                {getCirc('braco_direito') && (
                  <p>
                    <span className="text-zinc-500 block text-xs">Braço Dir.</span>
                    {getCirc('braco_direito')} cm
                  </p>
                )}
                {getCirc('coxa_direita') && (
                  <p>
                    <span className="text-zinc-500 block text-xs">Coxa Dir.</span>
                    {getCirc('coxa_direita')} cm
                  </p>
                )}
                {getCirc('panturrilha_direita') && (
                  <p>
                    <span className="text-zinc-500 block text-xs">Panturrilha Dir.</span>
                    {getCirc('panturrilha_direita')} cm
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-[#84cc16]">Medidas Hemodinâmicas</h3>
              <div className="bg-zinc-800/50 p-3 rounded-md text-sm text-zinc-300 grid grid-cols-2 gap-2">
                <p>
                  <span className="text-zinc-500 block text-xs">PA Repouso</span>{' '}
                  {respostas.pa_repouso || '-'}
                </p>
                <p>
                  <span className="text-zinc-500 block text-xs">FC Repouso</span>{' '}
                  {respostas.fc_repouso || '-'}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-[#84cc16] flex items-center gap-2">
                <Target className="w-4 h-4" /> Rotina & Objetivos
              </h3>
              <div className="bg-zinc-800/50 p-3 rounded-md text-sm text-zinc-300 space-y-3">
                <div>
                  <span className="text-zinc-500 text-xs block mb-1">Período de Treino:</span>
                  <span className="font-medium capitalize">{data.periodo_treino || '-'}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-zinc-500 text-xs block mb-1">Dias Disponíveis:</span>
                    <span>{respostas.dias_treino || '-'}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 text-xs block mb-1">Frequência:</span>
                    <span>{respostas.frequencia_semanal || '-'}</span>
                  </div>
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
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
