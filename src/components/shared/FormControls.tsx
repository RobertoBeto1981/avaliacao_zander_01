import { useFormContext } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { PrevEvalContext } from '@/contexts/PrevEvalContext'
import { useContext } from 'react'

const getNestedValue = (obj: any, path: string) => {
  if (!obj) return undefined
  return path.split('.').reduce((acc: any, part: string) => acc && acc[part], obj)
}

export const PrevEvalBadge = ({ name }: { name: string }) => {
  const prevData = useContext(PrevEvalContext)
  if (!prevData) return null

  // Não exibe o indicativo para campos de identificação pré-preenchidos ou links
  if (
    ['evo_id', 'nome_cliente', 'telefone_cliente'].includes(name) ||
    name.startsWith('client_links.')
  ) {
    return null
  }

  let val = getNestedValue(prevData, name)
  if (val === undefined || val === null || val === '') return null

  if (typeof val === 'boolean') val = val ? 'Sim' : 'Não'
  if (Array.isArray(val)) val = val.join(', ')
  if (val instanceof Date) {
    val = val.toISOString().split('T')[0]
  }

  return (
    <span
      className="text-[10px] text-red-700 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 px-1.5 py-0.5 rounded ml-2 font-medium line-clamp-1 max-w-[200px]"
      title={String(val)}
    >
      Ant: {String(val)}
    </span>
  )
}

export const FInput = ({ name, label, placeholder, type = 'text', disabled, ...props }: any) => {
  const { control } = useFormContext()
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center">
            {label}
            <PrevEvalBadge name={name} />
          </FormLabel>
          <FormControl>
            <Input
              placeholder={placeholder}
              type={type}
              disabled={disabled}
              {...field}
              value={field.value || ''}
              {...props}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export const FPhoneInput = ({ name, label, placeholder, disabled, ...props }: any) => {
  const { control } = useFormContext()
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          let val = e.target.value.replace(/\D/g, '')
          if (val.startsWith('55')) val = val.substring(2)

          let formatted = '+55 '
          if (val.length > 0) formatted += '(' + val.substring(0, 2)
          if (val.length >= 3) formatted += ') ' + val.substring(2, 7)
          if (val.length >= 8) formatted += '-' + val.substring(7, 11)

          if (val.length === 0) formatted = ''

          field.onChange(formatted)
        }

        return (
          <FormItem>
            <FormLabel className="flex items-center">
              {label}
              <PrevEvalBadge name={name} />
            </FormLabel>
            <FormControl>
              <Input
                placeholder={placeholder || '+55 (00) 00000-0000'}
                {...field}
                value={field.value || ''}
                onChange={handleChange}
                maxLength={19}
                disabled={disabled}
                {...props}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}

export const FTextarea = ({ name, label, placeholder, disabled, ...props }: any) => {
  const { control } = useFormContext()
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center">
            {label}
            <PrevEvalBadge name={name} />
          </FormLabel>
          <FormControl>
            <Textarea
              placeholder={placeholder}
              disabled={disabled}
              {...field}
              value={field.value || ''}
              {...props}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export const FSelect = ({ name, label, options, placeholder = 'Selecione...', disabled }: any) => {
  const { control } = useFormContext()
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center">
            {label}
            <PrevEvalBadge name={name} />
          </FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value || ''}
            value={field.value || ''}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((o: string) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export const FSwitch = ({ name, label, className, disabled }: any) => {
  const { control } = useFormContext()
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem
          className={cn(
            'flex flex-row items-center justify-between rounded-lg border border-border p-4 shadow-sm',
            className,
          )}
        >
          <FormLabel className="text-base font-medium flex items-center">
            {label}
            <PrevEvalBadge name={name} />
          </FormLabel>
          <FormControl>
            <Switch checked={field.value} onCheckedChange={field.onChange} disabled={disabled} />
          </FormControl>
        </FormItem>
      )}
    />
  )
}
