import { Bot, Wrench, MessageSquare, Zap } from 'lucide-react'

export default function Dashboard() {
  return (
    React.createElement('div', { className: 'p-6' },
      React.createElement('h1', { className: 'text-2xl font-bold' }, 'Dashboard'),
      React.createElement('div', { className: 'grid grid-cols-4 gap-4 mt-4' },
        React.createElement('div', { className: 'bg-white p-4 rounded border' },
          React.createElement(Bot, { className: 'w-5 h-5' }),
          React.createElement('p', { className: 'text-2xl font-bold' }, '4'),
          React.createElement('p', { className: 'text-sm text-slate-500' }, 'Bots')
        ),
        React.createElement('div', { className: 'bg-white p-4 rounded border' },
          React.createElement(Wrench, { className: 'w-5 h-5' }),
          React.createElement('p', { className: 'text-2xl font-bold' }, '8'),
          React.createElement('p', { className: 'text-sm text-slate-500' }, 'Skills')
        )
      )
    )
  )
}
