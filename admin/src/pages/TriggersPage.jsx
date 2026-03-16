import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, Plus, Play, Pause, Trash2 } from 'lucide-react'

const mockTriggers = [
  { id: 't1', type: 'interval', agent: 'selectors', interval: '3600秒', status: 'running', next: '2026-03-16 18:00:00' },
  { id: 't2', type: 'cron', agent: 'ads', cron: '0 9 * * *', status: 'running', next: '2026-03-17 09:00:00' },
  { id: 't3', type: 'webhook', agent: 'ops', route: '/webhook/ops', status: 'stopped', next: '-' },
]

export default function TriggersPage() {
  const [triggers, setTriggers] = useState(mockTriggers)

  const toggleStatus = (id) => {
    setTriggers(triggers.map(t => 
      t.id === id ? { ...t, status: t.status === 'running' ? 'stopped' : 'running' } : t
    ))
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'interval': return '⏱️'
      case 'cron': return '📅'
      case 'webhook': return '🔗'
      default: return '⚡'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Clock className="h-6 w-6" />
          触发器管理
        </h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          新建触发器
        </Button>
      </div>

      <div className="grid gap-4">
        {triggers.map((trigger) => (
          <Card key={trigger.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-2xl">{getTypeIcon(trigger.type)}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{trigger.agent}</h3>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        trigger.status === 'running' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {trigger.status === 'running' ? '运行中' : '已停止'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                      类型: {trigger.type} | 
                      {trigger.type === 'interval' && ` 间隔: ${trigger.interval}`}
                      {trigger.type === 'cron' && ` 表达式: ${trigger.cron}`}
                      {trigger.type === 'webhook' && ` 路由: ${trigger.route}`}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      下次执行: {trigger.next}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => toggleStatus(trigger.id)}
                  >
                    {trigger.status === 'running' ? (
                      <><Pause className="h-4 w-4 mr-1" /> 暂停</>
                    ) : (
                      <><Play className="h-4 w-4 mr-1" /> 启动</>
                    )}
                  </Button>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 触发器类型说明 */}
      <Card>
        <CardHeader>
          <CardTitle>触发器类型</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-slate-50 rounded-lg">
              <h3 className="font-medium mb-2">⏱️ Interval 间隔触发</h3>
              <p className="text-sm text-slate-500">按照固定时间间隔重复执行</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <h3 className="font-medium mb-2">📅 Cron 定时触发</h3>
              <p className="text-sm text-slate-500">使用 Cron 表达式在指定时间执行</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <h3 className="font-medium mb-2">🔗 Webhook 外部触发</h3>
              <p className="text-sm text-slate-500">接收外部 HTTP 请求触发</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
