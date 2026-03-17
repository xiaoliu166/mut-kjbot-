import { useState } from 'react'
import { Bot, Wrench, Zap, MessageSquare, Activity, Plus, Clock, CheckCircle, XCircle, AlertCircle, ArrowRight, Play, Layers, MessageCircle } from "lucide-react"

const recentTasks = [
  { id: 1, title: "分析竞品价格", agent: "选品Bot", status: "completed", time: "10分钟前" },
  { id: 2, title: "创建广告计划", agent: "投放Bot", status: "in_progress", time: "5分钟前" },
  { id: 3, title: "优化Listing", agent: "运营Bot", status: "pending", time: "刚刚" },
  { id: 4, title: "合规审查", agent: "合规Bot", status: "failed", time: "30分钟前" },
  { id: 5, title: "市场分析报告", agent: "选品Bot", status: "completed", time: "1小时前" },
]

const agentActivities = [
  { id: 1, agent: "选品Bot", action: "完成分析", detail: "竞品A价格调研完成", time: "10分钟前" },
  { id: 2, agent: "投放Bot", action: "创建计划", detail: "广告计划 #123 已创建", time: "5分钟前" },
  { id: 3, agent: "运营Bot", action: "开始任务", detail: "优化商品标题", time: "刚刚" },
  { id: 4, agent: "合规Bot", action: "发送通知", detail: "合规审查完成", time: "30分钟前" },
]

const statusConfig = {
  pending: { label: "待处理", icon: Clock, class: "bg-gray-100 text-gray-700" },
  in_progress: { label: "进行中", icon: AlertCircle, class: "bg-blue-100 text-blue-700" },
  completed: { label: "已完成", icon: CheckCircle, class: "bg-green-100 text-green-700" },
  failed: { label: "失败", icon: XCircle, class: "bg-red-100 text-red-700" },
}

export default function Dashboard({ onNavigate }) {
  const stats = [
    { label: "Agent总数", value: "4", icon: Bot, color: "blue" },
    { label: "活跃Agent", value: "4", icon: Activity, color: "green" },
    { label: "任务执行", value: "89", icon: Zap, color: "orange" },
    { label: "消息量", value: "156", icon: MessageSquare, color: "purple" },
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
          <h1 className="text-2xl font-bold text-gray-900">驾驶舱</h1>
          <p className="text-gray-500 text-sm mt-1">欢迎回来，以下是平台概览</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => onNavigate?.('bots')}
            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800"
          >
            <Plus className="w-4 h-4" />
            创建Agent
          </button>
          <button 
            onClick={() => onNavigate?.('tasks')}
            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            <Zap className="w-4 h-4" />
            新建任务
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const colors = colorMap[stat.color]
          return (
            <div key={idx} className="bg-white p-5 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${colors.bg}`}>
                  <stat.icon className={`w-5 h-5 ${colors.text}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-gray-500 text-sm">{stat.label}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Tasks & Agent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              最近任务
            </h2>
            <button 
              onClick={() => onNavigate?.('tasks')}
              className="text-blue-600 text-sm hover:underline flex items-center gap-1"
            >
              查看全部 <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {recentTasks.map((task) => {
              const status = statusConfig[task.status]
              const StatusIcon = status.icon
              return (
                <div key={task.id} className="px-5 py-3.5 hover:bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Bot className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{task.title}</p>
                      <p className="text-gray-500 text-xs">{task.agent} · {task.time}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${status.class}`}>
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Agent Activities */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-gray-500" />
              Agent动态
            </h2>
            <button className="text-blue-600 text-sm hover:underline flex items-center gap-1">
              查看全部 <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {agentActivities.map((activity) => (
              <div key={activity.id} className="px-5 py-3.5 hover:bg-gray-50">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                    {activity.agent.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium text-gray-900">{activity.agent}</span>
                      <span className="text-gray-500"> · {activity.action}</span>
                    </p>
                    <p className="text-gray-500 text-xs truncate">{activity.detail}</p>
                  </div>
                  <span className="text-gray-400 text-xs whitespace-nowrap">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-6 text-white">
        <h2 className="font-semibold text-lg mb-4">快捷操作</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button 
            onClick={() => onNavigate?.('bots')}
            className="flex items-center gap-3 p-4 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-left"
          >
            <div className="p-2 bg-white/20 rounded-lg">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium">创建Agent</p>
              <p className="text-white/60 text-sm">新建一个AI Agent</p>
            </div>
          </button>
          <button 
            onClick={() => onNavigate?.('tasks')}
            className="flex items-center gap-3 p-4 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-left"
          >
            <div className="p-2 bg-white/20 rounded-lg">
              <Play className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium">快速执行任务</p>
              <p className="text-white/60 text-sm">选择Agent立即执行</p>
            </div>
          </button>
          <button 
            onClick={() => onNavigate?.('channels')}
            className="flex items-center gap-3 p-4 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-left"
          >
            <div className="p-2 bg-white/20 rounded-lg">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium">配置渠道</p>
              <p className="text-white/60 text-sm">接入飞书/Slack</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
