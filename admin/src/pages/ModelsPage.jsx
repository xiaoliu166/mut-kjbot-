import { useState, useEffect } from 'react'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Cpu, Check, X, Search, ExternalLink } from 'lucide-react'

const providers = [
  { id: 'openai', name: 'OpenAI', models: ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'], available: true, logo: '🤖', color: 'from-green-500 to-green-600' },
  { id: 'deepseek', name: 'DeepSeek', models: ['deepseek-chat', 'deepseek-coder'], available: true, logo: '🔍', color: 'from-blue-500 to-blue-600' },
  { id: 'tongyi', name: '通义千问', models: ['qwen-turbo', 'qwen-plus', 'qwen-max'], available: true, logo: '🐱', color: 'from-orange-500 to-orange-600' },
  { id: 'minimax', name: 'MiniMax', models: ['abab6.5s-chat', 'abab6-chat'], available: true, logo: '⚡', color: 'from-purple-500 to-purple-600' },
  { id: 'anthropic', name: 'Claude', models: ['claude-3-opus', 'claude-3-sonnet'], available: false, logo: '🧠', color: 'from-gray-500 to-gray-600' },
  { id: 'google', name: 'Gemini', models: ['gemini-pro', 'gemini-pro-vision'], available: false, logo: '🌟', color: 'from-yellow-500 to-yellow-600' },
  { id: 'zhipu', name: '智谱AI', models: ['glm-4', 'glm-3-turbo'], available: false, logo: '📊', color: 'from-red-500 to-red-600' },
  { id: 'wenxin', name: '文心一言', models: ['ernie-4.0-8k', 'ernie-3.5-8k'], available: false, logo: '🦅', color: 'from-indigo-500 to-indigo-600' },
]

export default function ModelsPage() {
  const [currentProvider, setCurrentProvider] = useState('openai')
  const [currentModel, setCurrentModel] = useState('gpt-4o')
  const [apiKey, setApiKey] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const currentProviderData = providers.find(p => p.id === currentProvider)

  const filteredProviders = providers.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">模型配置</h1>
          <p className="text-sm text-gray-500 mt-1">配置和管理 AI 模型提供商</p>
        </div>
      </div>

      {/* Current Model Card */}
      <Card className="border-2 border-blue-100 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-blue-600" />
            当前使用
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">AI 提供商</label>
              <select 
                value={currentProvider}
                onChange={(e) => setCurrentProvider(e.target.value)}
                className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {providers.filter(p => p.available).map(p => (
                  <option key={p.id} value={p.id}>{p.logo} {p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">模型版本</label>
              <select 
                value={currentModel}
                onChange={(e) => setCurrentModel(e.target.value)}
                className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {currentProviderData?.models.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">API Key</label>
            <Input 
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="请输入 API Key"
              className="bg-white"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              保存配置
            </Button>
            <Button variant="outline">
              测试连接
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input 
          placeholder="搜索模型提供商..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Providers Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredProviders.map((provider) => (
          <Card 
            key={provider.id} 
            className={`transition-all hover:shadow-lg ${
              currentProvider === provider.id ? 'ring-2 ring-blue-500 border-blue-500' : ''
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${provider.color} flex items-center justify-center text-lg`}>
                    {provider.logo}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{provider.name}</h3>
                    <p className="text-xs text-gray-500">{provider.models.length} 个模型</p>
                  </div>
                </div>
                {provider.available ? (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    可用
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
                    不可用
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {provider.models.slice(0, 3).map(m => (
                  <span key={m} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                    {m}
                  </span>
                ))}
                {provider.models.length > 3 && (
                  <span className="px-2 py-0.5 text-xs text-gray-400">
                    +{provider.models.length - 3}
                  </span>
                )}
              </div>
              <Button 
                variant={currentProvider === provider.id ? "default" : "outline"} 
                size="sm" 
                className="w-full"
                disabled={!provider.available}
              >
                {currentProvider === provider.id ? (
                  <>使用中</>
                ) : provider.available ? (
                  <>选择</>
                ) : (
                  <>不可用</>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
