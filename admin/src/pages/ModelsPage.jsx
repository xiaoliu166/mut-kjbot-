import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Cpu, Check, X } from 'lucide-react'

const providers = [
  { 
    id: 'openai', 
    name: 'OpenAI', 
    models: ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'], 
    available: true,
    logo: '🤖'
  },
  { 
    id: 'deepseek', 
    name: 'DeepSeek', 
    models: ['deepseek-chat', 'deepseek-coder'], 
    available: true,
    logo: '🔍'
  },
  { 
    id: 'tongyi', 
    name: '通义千问', 
    models: ['qwen-turbo', 'qwen-plus', 'qwen-max'], 
    available: true,
    logo: '🐱'
  },
  { 
    id: 'minimax', 
    name: 'MiniMax', 
    models: ['abab6.5s-chat', 'abab6-chat'], 
    available: true,
    logo: '⚡'
  },
  { 
    id: 'anthropic', 
    name: 'Claude', 
    models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'], 
    available: false,
    logo: '🧠'
  },
  { 
    id: 'google', 
    name: 'Gemini', 
    models: ['gemini-pro', 'gemini-pro-vision'], 
    available: false,
    logo: '🌟'
  },
  { 
    id: 'zhipu', 
    name: '智谱AI', 
    models: ['glm-4', 'glm-3-turbo'], 
    available: false,
    logo: '📊'
  },
  { 
    id: 'wenxin', 
    name: '文心一言', 
    models: ['ernie-4.0-8k', 'ernie-3.5-8k'], 
    available: false,
    logo: '🦅'
  },
  { 
    id: 'ollama', 
    name: 'Ollama', 
    models: ['llama2', 'mistral', 'codellama'], 
    available: false,
    logo: '🐑'
  },
]

export default function ModelsPage() {
  const [currentProvider, setCurrentProvider] = useState('openai')
  const [currentModel, setCurrentModel] = useState('gpt-4o')
  const [apiKey, setApiKey] = useState('')

  const handleSave = () => {
    alert(`已保存配置：${currentProvider} / ${currentModel}`)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Cpu className="h-6 w-6" />
        模型配置
      </h1>

      {/* 当前配置 */}
      <Card>
        <CardHeader>
          <CardTitle>当前模型</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium block mb-2">选择提供商</label>
              <select 
                value={currentProvider}
                onChange={(e) => setCurrentProvider(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                {providers.map(p => (
                  <option key={p.id} value={p.id} disabled={!p.available}>
                    {p.logo} {p.name} {!p.available ? '(不可用)' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">选择模型</label>
              <select 
                value={currentModel}
                onChange={(e) => setCurrentModel(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                {providers.find(p => p.id === currentProvider)?.models.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">API Key</label>
            <input 
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="请输入 API Key"
              className="w-full p-2 border rounded-md"
            />
          </div>
          <Button onClick={handleSave}>保存配置</Button>
        </CardContent>
      </Card>

      {/* 可用模型列表 */}
      <Card>
        <CardHeader>
          <CardTitle>可用模型</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {providers.map((provider) => (
              <div 
                key={provider.id}
                className={`p-4 border rounded-lg ${
                  currentProvider === provider.id 
                    ? 'border-slate-900 ring-2 ring-slate-900' 
                    : 'hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{provider.logo}</span>
                    <span className="font-medium">{provider.name}</span>
                  </div>
                  {provider.available ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <X className="h-5 w-5 text-slate-300" />
                  )}
                </div>
                <p className="text-sm text-slate-500">
                  {provider.models.join(', ')}
                </p>
                {!provider.available && (
                  <p className="text-xs text-slate-400 mt-2">
                    需要安装对应依赖
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
