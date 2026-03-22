import { useFormContext } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import { CalendarIcon } from 'lucide-react'
import { format, isValid } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

export const FDatePicker = ({ name, label, disabled, readOnly = false }: any) => {
  const { control } = useFormContext()
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{label}</FormLabel>
          <Popover>
            <PopoverTrigger asChild disabled={readOnly}>
              <FormControl>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full pl-3 text-left font-normal',
                    !field.value && 'text-muted-foreground',
                    readOnly && 'opacity-50 cursor-not-allowed',
                  )}
                >
                  {field.value ? (
                    isValid(field.value) ? (
                      format(field.value, 'PPP', { locale: ptBR })
                    ) : (
                      <span>Data inválida</span>
                    )
                  ) : (
                    <span>Escolha uma data</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={isValid(field.value) ? field.value : undefined}
                onSelect={field.onChange}
                disabled={disabled}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export const FMultiSelect = ({ name, label, options }: any) => {
  const { control } = useFormContext()
  return (
    <FormField
      control={control}
      name={name}
      render={() => (
        <FormItem>
          <div className="mb-4">
            <FormLabel className="text-base">{label}</FormLabel>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {options.map((opt: string) => (
              <FormField
                key={opt}
                control={control}
                name={name}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value?.includes(opt)}
                        onCheckedChange={(checked) => {
                          return checked
                            ? field.onChange([...(field.value || []), opt])
                            : field.onChange(field.value?.filter((value: string) => value !== opt))
                        }}
                      />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer select-none leading-tight">
                      {opt}
                    </FormLabel>
                  </FormItem>
                )}
              />
            ))}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
