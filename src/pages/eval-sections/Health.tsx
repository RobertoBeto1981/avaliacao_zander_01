import { useFormContext, useWatch } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FInput, FSelect, FTextarea, FSwitch } from '@/components/shared/FormControls'
import { YES_NO, HEALTH_INSURANCES } from '@/constants/options'
import { searchMedicamentos, learnMedicamento, addMedicamento } from '@/services/medicamentos'
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Check, ChevronsUpDown, Loader2, Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'

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

  const [isLearning, setIsLearning] = useState(false)
  const [manualAddOpen, setManualAddOpen] = useState(false)
  const [manualAcao, setManualAcao] = useState('')
  const { toast } = useToast()

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

  const appendMedToList = (nome: string, acao: string) => {
    const currentList = getValues('medications.list') || ''
    const addition = `${nome} - ${acao}`
    setValue('medications.list', currentList ? `${currentList}\n${addition}` : addition)
  }

  const handleAddMed = async (medName: string) => {
    setIsLearning(true)
    try {
      const action = await learnMedicamento(medName)
      if (action) {
        const newMed = await addMedicamento(medName, action)
        appendMedToList(newMed.nome, newMed.acao_principal)
        toast({
          title: 'Medicamento aprendido!',
          description: `Adicionado à base de dados com a ação: ${action}`,
        })
        setMedSearchOpen(false)
        setMedQuery('')
      } else {
        setManualAddOpen(true)
      }
    } catch (e) {
      console.error(e)
      setManualAddOpen(true)
    } finally {
      setIsLearning(false)
    }
  }

  const handleManualSubmit = async () => {
    if (!manualAcao) return
    setIsLearning(true)
    try {
      const newMed = await addMedicamento(medQuery, manualAcao)
      appendMedToList(newMed.nome, newMed.acao_principal)
      toast({
        title: 'Medicamento adicionado!',
        description: `Registrado manualmente na base de dados.`,
      })
      setManualAddOpen(false)
      setMedSearchOpen(false)
      setMedQuery('')
      setManualAcao('')
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Erro ao adicionar',
        description: 'Não foi possível registrar o medicamento.',
      })
    } finally {
      setIsLearning(false)
    }
  }

  return (
    <>
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
                            {isSearching && (
                              <div className="flex items-center justify-center py-4">
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                              </div>
                            )}
                            {!isSearching && medQuery.length <= 2 && (
                              <div className="py-6 text-center text-sm text-muted-foreground">
                                Digite pelo menos 3 letras...
                              </div>
                            )}
                            {!isSearching && medQuery.length > 2 && (
                              <CommandGroup>
                                {medResults.map((med) => (
                                  <CommandItem
                                    key={med.id}
                                    value={med.nome}
                                    onSelect={() => {
                                      appendMedToList(med.nome, med.acao_principal)
                                      setMedSearchOpen(false)
                                      setMedQuery('')
                                    }}
                                  >
                                    <Check className="mr-2 h-4 w-4 opacity-0" />
                                    {med.nome}{' '}
                                    <span className="text-muted-foreground ml-1 line-clamp-1">
                                      - {med.acao_principal}
                                    </span>
                                  </CommandItem>
                                ))}

                                {!medResults.some(
                                  (m) => m.nome.toLowerCase() === medQuery.toLowerCase(),
                                ) && (
                                  <CommandItem
                                    onSelect={() => handleAddMed(medQuery)}
                                    value={`add-${medQuery}`}
                                    className="text-primary font-medium cursor-pointer"
                                    disabled={isLearning}
                                  >
                                    {isLearning ? (
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                      <Plus className="mr-2 h-4 w-4" />
                                    )}
                                    {isLearning
                                      ? 'Buscando informações...'
                                      : `Aprender e adicionar "${medQuery}"`}
                                  </CommandItem>
                                )}
                              </CommandGroup>
                            )}
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

      <Dialog open={manualAddOpen} onOpenChange={setManualAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ação não encontrada</DialogTitle>
            <DialogDescription>
              Não conseguimos encontrar automaticamente a ação para <strong>{medQuery}</strong>. Por
              favor, informe a ação principal deste medicamento para adicioná-lo à base.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Ação Principal (ex: Controle da Pressão, Protetor Gástrico)</Label>
              <Input
                value={manualAcao}
                onChange={(e) => setManualAcao(e.target.value)}
                placeholder="Ação principal..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleManualSubmit()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setManualAddOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleManualSubmit} disabled={!manualAcao || isLearning}>
              {isLearning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar e Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
