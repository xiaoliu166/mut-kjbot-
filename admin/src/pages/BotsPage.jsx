import { useState } from 'react'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bot, Plus, Edit, Trash2 } from 'lucide-react'

export default function BotsPage() {
  const [bots, setBots] = useState([])
  const [loading, setLoading] = useState(true)

  useState(() => {
    async function loadBots() {
      try {
        const res = await axios.get('/api/bots')
        setBots(res.data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    loadBots()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bot className="h-6 w-6" />
          Bot 管理
        </h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          新建 Bot
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bot 列表</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-slate-500 text-center py-4">加载中...</p>
          ) : bots.length === 0 ? (
            <p className="text-slate-500 text-center py-4">暂无 Bot</p>
          ) : (
            <div className="space-y-3">
              {bots.map((bot) => (
                <div
                  key={bot.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium">{bot.id}</h3>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        bot.status === 'active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {bot.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                      {bot.soul?.substring(0, 80)}...
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      记忆: {bot.memory_count} 条
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
