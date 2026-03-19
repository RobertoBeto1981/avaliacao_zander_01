import { Outlet, useLocation, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Dumbbell, LogOut, LayoutDashboard } from 'lucide-react'

export default function Layout() {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(location.pathname)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    if (user) {
      supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()
        .then(({ data }) => setProfile(data))
    } else {
      setProfile(null)
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
      <div className="flex-1">
        <Outlet />
      </div>
    </main>
  )
}
