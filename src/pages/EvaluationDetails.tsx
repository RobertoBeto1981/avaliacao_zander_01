import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { format } from 'date-fns'
import { Printer, ChevronLeft, Dumbbell } from 'lucide-react'
import { getEvaluationById } from '@/services/evaluations'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function EvaluationDetails() {
  const { id } = useParams()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      getEvaluationById(id).then((res) => {
        setData(res)
        setLoading(false)
      })
    }
  }, [id])

  if (loading) return <div className="p-8 text-center text-muted-foreground">Carregando...</div>
  if (!data) return <div className="p-8 text-center text-destructive">Avaliação não encontrada</div>

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6 no-print">
        <Button variant="outline" asChild>
          <Link to="/">
            <ChevronLeft className="mr-2 h-4 w-4" /> Voltar
          </Link>
        </Button>
        <Button onClick={() => window.print()} className="font-bold">
          <Printer className="mr-2 h-4 w-4" /> Exportar em PDF
        </Button>
      </div>

      <Card className="border-border/50 print:border-none print:shadow-none bg-white text-black">
        <CardContent className="p-8 print:p-0">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border/50 print:border-gray-200">
            <div className="bg-[#95c23d] p-3 rounded-lg print:bg-transparent print:text-[#95c23d]">
              <Dumbbell className="w-10 h-10 text-white print:text-[#95c23d]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold uppercase tracking-tighter text-[#1d1d1b]">
                Sistema de Avaliação Física ZANDER Academia
              </h1>
              <p className="text-[#575757]">Relatório de Avaliação Física e Anamnese</p>
            </div>
          </div>

          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-4 text-[#95c23d] border-b pb-2">
                Identificação do Cliente
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Nome:</span> {data.nome_cliente}
                </div>
                <div>
                  <span className="font-medium">Telefone:</span> {data.telefone_cliente || '-'}
                </div>
                <div>
                  <span className="font-medium">Data da Avaliação:</span>{' '}
                  {format(new Date(data.data_avaliacao), 'dd/MM/yyyy')}
                </div>
                <div>
                  <span className="font-medium">Data da Reavaliação:</span>{' '}
                  {format(new Date(data.data_reavaliacao), 'dd/MM/yyyy')}
                </div>
                <div>
                  <span className="font-medium">Período de Treino:</span>{' '}
                  {data.periodo_treino || '-'}
                </div>
                <div>
                  <span className="font-medium">Avaliador:</span> {data.avaliador?.nome || '-'}
                </div>
                <div>
                  <span className="font-medium">Professor Responsável:</span>{' '}
                  {data.professor?.nome || '-'}
                </div>
                <div className="col-span-2">
                  <span className="font-medium">Objetivos:</span>{' '}
                  {data.objectives?.join(', ') || '-'}
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-[#95c23d] border-b pb-2">
                Histórico de Treinamento
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Principal Objetivo:</span>{' '}
                  {data.respostas?.main_objective || '-'}
                </div>
                <div>
                  <span className="font-medium">Frequência semanal atual:</span>{' '}
                  {data.respostas?.training_frequency || '-'}
                </div>
                <div>
                  <span className="font-medium">Nível de condicionamento atual:</span>{' '}
                  {data.respostas?.activity_level || '-'}
                </div>
                <div>
                  <span className="font-medium">Tempo de Prática:</span>{' '}
                  {data.respostas?.practice_time || '-'}
                </div>
                <div className="col-span-2">
                  <span className="font-medium">Modalidades:</span>{' '}
                  {data.respostas?.modalities || '-'}
                </div>
                {data.respostas?.target_date && (
                  <div>
                    <span className="font-medium">Data Alvo:</span>{' '}
                    {format(new Date(data.respostas.target_date), 'dd/MM/yyyy')}
                  </div>
                )}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-[#95c23d] border-b pb-2">
                Estilo de Vida Atual
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Refeições por dia:</span>{' '}
                  {data.respostas?.meals_per_day || '-'}
                </div>
                <div>
                  <span className="font-medium">Horas de Sono:</span>{' '}
                  {data.respostas?.sleep_hours || '-'}
                </div>
                <div>
                  <span className="font-medium">Consumo de bebidas alcoólicas:</span>{' '}
                  {data.respostas?.alcohol || '-'}
                </div>
                <div>
                  <span className="font-medium">Acompanhamento Nutricional:</span>{' '}
                  {data.respostas?.nutritional_status?.choice || '-'}
                </div>

                <div>
                  <span className="font-medium">Usa suplementos alimentares?</span>{' '}
                  {data.respostas?.supplements?.choice ? 'Sim' : 'Não'}
                </div>
                {data.respostas?.supplements?.choice && (
                  <div className="col-span-2">
                    <span className="font-medium">Quais:</span> {data.respostas?.supplements?.list}
                  </div>
                )}

                <div>
                  <span className="font-medium">Fuma?</span>{' '}
                  {data.respostas?.smoking?.choice ? 'Sim' : 'Não'}
                </div>
                {data.respostas?.smoking?.choice && (
                  <div>
                    <span className="font-medium">Quantidade:</span>{' '}
                    {data.respostas?.smoking?.amount}
                  </div>
                )}

                <div className="col-span-2">
                  <span className="font-medium">Intolerâncias:</span>{' '}
                  {data.respostas?.intolerances?.choices?.join(', ') || '-'}
                </div>
              </div>
            </section>

            <section className="print-break-inside-avoid">
              <h2 className="text-xl font-semibold mb-4 text-[#95c23d] border-b pb-2">
                Histórico Médico
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Diabetes:</span>{' '}
                  {data.respostas?.diabetes ? 'Sim' : 'Não'}
                </div>
                <div>
                  <span className="font-medium">Hipertensão:</span>{' '}
                  {data.respostas?.hypertension ? 'Sim' : 'Não'}
                </div>
                <div>
                  <span className="font-medium">Patologia Respiratória:</span>{' '}
                  {data.respostas?.respiratory_pathology ? 'Sim' : 'Não'}
                </div>

                <div>
                  <span className="font-medium">Remédio Contínuo?</span>{' '}
                  {data.respostas?.medications?.choice ? 'Sim' : 'Não'}
                </div>
                {data.respostas?.medications?.choice && (
                  <div>
                    <span className="font-medium">Quais:</span> {data.respostas?.medications?.list}
                  </div>
                )}

                <div>
                  <span className="font-medium">Alergias?</span>{' '}
                  {data.respostas?.allergies?.choice ? 'Sim' : 'Não'}
                </div>
                {data.respostas?.allergies?.choice && (
                  <div>
                    <span className="font-medium">Quais:</span> {data.respostas?.allergies?.list}
                  </div>
                )}

                <div>
                  <span className="font-medium">Cirurgias?</span>{' '}
                  {data.respostas?.surgeries?.choice ? 'Sim' : 'Não'}
                </div>
                {data.respostas?.surgeries?.choice && (
                  <div>
                    <span className="font-medium">Quais:</span> {data.respostas?.surgeries?.list}
                  </div>
                )}

                <div>
                  <span className="font-medium">Dores Musculares/Articulares?</span>{' '}
                  {data.respostas?.pains?.choice ? 'Sim' : 'Não'}
                </div>
                {data.respostas?.pains?.choice && (
                  <div className="col-span-2">
                    <span className="font-medium">Obs:</span> {data.respostas?.pains?.observation}
                  </div>
                )}
              </div>
            </section>

            <section className="print-break-inside-avoid">
              <h2 className="text-xl font-semibold mb-4 text-[#95c23d] border-b pb-2">
                Links Relacionados
              </h2>
              <div className="flex flex-col gap-2 text-sm">
                {data.links_avaliacao?.[0]?.anamnese_url && (
                  <div>
                    <span className="font-medium">Anamnese:</span>{' '}
                    <a
                      href={data.links_avaliacao[0].anamnese_url}
                      className="text-blue-600 underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {data.links_avaliacao[0].anamnese_url}
                    </a>
                  </div>
                )}
                {data.links_avaliacao?.[0]?.mapeamento_sintomas_url && (
                  <div>
                    <span className="font-medium">Mapeamento Sintomas:</span>{' '}
                    <a
                      href={data.links_avaliacao[0].mapeamento_sintomas_url}
                      className="text-blue-600 underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {data.links_avaliacao[0].mapeamento_sintomas_url}
                    </a>
                  </div>
                )}
                {data.links_avaliacao?.[0]?.mapeamento_dor_url && (
                  <div>
                    <span className="font-medium">Mapeamento da Dor:</span>{' '}
                    <a
                      href={data.links_avaliacao[0].mapeamento_dor_url}
                      className="text-blue-600 underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {data.links_avaliacao[0].mapeamento_dor_url}
                    </a>
                  </div>
                )}
                {data.links_avaliacao?.[0]?.bia_url && (
                  <div>
                    <span className="font-medium">BIA:</span>{' '}
                    <a
                      href={data.links_avaliacao[0].bia_url}
                      className="text-blue-600 underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {data.links_avaliacao[0].bia_url}
                    </a>
                  </div>
                )}
                {data.links_avaliacao?.[0]?.my_score_url && (
                  <div>
                    <span className="font-medium">My Score:</span>{' '}
                    <a
                      href={data.links_avaliacao[0].my_score_url}
                      className="text-blue-600 underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {data.links_avaliacao[0].my_score_url}
                    </a>
                  </div>
                )}
                {data.links_avaliacao?.[0]?.relatorio_pdf_url && (
                  <div>
                    <span className="font-medium">Relatório PDF Final:</span>{' '}
                    <a
                      href={data.links_avaliacao[0].relatorio_pdf_url}
                      className="text-red-600 underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {data.links_avaliacao[0].relatorio_pdf_url}
                    </a>
                  </div>
                )}
              </div>
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
