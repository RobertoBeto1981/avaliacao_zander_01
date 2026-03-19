import { useFormContext, useWatch } from 'react-hook-form'
import { useEffect } from 'react'
import { addDays } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FInput, FSelect } from '@/components/shared/FormControls'
import { FDatePicker, FMultiSelect } from '@/components/shared/FormAdvanced'
import { PREFERRED_TIMES, OBJECTIVES } from '@/constants/options'

export function IdentificationFields() {
  const { control, setValue } = useFormContext()
  const evalDate = useWatch({ control, name: 'data_avaliacao' })

  useEffect(() => {
    if (evalDate) {
      setValue('data_reavaliacao', addDays(new Date(evalDate), 90))
    }
  }, [evalDate, setValue])

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-xl text-primary">Identificação do Cliente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 animate-fade-in">
        <div className="grid md:grid-cols-2 gap-6">
          <FInput name="nome_cliente" label="Nome do Cliente" placeholder="Ex: João da Silva" />
          <FInput
            name="telefone_cliente"
            label="Telefone do Cliente"
            placeholder="Ex: (44) 99999-9999"
          />
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <FDatePicker name="data_avaliacao" label="Data da Avaliação" />
          <FDatePicker name="data_reavaliacao" label="Data da Reavaliação" readOnly />
          <FSelect name="periodo_treino" label="Período de Treino" options={PREFERRED_TIMES} />
        </div>
        <div className="pt-4 border-t border-border">
          <FMultiSelect name="objectives" label="Objetivos" options={OBJECTIVES} />
        </div>
      </CardContent>
    </Card>
  )
}
