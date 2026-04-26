import { useFormContext, useWatch } from 'react-hook-form'
import { useEffect, useState, useMemo } from 'react'
import { addDays, differenceInYears } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FInput, FSelect, FPhoneInput } from '@/components/shared/FormControls'
import { FDatePicker, FMultiSelect } from '@/components/shared/FormAdvanced'
import { PREFERRED_TIMES, OBJECTIVES, GENDERS } from '@/constants/options'
import { Button } from '@/components/ui/button'
import { Search, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

export function IdentificationFields({
  setExistingId,
}: {
  setExistingId?: (id: string | null) => void
}) {
  const { control, setValue } = useFormContext()
  const evalDate = useWatch({ control, name: 'data_avaliacao' })
  const evoId = useWatch({ control, name: 'evo_id' })
  const dataNascimento = useWatch({ control, name: 'data_nascimento' })
  const [isSearching, setIsSearching] = useState(false)
  const { toast } = useToast()

  const idade = useMemo(() => {
    if (!dataNascimento) return null
    return differenceInYears(new Date(), new Date(dataNascimento))
  }, [dataNascimento])

  useEffect(() => {
    if (evalDate) {
      setValue('data_reavaliacao', addDays(new Date(evalDate), 90))
    }
  }, [evalDate, setValue])

  const handleSearchEvo = async () => {
    if (!evoId) return
    setIsSearching(true)
    try {
      const cleanEvoId = String(evoId).trim()

      const { data: preEval, error } = await supabase
        .from('avaliacoes')
        .select('*')
        .eq('evo_id', cleanEvoId)
        .eq('is_pre_avaliacao', true)
        .in('status', ['pendente', 'em_progresso'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) throw error

      if (preEval) {
        setValue('nome_cliente', preEval.nome_cliente)
        if (preEval.telefone_cliente) {
          setValue('telefone_cliente', preEval.telefone_cliente)
        }
        if (setExistingId) setExistingId(preEval.id)
        toast({
          title: 'Aluno Encontrado',
          description: 'Dados da pré-avaliação carregados com sucesso.',
        })
      } else {
        toast({
          title: 'Não Encontrado',
          description: 'Nenhuma pré-avaliação pendente encontrada para este ID EVO.',
          variant: 'default',
        })
        if (setExistingId) setExistingId(null)
      }
    } catch (e: any) {
      toast({ title: 'Erro na Busca', description: e.message, variant: 'destructive' })
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-xl text-primary">Identificação do Cliente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 animate-fade-in">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <FInput name="evo_id" label="ID EVO" placeholder="Ex: 12345" />
          </div>
          <Button
            type="button"
            onClick={handleSearchEvo}
            disabled={!evoId || isSearching}
            variant="secondary"
            className="mb-[2px]"
          >
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Search className="w-4 h-4 mr-2" />
            )}
            Buscar Aluno
          </Button>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <FInput name="nome_cliente" label="Nome do Cliente" placeholder="Ex: João da Silva" />
          <FPhoneInput
            name="telefone_cliente"
            label="Telefone do Cliente"
            placeholder="+55 (44) 99999-9999"
          />
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex gap-4 items-start">
            <div className="flex-1">
              <FDatePicker
                name="data_nascimento"
                label="Data de Nascimento"
                calendarProps={{
                  captionLayout: 'dropdown',
                  startMonth: new Date(1920, 0),
                  endMonth: new Date(),
                }}
              />
            </div>
            {idade !== null && (
              <div className="pt-[34px]">
                <span className="text-sm font-medium text-primary bg-primary/10 px-4 py-2.5 rounded-md border border-primary/20">
                  {idade} anos
                </span>
              </div>
            )}
          </div>
          <FSelect name="gender" label="Gênero (Para Cálculos)" options={GENDERS} />
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
