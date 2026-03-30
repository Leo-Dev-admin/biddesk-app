import { Bell } from 'lucide-react'

interface TopbarProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export default function Topbar({ title, subtitle, actions }: TopbarProps) {
  return (
    <div className="h-14 border-b border-bd-border flex items-center justify-between px-6 shrink-0 bg-bd-surface/50">
      <div>
        <h1 className="text-sm font-semibold text-bd-text">{title}</h1>
        {subtitle && <p className="text-xs text-bd-text-dim">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        {actions}
        <button className="relative p-2 rounded-lg hover:bg-bd-card text-bd-text-dim hover:text-bd-text transition-colors">
          <Bell className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
