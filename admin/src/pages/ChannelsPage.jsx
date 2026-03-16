import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Workflow, Plus, Play, Pause, Trash2 } from 'lucide-react'

const channels = [
  { id: 'feishu_1', type: 'feishu', name: '飞书Bot', status: 'running', users: 5 },
  { id: 'slack_1', type: 'slack', name: 'Slack Bot', status: 'stopped', users: 0 },
]

export default function ChannelsPage() {
  const [channelList, setChannelList] = useState(channels)

  const getIcon = (type) => {
    switch (type) {
      case 'feishu': return '📱'
      case 'slack': return '💬'
      default: return '📡'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Workflow className="h-6 w-6" />
          渠道集成
        </h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          添加渠道
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {channelList.map((channel) => (
          <Card key={channel.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{getIcon(channel.type)}</span>
                  <div>
                    <CardTitle>{channel.name}</CardTitle>
                    <p className="text-sm text-slate-500">{channel.type}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  channel.status === 'running' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  {channel.status === 'running' ? '运行中' : '已停止'}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">绑定用户</span>
                  <span className="font-medium">{channel.users} 人</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Play className="h-4 w-4 mr-1" />
                    启动
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    设置
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

      {/* 渠道说明 */}
      <Card>
        <CardHeader>
          <CardTitle>支持的渠道</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg text-center">
              <div className="text-3xl mb-2">📱</div>
              <h3 className="font-medium">飞书</h3>
              <p className="text-sm text-slate-500 mt-1">企业即时通讯</p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="text-3xl mb-2">💬</div>
              <h3 className="font-medium">Slack</h3>
              <p className="text-sm text-slate-500 mt-1">企业协作平台</p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="text-3xl mb-2">🎮</div>
              <h3 className="font-medium">Discord</h3>
              <p className="text-sm text-slate-500 mt-1">社区聊天</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
