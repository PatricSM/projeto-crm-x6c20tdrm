import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import {
  Home,
  LayoutDashboard,
  UserPlus,
  CircleDollarSign,
  Users,
  Building2,
  CheckSquare,
  Bell,
  Upload,
  Settings as SettingsIcon,
  HelpCircle,
  LogOut,
  User,
} from 'lucide-react'
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface NavItem {
  label: string
  icon: React.ComponentType<{ className?: string }>
  path: string
}

const mainItems: NavItem[] = [
  { label: 'Início', icon: Home, path: '/home' },
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Leads', icon: UserPlus, path: '/leads' },
  { label: 'Deals', icon: CircleDollarSign, path: '/deals' },
  { label: 'Contatos', icon: Users, path: '/contacts' },
  { label: 'Empresas', icon: Building2, path: '/organizations' },
  { label: 'Tarefas', icon: CheckSquare, path: '/tasks' },
]

const toolsItems: NavItem[] = [
  { label: 'Notificações', icon: Bell, path: '/notifications' },
  { label: 'Importar', icon: Upload, path: '/import' },
]

const adminItems: NavItem[] = [
  { label: 'Configurações', icon: SettingsIcon, path: '/settings' },
  { label: 'Ajuda', icon: HelpCircle, path: '/help' },
]

export default function Layout() {
  const { user, signOut } = useAuth()
  const location = useLocation()

  if (!user) return <Outlet />

  const isActive = (path: string) =>
    path === '/home'
      ? location.pathname === '/home' || location.pathname === '/'
      : location.pathname === path || location.pathname.startsWith(path + '/')

  const renderGroup = (label: string | null, items: NavItem[]) => (
    <SidebarGroup>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.path}>
              <SidebarMenuButton asChild isActive={isActive(item.path)}>
                <Link to={item.path}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50">
        <Sidebar>
          <SidebarHeader className="h-16 flex items-center px-4 border-b border-sidebar-border">
            <span className="text-xl font-bold text-primary flex items-center gap-2">
              <CircleDollarSign className="w-6 h-6" /> Skip CRM
            </span>
          </SidebarHeader>
          <SidebarContent>
            {renderGroup(null, mainItems)}
            {renderGroup('Ferramentas', toolsItems)}
            {renderGroup('Sistema', adminItems)}
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col w-full overflow-hidden">
          <header className="h-16 border-b bg-white flex items-center justify-between px-4 sm:px-6 shadow-sm z-10">
            <div className="flex items-center gap-4 flex-1">
              <SidebarTrigger className="md:hidden" />
            </div>

            <div className="flex items-center gap-4">
              <Link to="/notifications">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5 text-slate-600" />
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.name}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled>
                    <User className="mr-2 h-4 w-4" />
                    <span>Meu Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={signOut} className="text-rose-500">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
