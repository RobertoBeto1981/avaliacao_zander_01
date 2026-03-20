import { useFormContext, useWatch } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FInput, FSelect, FTextarea, FSwitch } from '@/components/shared/FormControls'
import { YES_NO, HEALTH_INSURANCES } from '@/constants/options'
import { searchMedicamentos } from '@/services/medicamentos'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react'

export function HealthFields() {
  const { control, setValue, getValues } = useFormContext()

  const medChoice = useWatch({ control, name: 'medications.choice' })
  const allergyChoice = useWatch({ control, name: 'allergies.choice' })
  const cardioChoice = useWatch({ control, name: 'cardio_pathology.choice' })
  const surgChoice = useWatch({ control, name: 'surgeries.choice' })
  const painChoice = useWatch({ control, name: 'pains.choice' })
  const insuranceChoice = useWatch({ control, name: 'health_insurance.choice' })

  const [medSearchOpen, setMedSearchOpen] = useState(false)
  const [medQuery, setMedQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [medResults, setMedResults] = useState<
    { id: string; nome: string; acao_principal: string }[]
  >([])

  useEffect(() => {
    if (painChoice) {
      if (!getValues('pains.observation'))
        setValue('pains.observation', 'Observar Mapeamento de Dor')
    }
  }, [painChoice, setValue, getValues])

  useEffect(() => {
    let isMounted = true

    const fetchMeds = async () => {
      if (medQuery.length > 2) {
        setIsSearching(true)
        const results = await searchMedicamentos(medQuery)
        if (isMounted) {
          setMedResults(results)
          setIsSearching(false)
        }
      } else {
        setMedResults([])
        setIsSearching(false)
      }
    }

    const timeoutId = setTimeout(fetchMeds, 300)
    return () => {
      isMounted = false
      clearTimeout(timeoutId)
    }
  }, [medQuery])

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-xl text-primary">Histórico Médico</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 animate-fade-in">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <FSwitch name="medications.choice" label="Remédio Contínuo?" />
            {medChoice && (
              <div className="animate-slide-up space-y-4">
                <div className="flex flex-col space-y-2">
                  <Label>Buscar e Adicionar Medicamento</Label>
                  <Popover open={medSearchOpen} onOpenChange={setMedSearchOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={medSearchOpen}
                        className="justify-between text-muted-foreground font-normal"
                      >
                        Selecione um medicamento...
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] md:w-[400px] p-0" align="start">
                      <Command shouldFilter={false}>
                        <CommandInput
                          placeholder="Nome ou ação (ex: losartana, pressão)..."
                          value={medQuery}
                          onValueChange={setMedQuery}
                        />
                        <CommandList>
                          <CommandEmpty>
                            {isSearching ? (
                              <div className="flex items-center justify-center py-4">
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                              </div>
                            ) : medQuery.length > 2 ? (
                              'Nenhum medicamento encontrado.'
                            ) : (
                              'Digite pelo menos 3 letras...'
                            )}
                          </CommandEmpty>
                          <CommandGroup>
                            {medResults.map((med) => (
                              <CommandItem
                                key={med.id}
                                value={med.nome}
                                onSelect={() => {
                                  const currentList = getValues('medications.list') || ''
                                  const addition = `${med.nome} - ${med.acao_principal}`
                                  setValue(
                                    'medications.list',
                                    currentList ? `${currentList}\n${addition}` : addition,
                                  )
                                  setMedSearchOpen(false)
                                  setMedQuery('')
                                }}
                              >
                                <Check className="mr-2 h-4 w-4 opacity-0" />
                                {med.nome}{' '}
                                <span className="text-muted-foreground ml-1">
                                  - {med.acao_principal}
                                </span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <FTextarea
                  name="medications.list"
                  label="Lista de Medicamentos"
                  className="min-h-[100px]"
                />
              </div>
            )}
          </div>
          <div className="space-y-4">
            <FSwitch name="allergies.choice" label="Possui Alergia?" />
            {allergyChoice && (
              <div className="animate-slide-up">
                <FTextarea name="allergies.list" label="Qual?" />
              </div>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-border">
          <FSelect
            name="health_exams.choice"
            label="Exames (Colesterol/Glicose) Alterados?"
            options={YES_NO}
          />
          <FTextarea name="health_exams.notes" label="Observações sobre Exames" />
          <FSwitch name="diabetes" label="Diabetes" />
          <FSwitch name="hypertension" label="Hipertenso" />
          <FSwitch name="respiratory_pathology" label="Patologia Respiratória" />
          <div className="space-y-4">
            <FSwitch name="cardio_pathology.choice" label="Patologia Cardiovascular?" />
            {cardioChoice && (
              <div className="animate-slide-up">
                <FTextarea name="cardio_pathology.list" label="Qual?" />
              </div>
            )}
          </div>
          <div className="space-y-4">
            <FSwitch name="surgeries.choice" label="Cirurgia?" />
            {surgChoice && (
              <div className="animate-slide-up">
                <FTextarea name="surgeries.list" label="Qual?" />
              </div>
            )}
          </div>
          <div className="space-y-4">
            <FSwitch name="pains.choice" label="Dor Muscular/Articular?" />
            {painChoice && (
              <div className="animate-slide-up">
                <FTextarea name="pains.observation" label="Observações da Dor" />
              </div>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-border">
          <div className="space-y-4">
            <FSelect
              name="health_insurance.choice"
              label="Plano de Saúde"
              options={HEALTH_INSURANCES}
            />
            {insuranceChoice === 'OUTRO' && (
              <div className="animate-slide-up">
                <FInput name="health_insurance.other" label="Qual Plano?" />
              </div>
            )}
          </div>
          <FInput
            name="emergency_contact"
            label="Contato de Emergência"
            placeholder="Nome, telefone e grau de parentesco"
          />
        </div>
      </CardContent>
    </Card>
  )
}
