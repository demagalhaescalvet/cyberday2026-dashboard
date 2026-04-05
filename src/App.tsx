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
  viewType: ViewType
}

const navItems: NavItem[] = [
  { title: 'Resumen', viewType: 'resumen' },
  { title: 'Mix Ideal', viewType: 'mix' },
  { title: 'Bandas & Cuotas', viewType: 'bandas' },
  { title: 'Auditoría Precios', viewType: 'auditoria' },
]

const viewSubtitles: Record<ViewType, string> = {
  resumen: 'KPIs, tendencia de revenue y distribución por categoría',
  mix: 'Distribución ideal de producto, categorías y SKUs',
  bandas: 'Estrategia de financiamiento, cuotas y precios por SKU',
  auditoria: 'Comparativa de precios cyber vs mercado',
}

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

  const currentTitle = navItems.find((item) => item.viewType === currentView)?.title
  const currentSubtitle = viewSubtitles[currentView]

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
                {currentTitle}
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                {currentSubtitle}
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
