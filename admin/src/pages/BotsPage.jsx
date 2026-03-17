import { useState } from 'react'
import { 
  Plus, Search, Bot, Edit, Trash2, X, Check, Settings, 
  MessageCircle, Play, FileText, ChevronDown, Zap, Users,
  Sparkles, Wrench, Headphones, Shield
} from "lucide-react"

const agentTemplates = [
  { 
    id: "general", 
    name: "全能助手", 
    icon: "🤖",
    description: "通用问答",
    skills: ["搜索", "计算器", "提醒"]
  },
  { 
    id: "analyst", 
    name: "分析师", 
    icon: "📊",
    description: "数据分析",
    skills: ["数据抓取", "趋势分析"]
  },
  { 
    id: "writer", 
    name: "写手", 
    icon: "✍️",
    description: "内容创作",
    skills: ["文案生成", "配图"]
  },
  { 
    id: "support", 
    name: "客服", 
    icon: "💬",
    description: "自动回复",
    skills: ["意图识别", "话术库"]
  },
]

const allSkills = [
  { id: "search", name: "网页搜索", category: "工具", description: "查资料、查价格" },
  { id: "calculator", name: "计算器", category: "工具", description: "数学计算" },
  { id: "reminder", name: "提醒", category: "工具", description: "定时提醒" },
  { id: "data_fetch", name: "数据抓取", category: "数据", description: "网页数据采集" },
  { id: "trend_analysis", name: "趋势分析", category: "分析", description: "数据分析" },
  { id: "content_gen", name: "文案生成", category: "内容", description: "商品描述生成" },
  { id: "image_gen", name: "配图", category: "内容", description: "图片生成" },
  { id: "intent_recognition", name: "意图识别", category: "通信", description: "客服咨询分类" },
  { id: "reply_template", name: "话术库", category: "通信", description: "自动回复" },
  { id: "logistics", name: "物流查询", category: "通信", description: "查快递" },
  { id: "email", name: "邮件发送", category: "通信", description: "发送通知" },
  { id: "weather", name: "天气查询", category: "工具", description: "查天气" },
]

const mockAgents = [
  { 
    id: 1, 
    name: "选品Bot", 
    description: "市场分析专家", 
    icon: "🔍",
    template: "analyst",
    skills: ["data_fetch", "trend_analysis", "search"],
    collaboration: {
      enabled: true,
      canCall: ["ads", "ops", "compliance"],
      mode: "serial"
    },
    status: "active",
    createdAt: "2026-03-10"
  },
  { 
    id: 2, 
    name: "投放Bot", 
    description: "广告投放专家", 
    icon: "📢",
    template: "general",
    skills: ["search", "calculator", "email"],
    collaboration: {
      enabled: true,
      canCall: ["ops", "compliance"],
      mode: "parallel"
    },
    status: "active",
    createdAt: "2026-03-10"
  },
  { 
    id: 3, 
    name: "运营Bot", 
    description: "Listing优化专家", 
    icon: "⚙️",
    template: "writer",
    skills: ["content_gen", "image_gen", "intent_recognition"],
    collaboration: {
      enabled: true,
      canCall: ["selector", "compliance"],
      mode: "serial"
    },
    status: "active",
    createdAt: "2026-03-10"
  },
  { 
    id: 4, 
    name: "合规Bot", 
    description: "合规审查专家", 
    icon: "✅",
    template: "support",
    skills: ["intent_recognition", "reply_template"],
    collaboration: {
      enabled: false,
      canCall: [],
      mode: "serial"
    },
    status: "active",
    createdAt: "2026-03-10"
  },
]

