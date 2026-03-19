import { Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Dumbbell, LogOut } from 'lucide-react'

export default function Layout() {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(location.pathname)

  return (
    <main className="flex flex-col min-h-screen bg-background">
      {!isAuthPage && (
        <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 no-print">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-2 text-primary select-none">
              <Dumbbell size={28} strokeWidth={2.5} />
              <span className="font-extrabold text-2xl tracking-tighter uppercase">ZANDER</span>
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
