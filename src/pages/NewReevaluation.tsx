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

        const parseOptionalDate = (d?: string) => {
          if (!d) return null
          const parsed = d.includes('T') ? new Date(d) : new Date(d + 'T12:00:00')
          return isValid(parsed) ? parsed : null
        }

        form.reset({
          evo_id: data.evo_id || '',
          nome_cliente: data.nome_cliente || '',
          telefone_cliente: data.telefone_cliente || '',
          data_avaliacao: new Date(), // Hoje
          data_reavaliacao: new Date(new Date().setDate(new Date().getDate() + 90)), // +90 dias
          periodo_treino: data.periodo_treino || '',
          objectives: data.objectives || [],

          main_objective: respostas.main_objective || '',
          target_date: parseOptionalDate(respostas.target_date),
          training_frequency: respostas.training_frequency || '',
          activity_level: respostas.activity_level || '',
          practice_time: respostas.practice_time || '',
          modalities: respostas.modalities || '',
          nutritional_status: respostas.nutritional_status || {},
          meals_per_day: respostas.meals_per_day || '',
          sleep_hours: respostas.sleep_hours || '',
          supplements: respostas.supplements || { choice: false },
          medications: respostas.medications || { choice: false },
          allergies: respostas.allergies || { choice: false },
          intolerances: respostas.intolerances || { choices: [] },
          smoking: respostas.smoking || { choice: false },
          alcohol: respostas.alcohol || '',
          health_exams: respostas.health_exams || {},
          diabetes: respostas.diabetes || false,
          hypertension: respostas.hypertension || false,
          respiratory_pathology: respostas.respiratory_pathology || false,
          cardio_pathology: respostas.cardio_pathology || { choice: false },
          surgeries: respostas.surgeries || { choice: false },
          pains: respostas.pains || { choice: false },
          available_days: respostas.available_days || [],
          session_duration: respostas.session_duration || '',
          enjoys_training: respostas.enjoys_training || [],
          dislikes_looking_at: respostas.dislikes_looking_at || [],
          dislikes_training: respostas.dislikes_training || [],
          favorite_exercises: respostas.favorite_exercises || '',
          hated_exercises: respostas.hated_exercises || '',
          discovery_source: respostas.discovery_source || '',
          health_insurance: respostas.health_insurance || {},
          emergency_contact: respostas.emergency_contact || '',
          final_observations: respostas.final_observations || '',
          professor_observations: respostas.professor_observations || '',

          client_links: flatPrev.client_links,
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
              Os dados anteriores estão preenchidos. Altere apenas o que mudou.
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
          Atenção: Os campos exibem o selo <strong>Ant: valor</strong> para mostrar a resposta exata
          da última avaliação do aluno, auxiliando na comparação direta.
        </p>
      </div>

      <PrevEvalContext.Provider value={prevData}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-20">
            <fieldset disabled={isProfessor} className="space-y-8">
              {/* identification block makes name and ID readonly in re-evaluation */}
              <div className="pointer-events-none opacity-80">
                <IdentificationFields />
              </div>
              <TrainingHistoryFields />
              <CurrentLifestyleFields />
              <HealthFields />
              <TrainingFields />
            </fieldset>

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
