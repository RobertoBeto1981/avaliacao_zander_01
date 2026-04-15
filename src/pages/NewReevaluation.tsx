import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams } from 'react-router-dom'
import { format, isValid } from 'date-fns'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { evaluationSchema, EvaluationFormValues } from '@/schemas/evaluation'
import { getEvaluationById } from '@/services/evaluations'
import { createReavaliacao, calculateEvolucao } from '@/services/reavaliacoes'
import { PrevEvalContext } from '@/contexts/PrevEvalContext'
import { IdentificationFields } from './eval-sections/Identification'
import { TrainingHistoryFields } from './eval-sections/TrainingHistory'
import { CurrentLifestyleFields } from './eval-sections/CurrentLifestyle'
import { HealthFields } from './eval-sections/Health'
import { TrainingFields } from './eval-sections/Training'
import { AnthropometryFields } from './eval-sections/Anthropometry'
import { VO2TestFields } from './eval-sections/VO2Test'
import { LinksFields } from './eval-sections/Links'
import { Loader2, Repeat, Info } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

export default function NewReevaluation() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [prevData, setPrevData] = useState<any>(null)
  const { profile } = useAuth()

  const isProfessor = profile?.role === 'professor'
  const isAvaliador = profile?.role === 'avaliador'

  const form = useForm<EvaluationFormValues>({
    resolver: zodResolver(evaluationSchema),
  })

  useEffect(() => {
    if (!id) return
    const loadData = async () => {
      try {
        const data = await getEvaluationById(id)
        if (!data) throw new Error('Avaliação não encontrada')

        const respostas = data.respostas || {}
        const links = data.links_avaliacao?.[0] || {}

        const flatPrev = {
          ...data,
          ...respostas,
          client_links: {
            symptoms: links.mapeamento_sintomas_url || '',
            pain: links.mapeamento_dor_url || '',
            bia: links.bia_url || '',
            myscore: links.my_score_url || '',
          },
        }
        setPrevData(flatPrev)

        form.reset({
          evo_id: data.evo_id || '',
          nome_cliente: data.nome_cliente || '',
          telefone_cliente: data.telefone_cliente || '',
          data_avaliacao: new Date(), // Hoje
          data_reavaliacao: new Date(new Date().setDate(new Date().getDate() + 90)), // +90 dias
          data_nascimento: respostas.data_nascimento
            ? new Date(respostas.data_nascimento)
            : undefined,
          gender: respostas.gender || '',

          // Demais campos não são preenchidos na reavaliação para obrigar o avaliador a perguntar
          periodo_treino: '',
          objectives: [],
          main_objective: '',
          target_date: null,
          training_frequency: '',
          activity_level: '',
          practice_time: '',
          modalities: '',
          nutritional_status: {},
          meals_per_day: '',
          sleep_hours: '',
          supplements: { choice: false },
          medications: { choice: false },
          allergies: { choice: false },
          intolerances: { choices: [] },
          smoking: { choice: false },
          alcohol: '',
          health_exams: {},
          diabetes: false,
          hypertension: false,
          respiratory_pathology: false,
          cardio_pathology: { choice: false },
          surgeries: { choice: false },
          pains: { choice: false },
          available_days: [],
          session_duration: '',
          enjoys_training: [],
          dislikes_looking_at: [],
          dislikes_training: [],
          favorite_exercises: '',
          hated_exercises: '',
          discovery_source: '',
          health_insurance: {},
          emergency_contact: '',
          final_observations: '',
          professor_observations: '',

          anthropometry: {},
          vo2_test: { enabled: false, bpm: 88 },
          client_links: {},
        })
      } catch (err: any) {
        toast({ variant: 'destructive', title: 'Erro', description: err.message })
        navigate(-1)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id, form, navigate, toast])

  const onSubmit = async (data: EvaluationFormValues) => {
    try {
      const {
        evo_id,
        nome_cliente,
        telefone_cliente,
        data_avaliacao,
        data_reavaliacao,
        ...respostasNovas
      } = data

      if (respostasNovas.target_date && isValid(respostasNovas.target_date)) {
        respostasNovas.target_date = format(respostasNovas.target_date, 'yyyy-MM-dd') as any
      } else {
        respostasNovas.target_date = null
      }

      const evolucao = calculateEvolucao(prevData?.respostas || {}, respostasNovas)

      const evalDateStr =
        data_avaliacao && isValid(data_avaliacao)
          ? format(data_avaliacao, 'yyyy-MM-dd')
          : new Date().toISOString().split('T')[0]

      const result = await createReavaliacao(id!, respostasNovas, evolucao, evalDateStr)

      toast({ title: 'Sucesso!', description: 'Reavaliação registrada com sucesso.' })

      navigate(`/reevaluation/${result.id}`)
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erro ao salvar', description: err.message })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl animate-fade-in">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg text-green-600 dark:text-green-500">
            <Repeat className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Nova Reavaliação</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Preencha os dados atuais do aluno. Os indicativos em vermelho mostram a resposta
              anterior.
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => navigate(-1)} className="w-full sm:w-auto">
          Cancelar
        </Button>
      </div>

      <div className="mb-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/50 text-blue-800 dark:text-blue-200 flex items-start gap-3 shadow-sm">
        <Info className="w-5 h-5 shrink-0 mt-0.5" />
        <p className="text-sm">
          Atenção: Os campos de anamnese estão em branco para que você pergunte novamente ao
          cliente. O selo <strong>Ant: valor</strong> exibe a resposta exata da última avaliação
          para auxiliar na comparação. A data de nascimento e o gênero foram preenchidos
          automaticamente.
        </p>
      </div>

      <PrevEvalContext.Provider value={prevData}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-20">
            <div className="space-y-8">
              <IdentificationFields />
              <TrainingHistoryFields />
              <CurrentLifestyleFields />
              <HealthFields />
              <TrainingFields />
              <AnthropometryFields />
              <VO2TestFields />
            </div>

            <LinksFields isProfessor={isProfessor} isAvaliador={isAvaliador} />

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t border-border flex justify-center z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
              <Button
                type="submit"
                size="lg"
                className="w-full max-w-sm font-bold text-lg hover:scale-[1.02] transition-transform duration-200 shadow-md"
              >
                Concluir Reavaliação
              </Button>
            </div>
          </form>
        </Form>
      </PrevEvalContext.Provider>
    </div>
  )
}
