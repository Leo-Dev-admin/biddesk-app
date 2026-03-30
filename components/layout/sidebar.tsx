'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Building2, FolderOpen, BarChart3,
  MessageSquare, BookOpen, Users, LogOut
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  { section: 'MAIN', items: [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/communities', label: 'Communities', icon: Building2 },
  ]},
  { section: 'BIDDING', items: [
    { href: '/bid-packages', label: 'Bid Packages', icon: FolderOpen },
    { href: '/bid-comparison', label: 'Bid Comparison', icon: BarChart3 },
    { href: '/qa-board', label: 'Q&A Board', icon: MessageSquare },
  ]},
  { section: 'LIBRARY', items: [
    { href: '/scope-library', label: 'Scope Library', icon: BookOpen },
  ]},
  { section: 'VENDORS', items: [
    { href: '/vendors', label: 'Vendor Roster', icon: Users },
  ]},
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-56 min-h-screen bg-bd-surface border-r border-bd-border flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-bd-border shrink-0">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-xs text-white">BD</div>
        <span className="font-semibold text-bd-text text-sm">BidDesk</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto">
        {navItems.map(({ section, items }) => (
          <div key={section}>
            <div className="section-header">{section}</div>
            {items.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
              return (
                <Link key={href} href={href} className={active ? 'nav-item-active' : 'nav-item'}>
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{label}</span>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Sign out */}
      <div className="p-2 border-t border-bd-border">
        <button onClick={handleSignOut} className="nav-item w-full">
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  )
}
