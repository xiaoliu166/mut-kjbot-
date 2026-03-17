import { useState } from 'react'
import { 
  MessageCircle, CheckCircle, AlertCircle, MessageSquare, 
  Bot, Activity, Bell, X, Filter, RefreshCw
} from "lucide-react"

const mockFeed = [
  { 
    id: 1, 
    type: "agent_speak", 
    agent: "选品Bot", 
    agentIcon: "🔍",
    content: "完成竞品A价格调研，发现价格区间在$19.99-$29.99，建议定价$24.99",
    time: "10分钟前",
    timestamp: "2026-03-17 10:20"
  },
  { 
    id: 2, 
    type: "task_complete", 
    agent: "投放Bot", 
    agentIcon: "📢",
    content: "任务「创建广告计划」已完成，成功创建广告计划 #123",
    time: "15分钟前",
    timestamp: "2026-03-17 10:15"
  },
  { 
    id: 3, 
    type: "discussion", 
    agent: "运营Bot", 
    agentIcon: "⚙️",
    content: "关于新品定价问题，与选品Bot讨论中，建议参考竞品价格策略",
    time: "20分钟前",
    timestamp: "2026-03-17 10:10"
  },
  { 
    id: 4, 
    type: "system", 
    agent: "系统", 
    agentIcon: "🔔",
    content: "触发器「每日市场分析」执行成功",
    time: "30分钟前",
    timestamp: "2026-03-17 09:30"
  },
  { 
    id: 5, 
    type: "task_complete", 
    agent: "合规Bot", 
    agentIcon: "✅",
    content: "任务「合规审查」已完成，广告文案符合规范",
    time: "1小时前",
    timestamp: "2026-03-17 09:00"
  },
  { 
    id: 6, 
    type: "agent_speak", 
    agent: "选品Bot", 
    agentIcon: "🔍",
    content: "市场分析报告已生成，重点关注品类：3C配件、家居用品",
    time: "1小时前",
    timestamp: "2026-03-17 08:30"
  },
  { 
    id: 7, 
    type: "discussion", 
    agent: "投放Bot", 
    agentIcon: "📢",
    content: "与运营Bot讨论新品广告策略，确定预算分配方案",
    time: "2小时前",
    timestamp: "2026-03-17 08:00"
  },
  { 
    id: 8, 
    type: "system", 
    agent: "系统", 
    agentIcon: "🔔",
    content: "新订单通知：订单 #45678 已创建",
    time: "2小时前",
    timestamp: "2026-03-17 07:45"
  },
]

const typeConfig = {
  agent_speak: { label: "Agent发言", icon: MessageCircle, color: "blue" },
  task_complete: { label: "任务完成", icon: CheckCircle, color: "green" },
  discussion: { label: "讨论", icon: Activity, color: "purple" },
  system: { label: "系统通知", icon: Bell, color: "gray" },
}

const colorMap = {
  blue: { bg: "bg-blue-100", text: "text-blue-600", border: "border-blue-200" },
  green: { bg: "bg-green-100", text: "text-green-600", border: "border-green-200" },
  purple: { bg: "bg-purple-100", text: "text-purple-600", border: "border-purple-200" },
  gray: { bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200" },
}

export default function FeedPage() {
  const [filterType, setFilterType] = useState("all")
  const [feed, setFeed] = useState(mockFeed)

  const filteredFeed = feed.filter(item => 
    filterType === "all" || item.type === filterType
  )

  const handleRefresh = () => {
    setFeed([...feed])
  }

  const groupedFeed = filteredFeed.reduce((acc, item) => {
    const date = item.timestamp.split(' ')[0]
    if (!acc[date]) acc[date] = []
    acc[date].push(item)
    return acc
  }, {})

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (dateStr === today.toISOString().split('T')[0]) return "今天"
    if (dateStr === yesterday.toISOString().split('T')[0]) return "昨天"
    return date.toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">消息流</h1>
          <p className="text-gray-500 text-sm mt-1">Agent动态和协作记录</p>
        </div>
        <button 
          onClick={handleRefresh}
          className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />
          刷新
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterType("all")}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            filterType === "all" ? "bg-gray-900 text-white" : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          全部
        </button>
        {Object.entries(typeConfig).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setFilterType(key)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              filterType === key ? "bg-gray-900 text-white" : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <config.icon className="w-4 h-4" />
            {config.label}
          </button>
        ))}
      </div>

      {/* Feed Timeline */}
      <div className="space-y-6">
        {Object.entries(groupedFeed).map(([date, items]) => (
          <div key={date}>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-sm text-gray-500 font-medium">{formatDate(date)}</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            
            <div className="space-y-3">
              {items.map((item) => {
                const config = typeConfig[item.type]
                const colors = colorMap[config.color]
                const Icon = config.icon
                
                return (
                  <div 
                    key={item.id} 
                    className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                        {item.agent === "系统" ? (
                          <Bell className={`w-5 h-5 ${colors.text}`} />
                        ) : (
                          <span className="text-lg">{item.agentIcon}</span>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">{item.agent}</span>
                          <span className="text-gray-400">·</span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${colors.bg} ${colors.text}`}>
                            <Icon className="w-3 h-3" />
                            {config.label}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 text-sm">{item.content}</p>
                        
                        <p className="text-gray-400 text-xs mt-2">{item.time}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {filteredFeed.length === 0 && (
          <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>暂无消息</p>
          </div>
        )}
      </div>
    </div>
  )
}
