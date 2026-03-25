import { useState, useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
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

function AutoSaver({ form }: { form: any }) {
  const values = useWatch({ control: form.control })

  useEffect(() => {
    if (values && Object.keys(values).length > 0) {
      const timer = setTimeout(() => {
        localStorage.setItem('evaluationDraft', JSON.stringify(form.getValues()))
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [values, form])

  return null
}

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

  // Load draft from localStorage on mount
  useEffect(() => {
    const draft = localStorage.getItem('evaluationDraft')
    if (draft) {
      try {
        const parsed = JSON.parse(draft)

        // Restore dates correctly
        if (parsed.data_avaliacao) parsed.data_avaliacao = new Date(parsed.data_avaliacao)
        if (parsed.data_reavaliacao) parsed.data_reavaliacao = new Date(parsed.data_reavaliacao)
        if (parsed.target_date) parsed.target_date = new Date(parsed.target_date)
        if (parsed.data_nascimento) parsed.data_nascimento = new Date(parsed.data_nascimento)

        form.reset(parsed)

        toast({
          title: 'Rascunho recuperado',
          description: 'Seus dados preenchidos anteriormente foram restaurados.',
        })
      } catch (e) {
        console.error('Failed to parse evaluation draft', e)
      }
    }

    const existingIdDraft = localStorage.getItem('evaluationDraftExistingId')
    if (existingIdDraft) setExistingId(existingIdDraft)
  }, [form, toast])

  // Listener para capturar o disparo forçado de salvamento dos Selects/Inputs
  useEffect(() => {
    const handleForceSave = () => {
      const currentValues = form.getValues()
      if (currentValues && Object.keys(currentValues).length > 0) {
        localStorage.setItem('evaluationDraft', JSON.stringify(currentValues))
      }
    }
    window.addEventListener('force-autosave', handleForceSave)
    return () => window.removeEventListener('force-autosave', handleForceSave)
  }, [form])

  const handleSetExistingId = (id: string | null) => {
    setExistingId(id)
    if (id) {
      localStorage.setItem('evaluationDraftExistingId', id)
    } else {
      localStorage.removeItem('evaluationDraftExistingId')
    }
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

      // Clear draft on successful submission
      localStorage.removeItem('evaluationDraft')
      localStorage.removeItem('evaluationDraftExistingId')

      toast({ title: 'Sucesso!', description: 'Avaliação registrada com sucesso.' })

      // Disparar automações de WhatsApp e fila de vídeos
      triggerPostSaveAutomation(res.id).catch(console.error)

      navigate(`/evaluation/${res.id}`)
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erro ao salvar', description: err.message })
    }
  }

  const handleCancel = () => {
    if (window.confirm('Tem certeza que deseja cancelar? O rascunho atual será perdido.')) {
      localStorage.removeItem('evaluationDraft')
      localStorage.removeItem('evaluationDraftExistingId')
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
          <AutoSaver form={form} />

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
