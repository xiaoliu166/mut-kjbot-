import { useState } from 'react'
import { 
  Plus, Search, Clock, CheckCircle, XCircle, AlertCircle, 
  Play, RotateCcw, Trash2, ChevronDown, X, Bot, FileText, 
  Activity, Filter
} from "lucide-react"

const mockTasks = [
  { 
    id: 1, 
    title: "分析竞品价格", 
    description: "分析竞品A、B、C的价格策略", 
    agent: "选品Bot", 
    agentId: "selector",
    status: "completed", 
    priority: "high",
    createdAt: "2026-03-17 09:00",
    completedAt: "2026-03-17 09:15",
    logs: [
      { time: "09:00", message: "任务开始" },
      { time: "09:05", message: "正在获取竞品数据..." },
      { time: "09:10", message: "分析价格策略" },
      { time: "09:15", message: "任务完成 ✓" },
    ]
  },
  { 
    id: 2, 
    title: "创建广告计划", 
    description: "为新品创建广告投放计划", 
    agent: "投放Bot", 
    agentId: "ads",
    status: "in_progress", 
    priority: "high",
    createdAt: "2026-03-17 09:10",
    logs: [
      { time: "09:10", message: "任务开始" },
      { time: "09:12", message: "分析产品特性" },
      { time: "09:15", message: "正在创建广告计划..." },
    ]
  },
  { 
    id: 3, 
    title: "优化Listing", 
    description: "优化商品标题和描述", 
    agent: "运营Bot", 
    agentId: "ops",
    status: "pending", 
    priority: "medium",
    createdAt: "2026-03-17 09:20",
    logs: []
  },
  { 
    id: 4, 
    title: "合规审查", 
    description: "审查广告文案合规性", 
    agent: "合规Bot", 
    agentId: "compliance",
    status: "failed", 
    priority: "high",
    createdAt: "2026-03-17 08:30",
    completedAt: "2026-03-17 08:45",
    error: "API调用超时，请重试",
    logs: [
      { time: "08:30", message: "任务开始" },
      { time: "08:35", message: "获取广告文案" },
      { time: "08:40", message: "调用合规检查API..." },
      { time: "08:45", message: "任务失败: API调用超时" },
    ]
  },
  { 
    id: 5, 
    title: "市场分析报告", 
    description: "生成月度市场分析报告", 
    agent: "选品Bot", 
    agentId: "selector",
    status: "completed", 
    priority: "low",
    createdAt: "2026-03-17 08:00",
    completedAt: "2026-03-17 08:30",
    logs: [
      { time: "08:00", message: "任务开始" },
      { time: "08:15", message: "收集市场数据" },
      { time: "08:25", message: "生成分析报告" },
      { time: "08:30", message: "任务完成 ✓" },
    ]
  },
]

const agents = [
  { id: "selector", name: "选品Bot", icon: "🔍", color: "blue" },
  { id: "ads", name: "投放Bot", icon: "📢", color: "green" },
  { id: "ops", name: "运营Bot", icon: "⚙️", color: "purple" },
  { id: "compliance", name: "合规Bot", icon: "✅", color: "orange" },
]

const statusConfig = {
  pending: { label: "待处理", icon: Clock, class: "bg-gray-100 text-gray-700 border-gray-200" },
  in_progress: { label: "进行中", icon: AlertCircle, class: "bg-blue-100 text-blue-700 border-blue-200" },
  completed: { label: "已完成", icon: CheckCircle, class: "bg-green-100 text-green-700 border-green-200" },
  failed: { label: "失败", icon: XCircle, class: "bg-red-100 text-red-700 border-red-200" },
}

const priorityConfig = {
  high: { label: "高", class: "text-red-600" },
  medium: { label: "中", class: "text-orange-600" },
  low: { label: "低", class: "text-gray-600" },
}

