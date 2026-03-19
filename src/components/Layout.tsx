import { Outlet, useLocation, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Dumbbell, LogOut, LayoutDashboard, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function Layout() {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(location.pathname)
  const [profile, setProfile] = useState<any>(null)
  const [profileLoading, setProfileLoading] = useState(false)

  useEffect(() => {
    let mounted = true

    if (user) {
      setProfileLoading(true)
      // Use maybeSingle() instead of single() to avoid HTTP 406 (PGRST116)
      // when the user profile hasn't finished synchronizing yet.
      supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()
        .then(({ data, error }) => {
          if (mounted) {
            if (!error && data) {
              setProfile(data)
            } else {
              if (error) console.error('Failed to fetch user profile:', error)
              setProfile(null) // Safe fallback state
            }
            setProfileLoading(false)
          }
        })
    } else {
      setProfile(null)
      setProfileLoading(false)
    }

    return () => {
      mounted = false
    }
  }, [user])

  return (
    <main className="flex flex-col min-h-screen bg-background">
      {!isAuthPage && (
        <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 no-print">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-2 text-primary select-none">
                <Dumbbell size={28} strokeWidth={2.5} />
                <span className="font-extrabold text-2xl tracking-tighter uppercase">ZANDER</span>
              </Link>

              {user && (
                <nav className="hidden md:flex items-center gap-6">
                  <Link
                    to="/"
                    className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname === '/' ? 'text-primary' : 'text-muted-foreground'}`}
                  >
                    Início
                  </Link>
                  {profile && ['professor', 'coordenador'].includes(profile.role) && (
                    <Link
                      to="/professor"
                      className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${location.pathname === '/professor' ? 'text-primary' : 'text-muted-foreground'}`}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Painel do Professor
                    </Link>
                  )}
                </nav>
              )}
            </div>

            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Button>
            )}
          </div>
        </header>
      )}

      {/* Fallback UI if the user exists but the profile record is completely missing */}
      {!isAuthPage && user && !profileLoading && !profile && (
        <div className="container mt-6 no-print animate-fade-in-down">
          <Alert
            variant="destructive"
            className="border-destructive/50 bg-destructive/10 text-destructive"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Perfil em Sincronização</AlertTitle>
            <AlertDescription>
              Os dados do seu perfil ainda estão sendo sincronizados ou não foram encontrados.
              Algumas funcionalidades da plataforma podem estar limitadas temporariamente. Tente
              recarregar a página em alguns instantes.
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className="flex-1">
        <Outlet />
      </div>
    </main>
  )
}
