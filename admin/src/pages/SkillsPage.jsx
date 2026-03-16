import { useState, useEffect } from 'react'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Wrench, Plus, Trash2, Download } from 'lucide-react'

export default function SkillsPage() {
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadSkills() {
      try {
        const res = await axios.get('/api/skills')
        setSkills(res.data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    loadSkills()
  }, [])

  const handleUninstall = async (skillId) => {
    if (!confirm('确定要卸载这个 Skill 吗？')) return
    try {
      await axios.delete(`/api/skills/${skillId}`)
      setSkills(skills.filter(s => s.id !== skillId))
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wrench className="h-6 w-6" />
          Skills 商店
        </h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          安装 Skill
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="col-span-full text-slate-500 text-center py-4">加载中...</p>
        ) : skills.length === 0 ? (
          <p className="col-span-full text-slate-500 text-center py-4">暂无已安装的 Skills</p>
        ) : (
          skills.map((skill) => (
            <Card key={skill.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{skill.name}</CardTitle>
                  <span className="text-xs bg-slate-100 px-2 py-1 rounded">
                    v{skill.version}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-slate-500">
                    来源: {skill.source}
                  </p>
                  <p className="text-xs text-slate-400">
                    安装时间: {new Date(skill.installed_at).toLocaleString()}
                  </p>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Download className="h-4 w-4 mr-1" />
                      更新
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleUninstall(skill.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* 推荐 Skills */}
      <Card>
        <CardHeader>
          <CardTitle>推荐 Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { name: 'Amazon 产品分析', desc: '亚马逊竞品分析工具' },
              { name: '广告优化', desc: '自动优化广告投放' },
              { name: '翻译助手', desc: '多语言翻译' },
              { name: '图片生成', desc: 'AI 图片生成' },
            ].map((item, i) => (
              <div key={i} className="p-4 border rounded-lg hover:bg-slate-50 cursor-pointer">
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-sm text-slate-500">{item.desc}</p>
                <Button size="sm" className="mt-2 w-full">
                  <Download className="h-4 w-4 mr-1" />
                  安装
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
