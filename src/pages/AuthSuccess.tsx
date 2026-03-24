import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

export default function AuthSuccess() {
  const { session } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Redireciona automaticamente para o Início caso já exista uma sessão
    if (session) {
      const timer = setTimeout(() => navigate('/'), 4000)
      return () => clearTimeout(timer)
    }
  }, [session, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 animate-fade-in-up">
      <Card className="w-full max-w-md border-border/50 shadow-xl text-center">
        <CardHeader className="space-y-4 items-center">
          <div className="bg-primary/20 p-4 rounded-full text-primary">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Cadastro Autorizado!
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Seu acesso foi validado com sucesso e está pronto para uso.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-muted-foreground text-sm">
            Você já pode acessar o sistema com as credenciais que acabou de criar.
          </p>
          <Button asChild className="w-full font-bold h-12 text-lg">
            <Link to="/">Acessar Sistema</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
