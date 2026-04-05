import { useState } from 'react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { ResumenView } from '@/views/ResumenView'
import { MixIdealView } from '@/views/MixIdealView'
import { BandasView } from '@/views/BandasView'
import { AuditoriaView } from '@/views/AuditoriaView'

type ViewType = 'resumen' | 'mix' | 'bandas' | 'auditoria'

interface NavItem {
  title: string
  icon: string
  viewType: ViewType
}

const navItems: NavItem[] = [
  { title: 'Resumen', icon: '📊', viewType: 'resumen' },
  { title: 'Mix Ideal', icon: '🎯', viewType: 'mix' },
  { title: 'Bandas & Cuotas', icon: '💳', viewType: 'bandas' },
  { title: 'Auditoría Precios', icon: '🔍', viewType: 'auditoria' },
]

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('resumen')

  const renderView = () => {
    switch (currentView) {
      case 'resumen':
        return <ResumenView />
      case 'mix':
        return <MixIdealView />
      case 'bandas':
        return <BandasView />
      case 'auditoria':
        return <AuditoriaView />
      default:
        return <ResumenView />
    }
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2 py-4">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                MO
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm">MacOnline</span>
                <span className="text-xs text-muted-foreground">CyberDay 2026</span>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Vistas</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.viewType}>
                      <SidebarMenuButton
                        isActive={currentView === item.viewType}
                        onClick={() => setCurrentView(item.viewType)}
                        className="cursor-pointer"
                      >
                        <span className="mr-2">{item.icon}</span>
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 overflow-auto bg-background">
          <div className="p-6 md:p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">
                {navItems.find((item) => item.viewType === currentView)?.title}
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                Dashboard de análisis de precios y ventas para CyberDay 2026
              </p>
            </div>

            {renderView()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

export default App
