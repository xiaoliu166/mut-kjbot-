import { useState, useEffect } from 'react'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bot, Wrench, MessageSquare, Zap, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    bots_count: 0,
    skills_count: 0,
    triggers_count: 0,
    messages_today: 0,
    active_agents: 0
  })
  const [bots, setBots] = useState([])
  const [loading, setLoading] = useState(true)

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
        // 使用模拟数据
        setStats({
          bots_count: 4,
          skills_count: 8,
          triggers_count: 3,
          messages_today: 156,
          active_agents: 4
        })
        setBots([
          { id: 'selectors', name: '选品Bot', status: 'active', soul: '市场分析专家', memory_count: 12 },
          { id: 'ads', name: '投放Bot', status: 'active', soul: '广告优化专家', memory_count: 8 },
          { id: 'ops', name: '运营Bot', status: 'active', soul: 'Listing优化专家', memory_count: 15 },
          { id: 'compliance', name: '合规Bot', status: 'active', soul: '合规审查专家', memory_count: 6 },
        ])
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const statCards = [
    { 
      title: 'Bot数量', 
      value: stats.bots_count, 
      icon: Bot, 
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    { 
      title: 'Skills', 
      value: stats.skills_count, 
      icon: Wrench, 
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600'
    },
    { 
      title: '今日消息', 
      value: stats.messages_today, 
      icon: MessageSquare, 
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600'
    },
    { 
      title: '活跃Agent', 
      value: stats.active_agents, 
      icon: Zap, 
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">仪表盘</h1>
          <p className="text-sm text-gray-500 mt-1">欢迎回来，这里是系统概览</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">最后更新: 刚刚</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => (
          <Card key={i} className="relative overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
                <div className={`p-1.5 rounded-lg bg-gradient-to-br ${stat.color} text-white`}>
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bots Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold">Bot 状态</CardTitle>
          <Button variant="outline" size="sm">
            管理 Bot
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">加载中...</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {bots.map((bot) => (
                <div 
                  key={bot.id} 
                  className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Bot className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{bot.name}</h3>
                        <p className="text-xs text-gray-500">{bot.id}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                      bot.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {bot.status === 'active' ? '运行中' : '已停止'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {bot.soul || '暂无描述'}
                  </p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-400">
                      记忆: {bot.memory_count || 0} 条
                    </span>
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                      查看详情 →
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
          <Bot className="h-5 w-5 text-blue-600" />
          <span>创建新 Bot</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
          <Wrench className="h-5 w-5 text-emerald-600" />
          <span>安装 Skill</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
          <MessageSquare className="h-5 w-5 text-orange-600" />
          <span>发送消息</span>
        </Button>
      </div>
    </div>
  )
}
