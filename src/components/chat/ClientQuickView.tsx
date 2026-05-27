import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { FileText, Link as LinkIcon } from 'lucide-react'

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

  return (
    <Sheet open={!!avaliacaoId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="bg-zinc-900 border-zinc-800 text-zinc-100 sm:max-w-md w-full overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-white text-xl flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#84cc16]" />
            {data?.nome_cliente || 'Carregando...'}
          </SheetTitle>
        </SheetHeader>

        {data && (
          <div className="mt-6 space-y-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-[#84cc16]">Antropometria</h3>
              <div className="bg-zinc-800/50 p-3 rounded-md text-sm text-zinc-300 grid grid-cols-2 gap-2">
                <p>
                  <span className="text-zinc-500">Peso:</span>{' '}
                  {data.respostas?.peso ? `${data.respostas.peso} kg` : 'N/A'}
                </p>
                <p>
                  <span className="text-zinc-500">Altura:</span>{' '}
                  {data.respostas?.altura ? `${data.respostas.altura} cm` : 'N/A'}
                </p>
                <p>
                  <span className="text-zinc-500">Massa Magra:</span>{' '}
                  {data.respostas?.massa_magra ? `${data.respostas.massa_magra} kg` : 'N/A'}
                </p>
                <p>
                  <span className="text-zinc-500">Gordura:</span>{' '}
                  {data.respostas?.gordura_percentual
                    ? `${data.respostas.gordura_percentual}%`
                    : 'N/A'}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-[#84cc16]">Medidas Hemodinâmicas</h3>
              <div className="bg-zinc-800/50 p-3 rounded-md text-sm text-zinc-300 grid grid-cols-2 gap-2">
                <p>
                  <span className="text-zinc-500">PA Repouso:</span>{' '}
                  {data.respostas?.pa_repouso || 'N/A'}
                </p>
                <p>
                  <span className="text-zinc-500">FC Repouso:</span>{' '}
                  {data.respostas?.fc_repouso || 'N/A'}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-[#84cc16]">Rotina de Treino</h3>
              <div className="bg-zinc-800/50 p-3 rounded-md text-sm text-zinc-300 space-y-2">
                <p>
                  <span className="text-zinc-500">Período:</span> {data.periodo_treino || 'N/A'}
                </p>
                <p>
                  <span className="text-zinc-500">Objetivos:</span>{' '}
                  {data.objectives?.join(', ') || 'N/A'}
                </p>
                <p>
                  <span className="text-zinc-500">Dias Disponíveis:</span>{' '}
                  {data.respostas?.dias_treino || 'N/A'}
                </p>
              </div>
            </div>

            {data.links_avaliacao?.[0] && (
              <div className="space-y-2">
                <h3 className="font-semibold text-[#84cc16]">Links e Documentos</h3>
                <div className="bg-zinc-800/50 p-3 rounded-md flex flex-col gap-3">
                  {data.links_avaliacao[0].bia_url && (
                    <a
                      href={data.links_avaliacao[0].bia_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-2"
                    >
                      <LinkIcon className="w-4 h-4" /> BIA
                    </a>
                  )}
                  {data.links_avaliacao[0].my_score_url && (
                    <a
                      href={data.links_avaliacao[0].my_score_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-2"
                    >
                      <LinkIcon className="w-4 h-4" /> My Score
                    </a>
                  )}
                  {data.links_avaliacao[0].mapeamento_dor_url && (
                    <a
                      href={data.links_avaliacao[0].mapeamento_dor_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-2"
                    >
                      <LinkIcon className="w-4 h-4" /> Mapeamento de Dor
                    </a>
                  )}
                  {data.links_avaliacao[0].relatorio_pdf_url && (
                    <a
                      href={data.links_avaliacao[0].relatorio_pdf_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" /> PDF de Acompanhamento do Cliente
                    </a>
                  )}
                  {!data.links_avaliacao[0].bia_url &&
                    !data.links_avaliacao[0].my_score_url &&
                    !data.links_avaliacao[0].mapeamento_dor_url &&
                    !data.links_avaliacao[0].relatorio_pdf_url && (
                      <p className="text-sm text-zinc-500">Nenhum link adicionado ainda.</p>
                    )}
                </div>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
