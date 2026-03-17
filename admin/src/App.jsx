import { useState } from 'react'
import { Bot, Wrench, Clock, Workflow, Cpu, BarChart3, Users, Settings, Menu, X, Bell, Search, LogOut, Plus, ChevronRight, Activity, MessageSquare, Zap, Layers, FileText, BookOpen } from 'lucide-react'
import DashboardPage from '@/pages/Dashboard'
import BotsPage from '@/pages/BotsPage'
import TasksPage from '@/pages/TasksPage'
import SkillsPage from '@/pages/SkillsPage'
import TriggersPage from '@/pages/TriggersPage'
import ChannelsPage from '@/pages/ChannelsPage'
import ModelsPage from '@/pages/ModelsPage'
import ReportsPage from '@/pages/ReportsPage'
import UsersPage from '@/pages/UsersPage'
import FeedPage from '@/pages/FeedPage'
import KnowledgePage from '@/pages/KnowledgePage'

const pages = [
  { id: 'dashboard', name: '驾驶舱', icon: BarChart3 },
  { id: 'bots', name: 'Agent工厂', icon: Bot },
  { id: 'tasks', name: '任务中心', icon: FileText },
  { id: 'skills', name: '技能市场', icon: Wrench },
  { id: 'triggers', name: '触发器', icon: Clock },
  { id: 'feed', name: '消息流', icon: Activity },
  { id: 'knowledge', name: '知识库', icon: BookOpen },
  { id: 'channels', name: '渠道配置', icon: Workflow },
  { id: 'models', name: '模型配置', icon: Cpu },
  { id: 'reports', name: '报表中心', icon: BarChart3 },
  { id: 'users', name: '组织管理', icon: Users },
]

function App() {
  const [activePage, setActivePage] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigateTo = (pageId) => {
    setActivePage(pageId)
    setSidebarOpen(false)
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <DashboardPage onNavigate={navigateTo} />
      case 'bots': return <BotsPage />
      case 'tasks': return <TasksPage />
      case 'skills': return <SkillsPage />
      case 'triggers': return <TriggersPage />
      case 'feed': return <FeedPage />
      case 'knowledge': return <KnowledgePage />
      case 'channels': return <ChannelsPage />
      case 'models': return <ModelsPage />
      case 'reports': return <ReportsPage />
      case 'users': return <UsersPage />
      default: return <DashboardPage onNavigate={navigateTo} />
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-50 flex items-center px-4 justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 hover:bg-slate-100 rounded-lg">
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-slate-900">mut-kjbot</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-slate-100 rounded-lg">
            <Search className="h-4 w-4 text-slate-500" />
          </button>
          <button className="p-2 hover:bg-slate-100 rounded-lg relative">
            <Bell className="h-4 w-4 text-slate-500" />
          </button>
          <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
            管
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-slate-200 z-40 transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <nav className="p-3 space-y-1">
          {pages.map((page) => (
            <button
              key={page.id}
              onClick={() => navigateTo(page.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activePage === page.id
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <page.icon className="h-4 w-4" />
              {page.name}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-slate-200">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100">
            <Settings className="h-4 w-4" />
            设置
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/20 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <main className="pt-16 lg:pl-64">
        <div className="p-6">
          {renderPage()}
        </div>
      </main>
    </div>
  )
}

export default App
