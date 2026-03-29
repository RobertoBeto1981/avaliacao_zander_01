import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dumbbell } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const cleanEmail = email.trim()
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setIsSubmitting(false)
    if (error) {
      let msg = error.message || ''
      if (msg.includes('User not found')) {
        msg = 'Usuário não encontrado com este e-mail.'
      }
      toast({ variant: 'destructive', title: 'Erro', description: msg })
    } else {
      toast({
        title: 'E-mail enviado',
        description: 'Verifique sua caixa de entrada (e spam) para redefinir a senha.',
      })
      setEmail('')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border/50 shadow-xl">
        <CardHeader className="space-y-4 items-center text-center">
          <div className="bg-primary/10 p-4 rounded-full">
            <Dumbbell className="text-primary w-12 h-12" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight">Recuperar Senha</CardTitle>
            <CardDescription>Enviaremos um link para seu e-mail</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
              />
            </div>
            <Button type="submit" className="w-full font-bold" disabled={isSubmitting}>
              {isSubmitting ? 'Enviando...' : 'Enviar Link'}
            </Button>
            <div className="text-center mt-4 text-sm text-muted-foreground">
              Lembrou a senha?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Voltar ao login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
