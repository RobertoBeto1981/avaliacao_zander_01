import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dumbbell, Eye, EyeOff } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { signIn, session } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    if (session) navigate('/')
  }, [session, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const cleanEmail = email.trim()
    const { error } = await signIn(cleanEmail, password)
    setIsSubmitting(false)
    if (error) {
      let msg = error.message || ''
      if (msg.includes('Invalid login credentials')) {
        msg = 'E-mail ou senha incorretos. Verifique se não há espaços em branco.'
      } else if (msg.includes('Email not confirmed')) {
        msg = 'Por favor, confirme seu e-mail antes de entrar.'
      }

      if (!msg.toLowerCase().includes('refresh token') && !msg.toLowerCase().includes('session')) {
        toast({ variant: 'destructive', title: 'Erro de Login', description: msg })
      }
    } else {
      navigate('/')
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
            <CardTitle className="text-2xl font-bold tracking-tight">ZANDER Academia</CardTitle>
            <CardDescription>Acesso ao Sistema de Avaliação</CardDescription>
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
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full font-bold" disabled={isSubmitting}>
              {isSubmitting ? 'Entrando...' : 'Login'}
            </Button>
            <div className="flex flex-col space-y-2 mt-4 text-center text-sm">
              <Link to="/forgot-password" className="text-primary hover:underline">
                Esqueci minha senha
              </Link>
              <Link to="/register" className="text-muted-foreground hover:underline">
                Primeiro acesso, clique aqui
              </Link>
            </div>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => {
                localStorage.clear()
                sessionStorage.clear()
                window.location.reload()
              }}
              className="text-xs text-muted-foreground/60 hover:text-muted-foreground underline transition-colors"
            >
              Problemas para entrar? Limpar cache do aplicativo
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
