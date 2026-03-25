import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { evaluationSchema, EvaluationFormValues } from '@/schemas/evaluation'
import { createEvaluation } from '@/services/evaluations'
import { triggerPostSaveAutomation } from '@/services/automation'
import { IdentificationFields } from './eval-sections/Identification'
import { TrainingHistoryFields } from './eval-sections/TrainingHistory'
import { CurrentLifestyleFields } from './eval-sections/CurrentLifestyle'
import { HealthFields } from './eval-sections/Health'
import { TrainingFields } from './eval-sections/Training'
import { AnthropometryFields } from './eval-sections/Anthropometry'
import { VO2TestFields } from './eval-sections/VO2Test'
import { LinksFields } from './eval-sections/Links'

export default function NewEvaluation() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [existingId, setExistingId] = useState<string | null>(null)

  const form = useForm<EvaluationFormValues>({
    resolver: zodResolver(evaluationSchema),
    defaultValues: {
      data_avaliacao: new Date(),
      nome_cliente: '',
      telefone_cliente: '',
      evo_id: '',
      gender: '',
      periodo_treino: '',
      objectives: [],
      main_objective: '',
      target_date: null,
      training_frequency: '',
      activity_level: '',
      practice_time: '',
      modalities: '',
      nutritional_status: { choice: '', reason: '' },
      meals_per_day: '',
      sleep_hours: '',
      alcohol: '',
      available_days: [],
      session_duration: '',
      discovery_source: '',
      enjoys_training: [],
      dislikes_looking_at: [],
      dislikes_training: [],
      favorite_exercises: '',
      hated_exercises: '',
      supplements: { choice: false, list: '' },
      medications: { choice: false, list: '' },
      allergies: { choice: false, list: '' },
      intolerances: { choices: [], list: '' },
      smoking: { choice: false, amount: '' },
      cardio_pathology: { choice: false, list: '' },
      surgeries: { choice: false, list: '' },
      pains: { choice: false, observation: '' },
      diabetes: false,
      hypertension: false,
      respiratory_pathology: false,
      health_exams: { choice: '', notes: '' },
      health_insurance: { choice: '', other: '' },
      hemodynamics: { systolic_bp: '', diastolic_bp: '', heart_rate: '' },
      anthropometry: {
        weight: '',
        height: '',
        shoulders: '',
        chest: '',
        waist: '',
        abdomen: '',
        hips: '',
        right_arm_relaxed: '',
        right_arm_flexed: '',
        right_forearm: '',
        left_arm_relaxed: '',
        left_arm_flexed: '',
        left_forearm: '',
        right_thigh: '',
        right_calf: '',
        left_thigh: '',
        left_calf: '',
      },
      vo2_test: { enabled: false, bpm: 88, beats_15s: '', vo2_max: '', classification: '' },
      final_observations: '',
      professor_observations: '',
      emergency_contact: '',
      client_links: {
        symptoms: '',
        pain: '',
        bia: '',
        myscore: '',
      },
    },
  })

  const handleSetExistingId = (id: string | null) => {
    setExistingId(id)
  }

  const onSubmit = async (data: EvaluationFormValues) => {
    try {
      const {
        evo_id,
        nome_cliente,
        telefone_cliente,
        data_avaliacao,
        data_reavaliacao,
        periodo_treino,
        objectives,
        client_links,
        ...rest
      } = data

      const avaliacao = {
        evo_id,
        nome_cliente,
        telefone_cliente,
        data_avaliacao: format(data_avaliacao, 'yyyy-MM-dd'),
        data_reavaliacao: format(data_reavaliacao, 'yyyy-MM-dd'),
        periodo_treino,
        objectives,
        respostas: rest,
      }

      const links = {
        mapeamento_sintomas_url: client_links?.symptoms,
        mapeamento_dor_url: client_links?.pain,
        bia_url: client_links?.bia,
        my_score_url: client_links?.myscore,
      }

      const res = await createEvaluation(avaliacao, links, existingId || undefined)

      toast({ title: 'Sucesso!', description: 'Avaliação registrada com sucesso.' })

      // Disparar automações de WhatsApp e fila de vídeos
      triggerPostSaveAutomation(res.id).catch(console.error)

      navigate(`/evaluation/${res.id}`)
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erro ao salvar', description: err.message })
    }
  }

  const handleCancel = () => {
    if (window.confirm('Tem certeza que deseja cancelar? Os dados não salvos serão perdidos.')) {
      navigate('/')
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Nova Avaliação</h1>
        <Button variant="outline" onClick={handleCancel}>
          Cancelar
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-20">
          <IdentificationFields setExistingId={handleSetExistingId} />
          <TrainingHistoryFields />
          <CurrentLifestyleFields />
          <HealthFields />
          <TrainingFields />
          <AnthropometryFields />
          <VO2TestFields />
          <LinksFields />

          <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t border-border flex justify-center z-50">
            <Button
              type="submit"
              size="lg"
              className="w-full max-w-sm font-bold text-lg hover:scale-[1.02] transition-transform duration-200"
            >
              Salvar Avaliação
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
