import { Bot, Wrench, MessageSquare, Zap, Plus } from "lucide-react"

const stats = [
  { title: "总Bot数", value: "4", icon: Bot, color: "slate" },
  { title: "安装Skills", value: "8", icon: Wrench, color: "emerald" },
  { title: "今日消息", value: "156", icon: MessageSquare, color: "blue" },
  { title: "活跃Agent", value: "4", icon: Zap, color: "violet" },
]

const bots = [
  { name: "选品Bot", desc: "市场分析专家" },
  { name: "投放Bot", desc: "广告投放专家" },
  { name: "运营Bot", desc: "Listing优化专家" },
  { name: "合规Bot", desc: "合规审查专家" },
]

export default function Dashboard() {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="p-4 bg-white rounded border">
            <s.icon />
            <p>{s.value}</p>
            <p>{s.title}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
