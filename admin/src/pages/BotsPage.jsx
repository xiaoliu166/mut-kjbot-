import { useState } from 'react'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bot, Plus, Edit, Trash2, Play, Pause, MoreHorizontal } from 'lucide-react'

export default function BotsPage() {
  const [bots, setBots] = useState([
    { id: 'selectors', name: '选品Bot', status: 'active', soul: '市场分析专家，擅长竞品调研和爆品挖掘', memory_count: 12 },
    { id: 'ads', name: '投放Bot', status: 'active', soul: '广告投放专家，擅长ROI优化和关键词策略', memory_count: 8 },
    { id: 'ops', name: '运营Bot', status: 'active', soul: 'Listing优化专家，擅长文案撰写和转化率提升', memory_count: 15 },
    { id: 'compliance', name: '合规Bot', status: 'active', soul: '合规审查专家，擅长风险评估和合规建议', memory_count: 6 },
  ])

  const [loading, setLoading] = useState(false)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bot 管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理和配置您的 AI Agent</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          新建 Bot
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Bot className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{bots.length}</p>
                <p className="text-sm text-gray-500">总 Bot 数</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <Play className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{bots.filter(b => b.status === 'active').length}</p>
                <p className="text-sm text-gray-500">运行中</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Trash2 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{bots.reduce((a, b) => a + (b.memory_count || 0), 0)}</p>
                <p className="text-sm text-gray-500">总记忆条数</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bot List */}
      <Card>
        <CardHeader>
          <CardTitle>Bot 列表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bots.map((bot) => (
              <div 
                key={bot.id}
                className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{bot.name}</h3>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        bot.status === 'active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {bot.status === 'active' ? '运行中' : '已停止'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{bot.soul}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    {bot.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
