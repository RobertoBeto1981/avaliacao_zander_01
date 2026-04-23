import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams } from 'react-router-dom'
import { format, isValid } from 'date-fns'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { evaluationSchema, EvaluationFormValues } from '@/schemas/evaluation'
import { getReavaliacaoById, updateReavaliacaoFull } from '@/services/reavaliacoes'
import { triggerPostSaveAutomation } from '@/services/automation'
import { IdentificationFields } from './eval-sections/Identification'
import { TrainingHistoryFields } from './eval-sections/TrainingHistory'
import { CurrentLifestyleFields } from './eval-sections/CurrentLifestyle'
import { HealthFields } from './eval-sections/Health'
import { TrainingFields } from './eval-sections/Training'
import { AnthropometryFields } from './eval-sections/Anthropometry'
import { VO2TestFields } from './eval-sections/VO2Test'
import { LinksFields } from './eval-sections/Links'
import { Loader2, Info } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

export default function EditReevaluation() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const { profile } = useAuth()

  const userRoles = profile?.roles || (profile?.role ? [profile.role] : [])
  const isCoordenador = userRoles.includes('coordenador')
  const isAvaliadorOrHigher =
    userRoles.includes('avaliador') ||
    userRoles.includes('nutricionista') ||
    userRoles.includes('fisioterapeuta')

  const isProfessorMode = userRoles.includes('professor') && !isCoordenador && !isAvaliadorOrHigher
  const isAvaliadorMode = isAvaliadorOrHigher && !isCoordenador

  const form = useForm<EvaluationFormValues>({
    resolver: zodResolver(evaluationSchema),
  })

  useEffect(() => {
    if (!id) return
    const loadData = async () => {
      try {
        const data = await getReavaliacaoById(id)
        if (!data) throw new Error('Reavaliação não encontrada')

        const respostas = data.respostas_novas || {}
        const links = respostas.client_links || {}

        const parseDate = (d?: string) => {
          if (!d) return new Date()
          const parsed = d.includes('T') ? new Date(d) : new Date(d + 'T12:00:00')
          return isValid(parsed) ? parsed : new Date()
        }

        const parseOptionalDate = (d?: string) => {
          if (!d) return null
          const parsed = d.includes('T') ? new Date(d) : new Date(d + 'T12:00:00')
          return isValid(parsed) ? parsed : null
        }

        form.reset({
          evo_id: data.avaliacao?.evo_id || '',
          nome_cliente: data.avaliacao?.nome_cliente || '',
          telefone_cliente: data.avaliacao?.telefone_cliente || '',
          data_avaliacao: parseDate(data.data_reavaliacao),
          data_reavaliacao: new Date(
            new Date(data.data_reavaliacao + 'T12:00:00').setDate(
              new Date(data.data_reavaliacao + 'T12:00:00').getDate() + 90,
            ),
          ),
          periodo_treino: respostas.periodo_treino || '',
          objectives: respostas.objectives || [],

          data_nascimento: parseOptionalDate(respostas.data_nascimento),
          gender: respostas.gender || '',

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

          anthropometry: respostas.anthropometry || {
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
          vo2_test: respostas.vo2_test || {
            enabled: false,
            bpm: 88,
            beats_15s: '',
            vo2_max: '',
            classification: '',
          },

          client_links: {
            symptoms: links.symptoms || '',
            pain: links.pain || '',
            bia: links.bia || '',
            myscore: links.myscore || '',
          },
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

  const onInvalid = (errors: any) => {
    console.error('Form validation errors:', errors)
    toast({
      variant: 'destructive',
      title: 'Atenção',
      description: 'Verifique os campos em vermelho não preenchidos corretamente.',
    })
  }

  const onSubmit = async (data: EvaluationFormValues) => {
    try {
      const originalReav = await getReavaliacaoById(id!)
      const originalRespostas = originalReav?.respostas_novas || {}

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

      const respostasToSave: any = { ...originalRespostas, ...rest }

      if (respostasToSave.target_date && isValid(respostasToSave.target_date)) {
        respostasToSave.target_date = format(respostasToSave.target_date, 'yyyy-MM-dd')
      } else {
        respostasToSave.target_date = null
      }

      if (respostasToSave.data_nascimento && isValid(respostasToSave.data_nascimento)) {
        respostasToSave.data_nascimento = format(respostasToSave.data_nascimento, 'yyyy-MM-dd')
      } else {
        respostasToSave.data_nascimento = null
      }

      respostasToSave.periodo_treino = periodo_treino
      respostasToSave.objectives = objectives
      respostasToSave.client_links = client_links

      const evalDateStr =
        data_avaliacao && isValid(data_avaliacao)
          ? format(data_avaliacao, 'yyyy-MM-dd')
          : new Date().toISOString().split('T')[0]

      await updateReavaliacaoFull(id!, evalDateStr, respostasToSave)

      toast({ title: 'Sucesso!', description: 'Reavaliação atualizada com sucesso.' })

      if (originalReav.avaliacao_original_id) {
        triggerPostSaveAutomation(originalReav.avaliacao_original_id).catch(console.error)
      }

      navigate(`/reevaluation/${id}`)
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erro ao salvar', description: err.message })
    }
  }

  const handleCancel = () => {
    navigate(-1)
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
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Editar Histórico (Reavaliação)
        </h1>
        <Button variant="outline" onClick={handleCancel} className="w-full sm:w-auto">
          Cancelar
        </Button>
      </div>

      {isProfessorMode && (
        <div className="mb-6 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-200 flex items-start gap-3 shadow-sm">
          <Info className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm">
            <strong>Modo Professor:</strong> A avaliação original está em modo de leitura para você.
            Somente o campo de <strong>"Observações do Professor"</strong> no final da página está
            disponível para edição e prescrição.
          </p>
        </div>
      )}

      {isAvaliadorMode && (
        <div className="mb-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/50 text-blue-800 dark:text-blue-200 flex items-start gap-3 shadow-sm">
          <Info className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm">
            <strong>Modo Avaliador:</strong> Você tem acesso de edição aos dados da avaliação. As{' '}
            <strong>"Observações do Professor"</strong> são restritas e não podem ser editadas por
            você.
          </p>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-8 pb-20">
          <fieldset disabled={isProfessorMode} className="space-y-8">
            <IdentificationFields />
            <TrainingHistoryFields />
            <CurrentLifestyleFields />
            <HealthFields />
            <TrainingFields />
            <AnthropometryFields disabled={isProfessorMode} />
            <VO2TestFields disabled={isProfessorMode} />
          </fieldset>

          <LinksFields isProfessor={isProfessorMode} isAvaliador={isAvaliadorMode} />

          <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t border-border flex justify-center z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
            <Button
              type="submit"
              size="lg"
              className="w-full max-w-sm font-bold text-lg hover:scale-[1.02] transition-transform duration-200 shadow-md"
            >
              Salvar Alterações
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
