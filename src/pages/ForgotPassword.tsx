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
  const [successMessage, setSuccessMessage] = useState('')
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSuccessMessage('')
    const cleanEmail = email.trim()
    const { error } = await supabase.rpc('reset_user_password', { p_email: cleanEmail })
    setIsSubmitting(false)
    if (error) {
      let msg = error.message || ''
      if (msg.includes('Usuário não encontrado')) {
        msg = 'Usuário não encontrado com este e-mail.'
      }
      toast({ variant: 'destructive', title: 'Erro', description: msg })
    } else {
      setSuccessMessage('Sua nova senha é teste1234, volte à página de login.')
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
            <CardDescription>Digite seu e-mail para resetar sua senha</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {successMessage ? (
            <div className="space-y-4">
              <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 p-4 rounded-md text-center font-medium">
                {successMessage}
              </div>
              <Button asChild className="w-full font-bold">
                <Link to="/login">Voltar ao login</Link>
              </Button>
            </div>
          ) : (
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
                {isSubmitting ? 'Resetando...' : 'Resetar Senha'}
              </Button>
              <div className="text-center mt-4 text-sm text-muted-foreground">
                Lembrou a senha?{' '}
                <Link to="/login" className="text-primary hover:underline">
                  Voltar ao login
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
