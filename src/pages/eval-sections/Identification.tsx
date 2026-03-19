import { useFormContext, useWatch } from 'react-hook-form'
import { useEffect } from 'react'
import { addDays } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FInput, FSelect } from '@/components/shared/FormControls'
import { FDatePicker, FMultiSelect } from '@/components/shared/FormAdvanced'
import { EVALUATORS, PREFERRED_TIMES, OBJECTIVES } from '@/constants/options'

export function IdentificationFields() {
  const { control, setValue } = useFormContext()
  const evalDate = useWatch({ control, name: 'evaluation_date' })

  useEffect(() => {
    if (evalDate) {
      setValue('reevaluation_date', addDays(new Date(evalDate), 90))
    }
  }, [evalDate, setValue])

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-xl text-primary">Identificação do Cliente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 animate-fade-in">
        <div className="grid md:grid-cols-2 gap-6">
          <FInput name="client_name" label="Nome do Cliente" placeholder="Ex: João da Silva" />
          <FSelect name="evaluator_name" label="Nome do Avaliador" options={EVALUATORS} />
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <FDatePicker name="evaluation_date" label="Data da Avaliação" />
          <FDatePicker name="reevaluation_date" label="Data da Reavaliação (Automático)" readOnly />
          <FSelect name="preferred_time" label="Horário de Preferência" options={PREFERRED_TIMES} />
        </div>
        <div className="pt-4 border-t border-border">
          <FMultiSelect name="objectives" label="Objetivos" options={OBJECTIVES} />
        </div>
      </CardContent>
    </Card>
  )
}