export default function TasksPage() {
  const [tasks, setTasks] = useState(mockTasks)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [newTask, setNewTask] = useState({ agent: "", title: "", description: "", priority: "medium" })

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.agent.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || task.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleCreateTask = () => {
    if (!newTask.agent || !newTask.title) return
    const agent = agents.find(a => a.id === newTask.agent)
    const task = {
      id: tasks.length + 1,
      title: newTask.title,
      description: newTask.description,
      agent: agent?.name || "",
      agentId: newTask.agent,
      status: "pending",
      priority: newTask.priority,
      createdAt: new Date().toLocaleString("zh-CN"),
      logs: [{ time: new Date().toLocaleTimeString("zh-CN", { hour: '2-digit', minute: '2-digit' }), message: "任务已创建" }]
    }
    setTasks([task, ...tasks])
    setShowCreateModal(false)
    setNewTask({ agent: "", title: "", description: "", priority: "medium" })
  }

  const handleExecuteTask = (taskId) => {
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        return { 
          ...t, 
          status: "in_progress",
          logs: [...t.logs, { time: new Date().toLocaleTimeString("zh-CN", { hour: '2-digit', minute: '2-digit' }), message: "开始执行..." }]
        }
      }
      return t
    }))
  }

  const handleRerunTask = (taskId) => {
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        return { 
          ...t, 
          status: "pending",
          logs: [...t.logs, { time: new Date().toLocaleTimeString("zh-CN", { hour: '2-digit', minute: '2-digit' }), message: "重新执行任务" }]
        }
      }
      return t
    }))
  }

  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter(t => t.id !== taskId))
    setSelectedTask(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">任务中心</h1>
          <p className="text-gray-500 text-sm mt-1">管理Agent任务执行</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800"
        >
          <Plus className="w-4 h-4" />
          新建任务
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索任务..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          {["all", "pending", "in_progress", "completed", "failed"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status 
                  ? "bg-gray-900 text-white" 
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {status === "all" ? "全部" : statusConfig[status]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Status Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        {Object.entries(statusConfig).map(([key, config]) => {
          const Icon = config.icon
          return (
            <div key={key} className="flex items-center gap-1.5">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.class}`}>
                <Icon className="w-3 h-3 inline mr-0.5" />
                {config.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">任务</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">优先级</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">创建时间</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTasks.map((task) => {
                const status = statusConfig[task.status]
                const StatusIcon = status.icon
                const priority = priorityConfig[task.priority]
                return (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <div 
                        className="cursor-pointer"
                        onClick={() => setSelectedTask(task)}
                      >
                        <p className="font-medium text-gray-900 text-sm">{task.title}</p>
                        <p className="text-gray-500 text-xs truncate max-w-xs">{task.description}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{agents.find(a => a.id === task.agentId)?.icon}</span>
                        <span className="text-sm text-gray-700">{task.agent}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${status.class}`}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-medium ${priority.class}`}>{priority.label}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">{task.createdAt}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {task.status === "pending" && (
                          <button 
                            onClick={() => handleExecuteTask(task.id)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="执行"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        {(task.status === "failed" || task.status === "completed") && (
                          <button 
                            onClick={() => handleRerunTask(task.id)}
                            className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg"
                            title="重新执行"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => setSelectedTask(task)}
                          className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg"
                          title="查看详情"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteTask(task.id)}
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
        {filteredTasks.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>暂无任务</p>
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">快速创建任务</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">选择Agent <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 gap-2">
                  {agents.map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => setNewTask({ ...newTask, agent: agent.id })}
                      className={`p-3 rounded-lg border-2 text-left transition-colors ${
                        newTask.agent === agent.id 
                          ? "border-gray-900 bg-gray-50" 
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <span className="text-lg">{agent.icon}</span>
                      <span className="ml-2 font-medium text-sm">{agent.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">任务内容 <span className="text-red-500">*</span></label>
                <textarea
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="要做什么..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">详细描述</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="补充说明..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">优先级</label>
                <div className="flex gap-2">
                  {["high", "medium", "low"].map((p) => (
                    <button
                      key={p}
                      onClick={() => setNewTask({ ...newTask, priority: p })}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        newTask.priority === p 
                          ? priorityConfig[p].class + " bg-gray-100" 
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {priorityConfig[p].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button 
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                取消
              </button>
              <button 
                onClick={handleCreateTask}
                disabled={!newTask.agent || !newTask.title}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                创建并执行
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h3 className="font-semibold text-gray-900">{selectedTask.title}</h3>
                <p className="text-sm text-gray-500">{selectedTask.agent} · {selectedTask.createdAt}</p>
              </div>
              <button onClick={() => setSelectedTask(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">任务描述</h4>
                <p className="text-gray-600">{selectedTask.description || "无"}</p>
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">状态</h4>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[selectedTask.status].class}`}>
                  {statusConfig[selectedTask.status].label}
                </span>
              </div>

              {selectedTask.error && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">错误: {selectedTask.error}</p>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">执行日志</h4>
                <div className="space-y-2">
                  {selectedTask.logs.length > 0 ? (
                    selectedTask.logs.map((log, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-sm">
                        <span className="text-gray-400 font-mono text-xs whitespace-nowrap">{log.time}</span>
                        <span className="text-gray-600">{log.message}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">暂无日志</p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button 
                onClick={() => setSelectedTask(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                关闭
              </button>
              {selectedTask.status === "pending" && (
                <button 
                  onClick={() => { handleExecuteTask(selectedTask.id); setSelectedTask(null) }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  执行
                </button>
              )}
              {(selectedTask.status === "failed" || selectedTask.status === "completed") && (
                <button 
                  onClick={() => { handleRerunTask(selectedTask.id); setSelectedTask(null) }}
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700"
                >
                  重新执行
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
