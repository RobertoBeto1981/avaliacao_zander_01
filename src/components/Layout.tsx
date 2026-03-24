import { Outlet, useLocation, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import {
  Dumbbell,
  LogOut,
  LayoutDashboard,
  AlertCircle,
  UserCircle,
  MessageSquare,
  PieChart,
  Video,
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import NotificationsMenu from './NotificationsMenu'

export default function Layout() {
  const { user, profile, loading, signOut } = useAuth()
  const location = useLocation()
  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(location.pathname)

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
                  {profile && profile.role === 'coordenador' && (
                    <Link
                      to="/coordinator"
                      className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${location.pathname === '/coordinator' ? 'text-primary' : 'text-muted-foreground'}`}
                    >
                      <PieChart className="w-4 h-4" />
                      Dashboard
                    </Link>
                  )}
                  {profile && profile.role === 'professor' && (
                    <Link
                      to="/professor"
                      className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${location.pathname === '/professor' ? 'text-primary' : 'text-muted-foreground'}`}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Painel do Professor
                    </Link>
                  )}
                  {profile && profile.role === 'avaliador' && (
                    <Link
                      to="/avaliador"
                      className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${location.pathname === '/avaliador' ? 'text-primary' : 'text-muted-foreground'}`}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Painel do Avaliador
                    </Link>
                  )}
                  {profile && profile.role === 'fisioterapeuta' && (
                    <Link
                      to="/fisioterapeuta"
                      className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${location.pathname === '/fisioterapeuta' ? 'text-primary' : 'text-muted-foreground'}`}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Painel do Fisioterapeuta
                    </Link>
                  )}
                  {profile && profile.role === 'nutricionista' && (
                    <Link
                      to="/nutricionista"
                      className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${location.pathname === '/nutricionista' ? 'text-primary' : 'text-muted-foreground'}`}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Painel do Nutricionista
                    </Link>
                  )}
                  {profile && profile.role === 'coordenador' && (
                    <>
                      <Link
                        to="/communications"
                        className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${location.pathname === '/communications' ? 'text-primary' : 'text-muted-foreground'}`}
                      >
                        <MessageSquare className="w-4 h-4" />
                        Comunicados
                      </Link>
                      <Link
                        to="/videos"
                        className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${location.pathname === '/videos' ? 'text-primary' : 'text-muted-foreground'}`}
                      >
                        <Video className="w-4 h-4" />
                        Vídeos
                      </Link>
                    </>
                  )}
                </nav>
              )}
            </div>

            {user && (
              <div className="flex items-center gap-4">
                <NotificationsMenu profile={profile} />
                {profile ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                        <Avatar className="h-9 w-9 border border-border">
                          <AvatarImage
                            src={profile.foto_url}
                            alt={profile.nome}
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-primary/20 text-primary">
                            {profile.nome?.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{profile.nome}</p>
                          <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/profile">
                          <UserCircle className="mr-2 h-4 w-4" />
                          <span>Meu Perfil</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={signOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sair</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button variant="ghost" size="sm" onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </Button>
                )}
              </div>
            )}
          </div>
        </header>
      )}

      {!isAuthPage && user && !loading && !profile && (
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
