import { useFormContext, useWatch } from 'react-hook-form'
import { addDays, startOfDay } from 'date-fns'
import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FSelect, FTextarea } from '@/components/shared/FormControls'
import { FDatePicker } from '@/components/shared/FormAdvanced'
import { FREQUENCIES, ACTIVITY_LEVELS, PRACTICE_TIMES } from '@/constants/options'

export function TrainingHistoryFields() {
  const { control, setValue, getValues } = useFormContext()
  const evalDate = useWatch({ control, name: 'evaluation_date' })
  const selectedObjectives = useWatch({ control, name: 'objectives' }) || []

  const baseDate = evalDate ? new Date(evalDate) : new Date()
  const minTarget = addDays(startOfDay(baseDate), 30)

  useEffect(() => {
    const mainObj = getValues('main_objective')
    if (mainObj && !selectedObjectives.includes(mainObj)) {
      setValue('main_objective', '')
    }
  }, [selectedObjectives, getValues, setValue])

  const mainObjectiveOptions = selectedObjectives.length > 0 ? selectedObjectives : []

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-xl text-primary">Histórico de Treinamento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 animate-fade-in">
        <div className="grid md:grid-cols-2 gap-6">
          <FSelect
            name="main_objective"
            label="Principal Objetivo"
            options={mainObjectiveOptions}
            placeholder={
              mainObjectiveOptions.length === 0 ? 'Selecione objetivos primeiro' : 'Selecione...'
            }
          />
          <FDatePicker
            name="target_date"
            label="Data Alvo"
            disabled={(d: Date) => startOfDay(d) < minTarget}
          />
          <FSelect
            name="training_frequency"
            label="Frequência Semanal Atual"
            options={FREQUENCIES}
          />
          <FSelect
            name="activity_level"
            label="Nível de Condicionamento Atual"
            options={ACTIVITY_LEVELS}
          />
          <FSelect name="practice_time" label="Tempo de Prática" options={PRACTICE_TIMES} />
        </div>
        <FTextarea name="modalities" label="Modalidade(s)" />
      </CardContent>
    </Card>
  )
}
