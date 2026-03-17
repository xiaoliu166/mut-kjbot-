import { useState } from 'react'
import { 
  Plus, Search, Clock, Play, Pause, Trash2, X, Edit, 
  CheckCircle, XCircle, AlertCircle, ChevronDown, Zap, 
  Calendar, Timer, MessageCircle, Webhook, Globe, Eye
} from "lucide-react"

const triggerTypes = [
  { 
    id: "cron", 
    name: "定时执行", 
    icon: Calendar,
    description: "使用Cron表达式定时执行",
    configFields: [
      { name: "cron", label: "Cron表达式", type: "text", placeholder: "0 9 * * *" }
    ]
  },
  { 
    id: "once", 
    name: "单次执行", 
    icon: Clock,
    description: "指定时间执行一次",
    configFields: [
      { name: "datetime", label: "执行时间", type: "datetime-local" }
    ]
  },
  { 
    id: "interval", 
    name: "间隔执行", 
    icon: Timer,
    description: "每隔指定时间执行",
    configFields: [
      { name: "interval", label: "间隔", type: "number", placeholder: "30" },
      { name: "unit", label: "单位", type: "select", options: ["分钟", "小时", "天"] }
    ]
  },
  { 
    id: "poll", 
    name: "轮询执行", 
    icon: Globe,
    description: "定时请求URL并根据响应触发",
    configFields: [
      { name: "url", label: "监控URL", type: "text", placeholder: "https://..." },
      { name: "interval", label: "轮询间隔(分钟)", type: "number", placeholder: "5" },
      { name: "condition", label: "触发条件", type: "select", options: ["状态码=200", "包含关键词", "自定义"] }
    ]
  },
  { 
    id: "on_message", 
    name: "消息触发", 
    icon: MessageCircle,
    description: "收到消息时自动执行",
    configFields: [
      { name: "channel", label: "渠道", type: "select", options: ["飞书", "Slack", "全部"] },
      { name: "keyword", label: "关键词(可选)", type: "text", placeholder: "触发关键词" }
    ]
  },
  { 
    id: "webhook", 
    name: "Webhook", 
    icon: Webhook,
    description: "外部Webhook触发",
    configFields: [
      { name: "webhook_url", label: "Webhook URL", type: "text", readonly: true }
    ]
  },
]

const mockTriggers = [
  { 
    id: 1, 
    name: "每日市场分析", 
    type: "cron", 
    agent: "选品Bot",
    agentId: "selector",
    config: { cron: "0 9 * * *" },
    enabled: true, 
    nextRun: "2026-03-18 09:00",
    lastRun: "2026-03-17 09:00",
    status: "success",
    createdAt: "2026-03-10"
  },
  { 
    id: 2, 
    name: "竞品价格监控", 
    type: "interval", 
    agent: "选品Bot",
    agentId: "selector",
    config: { interval: 30, unit: "分钟" },
    enabled: true, 
    nextRun: "2026-03-17 10:50",
    lastRun: "2026-03-17 10:20",
    status: "success",
    createdAt: "2026-03-10"
  },
  { 
    id: 3, 
    name: "广告效果检查", 
    type: "poll", 
    agent: "投放Bot",
    agentId: "ads",
    config: { url: "https://api.example.com/ads", interval: 60, condition: "状态码=200" },
    enabled: false, 
    nextRun: "-",
    lastRun: "2026-03-17 08:00",
    status: "idle",
    createdAt: "2026-03-11"
  },
  { 
    id: 4, 
    name: "新订单通知", 
    type: "webhook", 
    agent: "运营Bot",
    agentId: "ops",
    config: { webhook_url: "https://mut-kjbot.vercel.app/webhook/abc123" },
    enabled: true, 
    nextRun: "-",
    lastRun: "2026-03-17 09:30",
    status: "success",
    createdAt: "2026-03-12"
  },
  { 
    id: 5, 
    name: "客服消息响应", 
    type: "on_message", 
    agent: "合规Bot",
    agentId: "compliance",
    config: { channel: "飞书", keyword: "" },
    enabled: true, 
    nextRun: "-",
    lastRun: "2026-03-17 10:15",
    status: "success",
    createdAt: "2026-03-12"
  },
]

const agents = [
  { id: "selector", name: "选品Bot", icon: "🔍" },
  { id: "ads", name: "投放Bot", icon: "📢" },
  { id: "ops", name: "运营Bot", icon: "⚙️" },
  { id: "compliance", name: "合规Bot", icon: "✅" },
]

const statusConfig = {
  success: { label: "成功", class: "text-green-600 bg-green-50" },
  failed: { label: "失败", class: "text-red-600 bg-red-50" },
  running: { label: "执行中", class: "text-blue-600 bg-blue-50" },
  idle: { label: "空闲", class: "text-gray-600 bg-gray-50" },
}

