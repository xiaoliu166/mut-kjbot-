import { useState } from 'react'
import { Bot, Wrench, Clock, Workflow, Cpu, BarChart3, Users } from 'lucide-react'
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
  { id: 'models', name: '模型', icon: Cpu },
  { id: 'reports', name: '报表', icon: BarChart3 },
  { id: 'users', name: '用户', icon: Users },
]

function App() {
  const [activePage, setActivePage] = useState('dashboard')

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
    <div className="flex min-h-screen bg-slate-50">
      {/* 侧边栏 */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Bot className="h-6 w-6" />
            mut-kjbot
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {pages.map((page) => (
            <button
              key={page.id}
              onClick={() => setActivePage(page.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                activePage === page.id
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <page.icon className="h-5 w-5" />
              {page.name}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            API 在线
          </div>
        </div>
      </aside>

      {/* 主内容 */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {renderPage()}
        </div>
      </main>
    </div>
  )
}

export default App