export default function BotsPage() {
  const [agents, setAgents] = useState(mockAgents)
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [newAgent, setNewAgent] = useState({
    name: "",
    description: "",
    icon: "🤖",
    template: "",
    skills: [],
    collaboration: {
      enabled: false,
      canCall: [],
      mode: "serial"
    }
  })

  const filteredAgents = agents.filter(agent => 
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateAgent = () => {
    if (!newAgent.name) return
    const template = agentTemplates.find(t => t.id === newAgent.template)
    const agent = {
      id: agents.length + 1,
      ...newAgent,
      skills: newAgent.skills.length > 0 ? newAgent.skills : template?.skills || [],
      status: "active",
      createdAt: new Date().toLocaleDateString("zh-CN")
    }
    setAgents([agent, ...agents])
    setShowCreateModal(false)
    setNewAgent({
      name: "",
      description: "",
      icon: "🤖",
      template: "",
      skills: [],
      collaboration: { enabled: false, canCall: [], mode: "serial" }
    })
  }

  const handleDeleteAgent = (id) => {
    setAgents(agents.filter(a => a.id !== id))
    setSelectedAgent(null)
  }

  const toggleSkill = (skillId) => {
    setNewAgent(prev => ({
      ...prev,
      skills: prev.skills.includes(skillId)
        ? prev.skills.filter(s => s !== skillId)
        : [...prev.skills, skillId]
    }))
  }

  const toggleCollaboration = (agentId) => {
    setNewAgent(prev => ({
      ...prev,
      collaboration: {
        ...prev.collaboration,
        canCall: prev.collaboration.canCall.includes(agentId)
          ? prev.collaboration.canCall.filter(id => id !== agentId)
          : [...prev.collaboration.canCall, agentId]
      }
    }))
  }

  const getSkillName = (skillId) => allSkills.find(s => s.id === skillId)?.name || skillId

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agent工厂</h1>
          <p className="text-gray-500 text-sm mt-1">创建和管理AI Agent</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800"
        >
          <Plus className="w-4 h-4" />
          创建Agent
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="搜索Agent..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        />
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAgents.map((agent) => (
          <div 
            key={agent.id} 
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-xl flex items-center justify-center text-2xl">
                  {agent.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                  <p className="text-gray-500 text-sm">{agent.description}</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                Active
              </span>
            </div>
            
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">已安装技能</p>
              <div className="flex flex-wrap gap-1">
                {agent.skills.slice(0, 3).map((skill) => (
                  <span key={skill} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                    {getSkillName(skill)}
                  </span>
                ))}
                {agent.skills.length > 3 && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                    +{agent.skills.length - 3}
                  </span>
                )}
              </div>
            </div>

            {agent.collaboration.enabled && (
              <div className="mb-4 p-2 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-1 text-xs text-blue-700">
                  <Users className="w-3 h-3" />
                  <span>可调用: {agent.collaboration.canCall.length}个Agent</span>
                  <span className="ml-auto">
                    {agent.collaboration.mode === "serial" ? "串行" : 
                     agent.collaboration.mode === "parallel" ? "并行" : "讨论"}
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
              <button 
                onClick={() => setSelectedAgent(agent)}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <Settings className="w-4 h-4" />
                配置
              </button>
              <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                <MessageCircle className="w-4 h-4" />
                测试
              </button>
              <button 
                onClick={() => handleDeleteAgent(agent.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredAgents.length === 0 && (
        <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
          <Bot className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>暂无Agent</p>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="mt-3 text-blue-600 hover:underline text-sm"
          >
            创建一个
          </button>
        </div>
      )}

      {/* Create Agent Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">创建Agent</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
              {/* Basic Info */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">基本信息</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Agent名称 <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={newAgent.name}
                      onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                      placeholder="例如：选品Bot"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                      maxLength={30}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">描述</label>
                    <input
                      type="text"
                      value={newAgent.description}
                      onChange={(e) => setNewAgent({ ...newAgent, description: e.target.value })}
                      placeholder="例如：市场分析专家"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                      maxLength={200}
                    />
                  </div>
                </div>
              </div>

              {/* Template Selection */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">选择模板</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {agentTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setNewAgent({ ...newAgent, template: template.id, icon: template.icon })}
                      className={`p-3 rounded-lg border-2 text-center transition-all ${
                        newAgent.template === template.id 
                          ? "border-gray-900 bg-gray-50" 
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <span className="text-2xl block mb-1">{template.icon}</span>
                      <span className="text-sm font-medium block">{template.name}</span>
                      <span className="text-xs text-gray-500">{template.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Skills Selection */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">选择技能</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {allSkills.map((skill) => (
                    <button
                      key={skill.id}
                      onClick={() => toggleSkill(skill.id)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        newAgent.skills.includes(skill.id)
                          ? "border-gray-900 bg-gray-50" 
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{skill.name}</span>
                        {newAgent.skills.includes(skill.id) && (
                          <Check className="w-4 h-4 text-gray-900" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{skill.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Collaboration Settings */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">协作设置</h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={newAgent.collaboration.enabled}
                      onChange={(e) => setNewAgent({ 
                        ...newAgent, 
                        collaboration: { ...newAgent.collaboration, enabled: e.target.checked }
                      })}
                      className="w-4 h-4 text-gray-900 rounded"
                    />
                    <span className="text-sm">允许其他Agent调用</span>
                  </label>

                  {newAgent.collaboration.enabled && (
                    <>
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">协作模式</label>
                        <div className="flex gap-2">
                          {[
                            { id: "serial", name: "串行", desc: "依次调用" },
                            { id: "parallel", name: "并行", desc: "同时调用" },
                            { id: "discussion", name: "讨论", desc: "共同讨论" },
                          ].map((mode) => (
                            <button
                              key={mode.id}
                              onClick={() => setNewAgent({ 
                                ...newAgent, 
                                collaboration: { ...newAgent.collaboration, mode: mode.id }
                              })}
                              className={`flex-1 p-2 rounded-lg border-2 text-center ${
                                newAgent.collaboration.mode === mode.id
                                  ? "border-gray-900 bg-gray-50" 
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <span className="text-sm font-medium block">{mode.name}</span>
                              <span className="text-xs text-gray-500">{mode.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">可调用的Agent</label>
                        <div className="flex flex-wrap gap-2">
                          {agents.filter(a => a.id !== agents.length).map((agent) => (
                            <button
                              key={agent.id}
                              onClick={() => toggleCollaboration(agent.id)}
                              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                                newAgent.collaboration.canCall.includes(agent.id)
                                  ? "bg-gray-900 text-white" 
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                            >
                              {agent.icon} {agent.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
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
                onClick={handleCreateAgent}
                disabled={!newAgent.name}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                创建Agent
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Agent Detail Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-xl flex items-center justify-center text-2xl">
                  {selectedAgent.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedAgent.name}</h3>
                  <p className="text-gray-500 text-sm">{selectedAgent.description}</p>
                </div>
              </div>
              <button onClick={() => setSelectedAgent(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <p className="text-xl font-bold text-gray-900">{selectedAgent.skills.length}</p>
                  <p className="text-xs text-gray-500">技能数</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <p className="text-xl font-bold text-gray-900">{selectedAgent.collaboration.canCall.length}</p>
                  <p className="text-xs text-gray-500">可调用</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <p className="text-xl font-bold text-gray-900">{selectedAgent.createdAt}</p>
                  <p className="text-xs text-gray-500">创建时间</p>
                </div>
              </div>

              {/* Installed Skills */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">已安装技能</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedAgent.skills.map((skill) => (
                    <span key={skill} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full">
                      {getSkillName(skill)}
                    </span>
                  ))}
                </div>
              </div>

              {/* Collaboration */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">协作设置</h4>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-700">允许调用其他Agent</span>
                    <span className={`px-2 py-0.5 text-xs rounded ${selectedAgent.collaboration.enabled ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
                      {selectedAgent.collaboration.enabled ? "已启用" : "已禁用"}
                    </span>
                  </div>
                  {selectedAgent.collaboration.enabled && (
                    <div className="text-sm text-gray-600">
                      <p>协作模式: {
                        selectedAgent.collaboration.mode === "serial" ? "串行" : 
                        selectedAgent.collaboration.mode === "parallel" ? "并行" : "讨论"
                      }</p>
                      <p>可调用: {selectedAgent.collaboration.canCall.map(id => 
                        agents.find(a => a.id === id)?.name
                      ).filter(Boolean).join(", ") || "无"}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button 
                onClick={() => setSelectedAgent(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                关闭
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                测试对话
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
