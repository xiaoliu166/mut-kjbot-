import { useState } from 'react'
import { Bot, Wrench, Clock, Workflow, Cpu, BarChart3, Users, Settings, Menu, X, Bell, Search, LogOut } from 'lucide-react'
import DashboardPage from '@/pages/Dashboard'
import BotsPage from '@/pages/BotsPage'
import SkillsPage from '@/pages/SkillsPage'
import ModelsPage from '@/pages/ModelsPage'
import TriggersPage from '@/pages/TriggersPage'
import ChannelsPage from '@/pages/ChannelsPage'
import ReportsPage from '@/pages/ReportsPage'
import UsersPage from '@/pages/UsersPage'

const pages = [
  { id: 'dashboard', name: '仪表盘', icon: BarChart3 },
  { id: 'bots', name: 'Bot管理', icon: Bot },
  { id: 'skills', name: 'Skills', icon: Wrench },
  { id: 'triggers', name: '触发器', icon: Clock },
  { id: 'channels', name: '渠道', icon: Workflow },
  { id: 'models', name: '模型配置', icon: Cpu },
  { id: 'reports', name: '数据报表', icon: BarChart3 },
  { id: 'users', name: '用户权限', icon: Users },
]

function App() {
  const [activePage, setActivePage] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <DashboardPage />
      case 'bots': return <BotsPage />
      case 'skills': return <SkillsPage />
      case 'models': return <ModelsPage />
      case 'triggers': return <TriggersPage />
      case 'channels': return <ChannelsPage />
      case 'reports': return <ReportsPage />
      case 'users': return <UsersPage />
      default: return <DashboardPage />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900">mut-kjbot</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
              <Search className="h-4 w-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="搜索..." 
                className="bg-transparent border-none outline-none text-sm w-40"
              />
            </div>
            <button className="p-2 rounded-full hover:bg-gray-100 relative">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              管
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`
        fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-gray-200 z-40
        transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <nav className="p-4 space-y-1">
          {pages.map((page) => (
            <button
              key={page.id}
              onClick={() => {
                setActivePage(page.id)
                setSidebarOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activePage === page.id
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <page.icon className={`h-5 w-5 ${activePage === page.id ? 'text-blue-600' : 'text-gray-400'}`} />
              {page.name}
            </button>
          ))}
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
            <Settings className="h-5 w-5 text-gray-400" />
            设置
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 mt-1">
            <LogOut className="h-5 w-5 text-gray-400" />
            退出登录
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="pt-16 lg:pl-64">
        <div className="p-6">
          {renderPage()}
        </div>
      </main>
    </div>
  )
}

export default App
