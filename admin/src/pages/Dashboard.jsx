import { useState, useEffect } from 'react'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Bot, Wrench, MessageSquare, Zap, 
  LayoutDashboard, Users, Settings, BarChart3,
  Cpu, Workflow
} from 'lucide-react'

function Dashboard() {
  const [stats, setStats] = useState({
    bots_count: 0,
    skills_count: 0,
    triggers_count: 0,
    messages_today: 0,
    active_agents: 0
  })
  const [bots, setBots] = useState([])

  useEffect(() => {
    async function loadData() {
      try {
        const [dashRes, botsRes] = await Promise.all([
          axios.get('/api/dashboard'),
          axios.get('/api/bots')
        ])
        setStats(dashRes.data)
        setBots(botsRes.data)
      } catch (e) {
        console.error(e)
      }
    }
    loadData()
  }, [])

  const statCards = [
    { title: 'Bot数量', value: stats.bots_count, icon: Bot, color: 'bg-blue-500' },
    { title: 'Skills', value: stats.skills_count, icon: Wrench, color: 'bg-green-500' },
    { title: '今日消息', value: stats.messages_today, icon: MessageSquare, color: 'bg-orange-500' },
    { title: '活跃Agent', value: stats.active_agents, icon: Zap, color: 'bg-purple-500' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Bot 状态
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {bots.map((bot) => (
              <div key={bot.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{bot.id}</p>
                  <p className="text-sm text-slate-500">{bot.soul?.substring(0, 50)}...</p>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  {bot.status}
                </span>
              </div>
            ))}
            {bots.length === 0 && (
              <p className="text-slate-500 text-center py-4">暂无Bot数据</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard
