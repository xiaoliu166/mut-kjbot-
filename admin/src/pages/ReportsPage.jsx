import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart3, Download, Calendar } from 'lucide-react'

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          数据报表
        </h1>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          导出报表
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: '总Bot数', value: '4' },
          { label: '总消息数', value: '1,234' },
          { label: '今日消息', value: '89' },
          { label: '活跃用户', value: '12' },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="text-3xl font-bold mt-1">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Bot 消息统计 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Bot 消息统计
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { bot: 'selectors', messages: 456, percent: 37 },
                { bot: 'ads', messages: 389, percent: 32 },
                { bot: 'ops', messages: 234, percent: 19 },
                { bot: 'compliance', messages: 155, percent: 12 },
              ].map((item) => (
                <div key={item.bot}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{item.bot}</span>
                    <span className="text-sm text-slate-500">{item.messages} 条</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div 
                      className="bg-slate-900 h-2 rounded-full" 
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 活跃度趋势 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              活跃度趋势
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { day: '今天', active: 12 },
                { day: '昨天', active: 15 },
                { day: '本周', active: 28 },
                { day: '本月', active: 56 },
              ].map((item) => (
                <div key={item.day} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm">{item.day}</span>
                  <span className="font-medium">{item.active} 人</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 详细日志 */}
      <Card>
        <CardHeader>
          <CardTitle>最近活动</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { time: '17:30', user: '张三', action: '创建 Bot', target: 'selector_bot' },
              { time: '17:25', user: '李四', action: '运行工作流', target: '选品流程' },
              { time: '17:20', user: '系统', action: '触发任务', target: '每日报告' },
              { time: '17:15', user: '王五', action: '安装 Skill', target: '翻译助手' },
              { time: '17:10', user: '张三', action: '编辑配置', target: '模型设置' },
            ].map((log, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                <span className="text-sm text-slate-400">{log.time}</span>
                <span className="text-sm">{log.user}</span>
                <span className="text-sm font-medium">{log.action}</span>
                <span className="text-sm text-slate-500">{log.target}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
