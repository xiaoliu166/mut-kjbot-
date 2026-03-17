import { useState } from 'react'
import { 
  BarChart3, TrendingUp, TrendingDown, Activity, 
  Bot, MessageSquare, Zap, Clock, Calendar
} from "lucide-react"

const mockStats = {
  agentCount: { current: 4, change: 0, trend: "flat" },
  activeAgents: { current: 4, change: 0, trend: "flat" },
  taskTotal: { current: 89, change: 12, trend: "up" },
  taskSuccess: { current: 82, change: 5, trend: "up" },
  messages: { current: 156, change: 23, trend: "up" },
  avgResponse: { current: 2.3, change: -0.2, trend: "down" },
}

const mockTaskTrend = [
  { date: "03-11", count: 45 },
  { date: "03-12", count: 52 },
  { date: "03-13", count: 38 },
  { date: "03-14", count: 61 },
  { date: "03-15", count: 55 },
  { date: "03-16", count: 73 },
  { date: "03-17", count: 89 },
]

const mockAgentActivity = [
  { name: "选品Bot", tasks: 28, success: 27, rate: 96 },
  { name: "投放Bot", tasks: 24, success: 22, rate: 92 },
  { name: "运营Bot", tasks: 21, success: 20, rate: 95 },
  { name: "合规Bot", tasks: 16, success: 13, rate: 81 },
]

const mockResponseTime = [
  { date: "03-11", time: 3.2 },
  { date: "03-12", time: 2.8 },
  { date: "03-13", time: 3.5 },
  { date: "03-14", time: 2.5 },
  { date: "03-15", time: 2.9 },
  { date: "03-16", time: 2.4 },
  { date: "03-17", time: 2.3 },
]

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState("7d")

  const maxTaskCount = Math.max(...mockTaskTrend.map(d => d.count))
  const maxTime = Math.max(...mockResponseTime.map(d => d.time))

  const stats = [
    { label: "Agent总数", value: mockStats.agentCount.current, icon: Bot, color: "blue", change: mockStats.agentCount.change, trend: mockStats.agentCount.trend },
    { label: "活跃Agent", value: mockStats.activeAgents.current, icon: Activity, color: "green", change: mockStats.activeAgents.change, trend: mockStats.activeAgents.trend },
    { label: "任务执行", value: mockStats.taskTotal.current, icon: Zap, color: "orange", change: mockStats.taskTotal.change, trend: mockStats.taskTotal.trend },
    { label: "成功率", value: `${Math.round(mockStats.taskSuccess.current / mockStats.taskTotal.current * 100)}%`, icon: TrendingUp, color: "green", change: mockStats.taskSuccess.change, trend: mockStats.taskSuccess.trend },
    { label: "消息量", value: mockStats.messages.current, icon: MessageSquare, color: "purple", change: mockStats.messages.change, trend: mockStats.messages.trend },
    { label: "平均响应(s)", value: mockStats.avgResponse.current, icon: Clock, color: "blue", change: mockStats.avgResponse.change, trend: mockStats.avgResponse.trend },
  ]

  const colorMap = {
    blue: { bg: "bg-blue-100", text: "text-blue-600" },
    green: { bg: "bg-green-100", text: "text-green-600" },
    orange: { bg: "bg-orange-100", text: "text-orange-600" },
    purple: { bg: "bg-purple-100", text: "text-purple-600" },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">报表中心</h1>
          <p className="text-gray-500 text-sm mt-1">数据统计与分析</p>
        </div>
        <div className="flex gap-2">
          {["7d", "30d", "90d"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range 
                  ? "bg-gray-900 text-white" 
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {range === "7d" ? "7天" : range === "30d" ? "30天" : "90天"}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat, idx) => {
          const colors = colorMap[stat.color]
          const TrendIcon = stat.trend === "up" ? TrendingUp : stat.trend === "down" ? TrendingDown : Activity
          
          return (
            <div key={idx} className="bg-white p-4 rounded-xl border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-lg ${colors.bg}`}>
                  <stat.icon className={`w-4 h-4 ${colors.text}`} />
                </div>
              </div>
              <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs text-gray-500">{stat.label}</span>
                {stat.change !== 0 && (
                  <span className={`text-xs flex items-center ${stat.trend === "down" && stat.label.includes("响应") ? "text-green-600" : stat.trend === "up" ? "text-green-600" : stat.trend === "down" ? "text-red-600" : "text-gray-400"}`}>
                    {stat.trend !== "flat" && <TrendIcon className="w-3 h-3" />}
                    {Math.abs(stat.change)}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Trend Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">任务趋势</h3>
            <span className="text-sm text-gray-500">近7天</span>
          </div>
          <div className="h-48 flex items-end gap-2">
            {mockTaskTrend.map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                <div 
                  className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
                  style={{ height: `${(item.count / maxTaskCount) * 100}%`, minHeight: item.count > 0 ? "4px" : "0" }}
                  title={item.count}
                />
                <span className="text-xs text-gray-400">{item.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Response Time Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">响应时间</h3>
            <span className="text-sm text-gray-500">近7天</span>
          </div>
          <div className="h-48 flex items-end gap-2">
            {mockResponseTime.map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                <div 
                  className="w-full bg-green-500 rounded-t hover:bg-green-600 transition-colors"
                  style={{ height: `${(item.time / maxTime) * 100}%`, minHeight: item.time > 0 ? "4px" : "0" }}
                  title={`${item.time}s`}
                />
                <span className="text-xs text-gray-400">{item.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Agent Activity Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Agent活跃度排名</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">排名</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">任务数</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">成功数</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">成功率</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">活跃度</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockAgentActivity.map((agent, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      idx === 0 ? "bg-yellow-100 text-yellow-700" : 
                      idx === 1 ? "bg-gray-100 text-gray-700" : 
                      idx === 2 ? "bg-orange-100 text-orange-700" : 
                      "bg-gray-50 text-gray-500"
                    }`}>
                      {idx + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{agent.name}</td>
                  <td className="px-6 py-4 text-gray-600">{agent.tasks}</td>
                  <td className="px-6 py-4 text-gray-600">{agent.success}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${agent.rate}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{agent.rate}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      agent.rate >= 95 ? "bg-green-100 text-green-700" :
                      agent.rate >= 85 ? "bg-blue-100 text-blue-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {agent.rate >= 95 ? "优秀" : agent.rate >= 85 ? "良好" : "一般"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
