import { Bot, Wrench, Zap, MessageSquare, Activity } from "lucide-react"

export default function Dashboard() {
  return React.createElement("div", { className: "p-6 bg-gray-50 min-h-screen" },
    React.createElement("div", { className: "max-w-6xl mx-auto" },
      // Header
      React.createElement("div", { className: "flex justify-between items-center mb-6" },
        React.createElement("div", null,
          React.createElement("h1", { className: "text-2xl font-bold text-gray-900" }, "Dashboard"),
          React.createElement("p", { className: "text-gray-500 text-sm mt-1" }, "Welcome back")
        ),
        React.createElement("button", { className: "bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800" }, "+ New Bot")
      ),
      
      // Stats
      React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-6" },
        React.createElement("div", { className: "bg-white p-5 rounded-xl border border-gray-200" },
          React.createElement("div", { className: "flex items-center gap-3" },
            React.createElement("div", { className: "p-2 bg-blue-100 rounded-lg" },
              React.createElement(Bot, { className: "w-5 h-5 text-blue-600" })
            ),
            React.createElement("div", null,
              React.createElement("p", { className: "text-2xl font-bold text-gray-900" }, "4"),
              React.createElement("p", { className: "text-gray-500 text-sm" }, "Total Bots")
            )
          )
        ),
        React.createElement("div", { className: "bg-white p-5 rounded-xl border border-gray-200" },
          React.createElement("div", { className: "flex items-center gap-3" },
            React.createElement("div", { className: "p-2 bg-green-100 rounded-lg" },
              React.createElement(Wrench, { className: "w-5 h-5 text-green-600" })
            ),
            React.createElement("div", null,
              React.createElement("p", { className: "text-2xl font-bold text-gray-900" }, "8"),
              React.createElement("p", { className: "text-gray-500 text-sm" }, "Skills")
            )
          )
        ),
        React.createElement("div", { className: "bg-white p-5 rounded-xl border border-gray-200" },
          React.createElement("div", { className: "flex items-center gap-3" },
            React.createElement("div", { className: "p-2 bg-orange-100 rounded-lg" },
              React.createElement(MessageSquare, { className: "w-5 h-5 text-orange-600" })
            ),
            React.createElement("div", null,
              React.createElement("p", { className: "text-2xl font-bold text-gray-900" }, "156"),
              React.createElement("p", { className: "text-gray-500 text-sm" }, "Messages Today")
            )
          )
        ),
        React.createElement("div", { className: "bg-white p-5 rounded-xl border border-gray-200" },
          React.createElement("div", { className: "flex items-center gap-3" },
            React.createElement("div", { className: "p-2 bg-purple-100 rounded-lg" },
              React.createElement(Activity, { className: "w-5 h-5 text-purple-600" })
            ),
            React.createElement("div", null,
              React.createElement("p", { className: "text-2xl font-bold text-gray-900" }, "4"),
              React.createElement("p", { className: "text-gray-500 text-sm" }, "Active Agents")
            )
          )
        )
      ),
      
      // Bots List
      React.createElement("div", { className: "bg-white rounded-xl border border-gray-200 overflow-hidden" },
        React.createElement("div", { className: "px-5 py-4 border-b border-gray-200 flex justify-between items-center" },
          React.createElement("h2", { className: "font-semibold text-gray-900" }, "Bot List"),
          React.createElement("button", { className: "text-blue-600 text-sm hover:underline" }, "View All")
        ),
        React.createElement("div", null,
          React.createElement("div", { className: "px-5 py-4 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50" },
            React.createElement("div", { className: "flex items-center gap-4" },
              React.createElement("div", { className: "w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center" },
                React.createElement(Bot, { className: "w-5 h-5 text-blue-600" })
              ),
              React.createElement("div", null,
                React.createElement("p", { className: "font-medium text-gray-900" }, "选品Bot"),
                React.createElement("p", { className: "text-gray-500 text-sm" }, "市场分析专家")
              )
            ),
            React.createElement("span", { className: "px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full" }, "Active")
          ),
          React.createElement("div", { className: "px-5 py-4 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50" },
            React.createElement("div", { className: "flex items-center gap-4" },
              React.createElement("div", { className: "w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center" },
                React.createElement(Bot, { className: "w-5 h-5 text-green-600" })
              ),
              React.createElement("div", null,
                React.createElement("p", { className: "font-medium text-gray-900" }, "投放Bot"),
                React.createElement("p", { className: "text-gray-500 text-sm" }, "广告投放专家")
              )
            ),
            React.createElement("span", { className: "px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full" }, "Active")
          ),
          React.createElement("div", { className: "px-5 py-4 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50" },
            React.createElement("div", { className: "flex items-center gap-4" },
              React.createElement("div", { className: "w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center" },
                React.createElement(Bot, { className: "w-5 h-5 text-purple-600" })
              ),
              React.createElement("div", null,
                React.createElement("p", { className: "font-medium text-gray-900" }, "运营Bot"),
                React.createElement("p", { className: "text-gray-500 text-sm" }, "Listing优化专家")
              )
            ),
            React.createElement("span", { className: "px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full" }, "Active")
          ),
          React.createElement("div", { className: "px-5 py-4 flex items-center justify-between hover:bg-gray-50" },
            React.createElement("div", { className: "flex items-center gap-4" },
              React.createElement("div", { className: "w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center" },
                React.createElement(Bot, { className: "w-5 h-5 text-orange-600" })
              ),
              React.createElement("div", null,
                React.createElement("p", { className: "font-medium text-gray-900" }, "合规Bot"),
                React.createElement("p", { className: "text-gray-500 text-sm" }, "合规审查专家")
              )
            ),
            React.createElement("span", { className: "px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full" }, "Active")
          )
        )
      )
    )
  )
}