export default function TriggersPage() {
  const [triggers, setTriggers] = useState(mockTriggers)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedTrigger, setSelectedTrigger] = useState(null)
  const [newTrigger, setNewTrigger] = useState({
    name: "",
    type: "",
    agent: "",
    config: {}
  })

  const filteredTriggers = triggers.filter(trigger => {
    const matchesSearch = trigger.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         trigger.agent.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "all" || trigger.type === typeFilter
    return matchesSearch && matchesType
  })

  const getTriggerType = (typeId) => triggerTypes.find(t => t.id === typeId)

  const handleCreateTrigger = () => {
    if (!newTrigger.name || !newTrigger.type || !newTrigger.agent) return
    const agent = agents.find(a => a.id === newTrigger.agent)
    const type = getTriggerType(newTrigger.type)
    const trigger = {
      id: triggers.length + 1,
      ...newTrigger,
      agent: agent?.name || "",
      enabled: true,
      nextRun: newTrigger.type === "cron" ? calculateNextRun(newTrigger.config.cron) : 
              newTrigger.type === "interval" ? calculateNextInterval(newTrigger.config) : "-",
      lastRun: "-",
      status: "idle",
      createdAt: new Date().toLocaleDateString("zh-CN")
    }
    setTriggers([trigger, ...triggers])
    setShowCreateModal(false)
    setNewTrigger({ name: "", type: "", agent: "", config: {} })
  }

  const calculateNextRun = (cron) => {
    // 简化计算
    return "2026-03-18 09:00"
  }

  const calculateNextInterval = (config) => {
    return "计算中..."
  }

  const handleToggle = (id) => {
    setTriggers(triggers.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t))
  }

  const handleDelete = (id) => {
    setTriggers(triggers.filter(t => t.id !== id))
    setSelectedTrigger(null)
  }

  const handleTest = (id) => {
    setTriggers(triggers.map(t => t.id === id ? { ...t, status: "running" } : t))
    setTimeout(() => {
      setTriggers(triggers.map(t => t.id === id ? { ...t, status: "success", lastRun: new Date().toLocaleString("zh-CN") } : t))
    }, 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">触发器</h1>
          <p className="text-gray-500 text-sm mt-1">配置Agent自动触发规则</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800"
        >
          <Plus className="w-4 h-4" />
          创建触发器
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索触发器..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setTypeFilter("all")}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              typeFilter === "all" ? "bg-gray-900 text-white" : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            全部
          </button>
          {triggerTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setTypeFilter(type.id)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                typeFilter === type.id ? "bg-gray-900 text-white" : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {type.name}
            </button>
          ))}
        </div>
      </div>

      {/* Triggers List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">触发器</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">类型</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">下次执行</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">上次执行</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTriggers.map((trigger) => {
                const type = getTriggerType(trigger.type)
                const TypeIcon = type?.icon || Clock
                const status = statusConfig[trigger.status]
                return (
                  <tr key={trigger.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{trigger.name}</p>
                        <p className="text-gray-500 text-xs">
                          {trigger.type === "cron" && trigger.config.cron}
                          {trigger.type === "interval" && `${trigger.config.interval} ${trigger.config.unit}`}
                          {trigger.type === "poll" && trigger.config.url}
                          {trigger.type === "on_message" && `${trigger.config.channel}${trigger.config.keyword ? ` · ${trigger.config.keyword}` : ''}`}
                          {trigger.type === "webhook" && "Webhook"}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <TypeIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{type?.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span>{agents.find(a => a.id === trigger.agentId)?.icon}</span>
                        <span className="text-sm text-gray-700">{trigger.agent}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">{trigger.nextRun}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{trigger.lastRun}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.class}`}>
                          {status.label}
                        </span>
                        <span className={`w-2 h-2 rounded-full ${trigger.enabled ? "bg-green-500" : "bg-gray-300"}`} title={trigger.enabled ? "启用" : "禁用"} />
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => handleTest(trigger.id)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="测试执行"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleToggle(trigger.id)}
                          className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg"
                          title={trigger.enabled ? "禁用" : "启用"}
                        >
                          {trigger.enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <button 
                          onClick={() => setSelectedTrigger(trigger)}
                          className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg"
                          title="查看详情"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(trigger.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filteredTriggers.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>暂无触发器</p>
          </div>
        )}
      </div>

      {/* Create Trigger Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">创建触发器</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">触发器名称 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={newTrigger.name}
                  onChange={(e) => setNewTrigger({ ...newTrigger, name: e.target.value })}
                  placeholder="例如：每日市场分析"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  maxLength={30}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">触发类型 <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 gap-2">
                  {triggerTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setNewTrigger({ ...newTrigger, type: type.id, config: {} })}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        newTrigger.type === type.id 
                          ? "border-gray-900 bg-gray-50" 
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <type.icon className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium">{type.name}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{type.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {newTrigger.type && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">关联Agent <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-2 gap-2">
                    {agents.map((agent) => (
                      <button
                        key={agent.id}
                        onClick={() => setNewTrigger({ ...newTrigger, agent: agent.id })}
                        className={`p-2 rounded-lg border-2 text-center transition-colors ${
                          newTrigger.agent === agent.id 
                            ? "border-gray-900 bg-gray-50" 
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <span className="text-lg">{agent.icon}</span>
                        <span className="ml-1 text-sm">{agent.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {newTrigger.type && newTrigger.type === "cron" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cron表达式</label>
                  <input
                    type="text"
                    value={newTrigger.config.cron || ""}
                    onChange={(e) => setNewTrigger({ ...newTrigger, config: { ...newTrigger.config, cron: e.target.value } })}
                    placeholder="0 9 * * *"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                  <p className="text-xs text-gray-500 mt-1">格式：分 时 日 月 周</p>
                </div>
              )}

              {newTrigger.type && newTrigger.type === "interval" && (
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">间隔</label>
                    <input
                      type="number"
                      value={newTrigger.config.interval || ""}
                      onChange={(e) => setNewTrigger({ ...newTrigger, config: { ...newTrigger.config, interval: e.target.value } })}
                      placeholder="30"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-sm font-medium text-gray-700 mb-1">单位</label>
                    <select
                      value={newTrigger.config.unit || "分钟"}
                      onChange={(e) => setNewTrigger({ ...newTrigger, config: { ...newTrigger.config, unit: e.target.value } })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                    >
                      <option>分钟</option>
                      <option>小时</option>
                      <option>天</option>
                    </select>
                  </div>
                </div>
              )}

              {newTrigger.type && newTrigger.type === "poll" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">监控URL</label>
                    <input
                      type="text"
                      value={newTrigger.config.url || ""}
                      onChange={(e) => setNewTrigger({ ...newTrigger, config: { ...newTrigger.config, url: e.target.value } })}
                      placeholder="https://..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">轮询间隔(分钟)</label>
                      <input
                        type="number"
                        value={newTrigger.config.interval || ""}
                        onChange={(e) => setNewTrigger({ ...newTrigger, config: { ...newTrigger.config, interval: e.target.value } })}
                        placeholder="5"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">触发条件</label>
                      <select
                        value={newTrigger.config.condition || "状态码=200"}
                        onChange={(e) => setNewTrigger({ ...newTrigger, config: { ...newTrigger.config, condition: e.target.value } })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                      >
                        <option>状态码=200</option>
                        <option>包含关键词</option>
                        <option>自定义</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {newTrigger.type && newTrigger.type === "on_message" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">渠道</label>
                    <select
                      value={newTrigger.config.channel || "飞书"}
                      onChange={(e) => setNewTrigger({ ...newTrigger, config: { ...newTrigger.config, channel: e.target.value } })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                    >
                      <option>飞书</option>
                      <option>Slack</option>
                      <option>全部</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">关键词(可选)</label>
                    <input
                      type="text"
                      value={newTrigger.config.keyword || ""}
                      onChange={(e) => setNewTrigger({ ...newTrigger, config: { ...newTrigger.config, keyword: e.target.value } })}
                      placeholder="触发关键词"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                  </div>
                </>
              )}

              {newTrigger.type && newTrigger.type === "webhook" && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Webhook URL创建后自动生成</p>
                  <code className="text-xs text-gray-500 mt-1 block">https://mut-kjbot.vercel.app/webhook/xxx</code>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button 
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                取消
              </button>
              <button 
                onClick={handleCreateTrigger}
                disabled={!newTrigger.name || !newTrigger.type || !newTrigger.agent}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                创建触发器
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trigger Detail Modal */}
      {selectedTrigger && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">{selectedTrigger.name}</h3>
              <button onClick={() => setSelectedTrigger(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">类型</p>
                  <p className="text-sm font-medium text-gray-900">{getTriggerType(selectedTrigger.type)?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Agent</p>
                  <p className="text-sm font-medium text-gray-900">{selectedTrigger.agent}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">状态</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`w-2 h-2 rounded-full ${selectedTrigger.enabled ? "bg-green-500" : "bg-gray-300"}`} />
                    <span className="text-sm text-gray-700">{selectedTrigger.enabled ? "启用" : "禁用"}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">执行状态</p>
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${statusConfig[selectedTrigger.status].class}`}>
                    {statusConfig[selectedTrigger.status].label}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">下次执行</p>
                  <p className="text-sm text-gray-700">{selectedTrigger.nextRun}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">上次执行</p>
                  <p className="text-sm text-gray-700">{selectedTrigger.lastRun}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-2">配置</p>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <pre className="text-xs text-gray-600 overflow-x-auto">
                    {JSON.stringify(selectedTrigger.config, null, 2)}
                  </pre>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button 
                onClick={() => setSelectedTrigger(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                关闭
              </button>
              <button 
                onClick={() => { handleTest(selectedTrigger.id); setSelectedTrigger(null) }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                测试执行
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
