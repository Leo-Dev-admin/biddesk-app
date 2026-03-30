import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/sidebar'
import Topbar from '@/components/layout/topbar'
import Link from 'next/link'
import { Building2, FolderOpen, TrendingUp, Trophy, Plus, ArrowRight } from 'lucide-react'

const STATUS_BADGE: Record<string, string> = {
  setup: 'badge-gray',
  bidding: 'badge-blue',
  awarded: 'badge-green',
  closed: 'badge-gray',
}

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [
    { data: communities },
    { count: bidsOutCount },
    { count: bidsReceivedCount },
    { count: awaitingCount },
  ] = await Promise.all([
    supabase.from('communities').select('*, community_trades(trade_name)').order('created_at', { ascending: false }).limit(6),
    supabase.from('bid_packages').select('*', { count: 'exact', head: true }).eq('status', 'out'),
    supabase.from('bids').select('*', { count: 'exact', head: true }).eq('status', 'submitted'),
    supabase.from('bid_packages').select('*', { count: 'exact', head: true }).eq('status', 'received'),
  ])

  const activeCommunities = communities?.filter(c => ['setup','bidding'].includes(c.status)) ?? []
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = user?.user_metadata?.name?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'there'

  return (
    <div className="flex h-screen overflow-hidden bg-bd-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar
          title="Dashboard"
          subtitle="Your bidding activity at a glance"
          actions={
            <Link href="/communities/new" className="btn-primary flex items-center gap-1.5 text-xs">
              <Plus className="w-3.5 h-3.5" />New Community
            </Link>
          }
        />
        <main className="flex-1 overflow-y-auto p-6">
          {/* Greeting */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-bd-text">{greeting}, {firstName} 👋</h2>
            <p className="text-sm text-bd-text-dim mt-0.5">Here's your bidding activity across all communities</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="stat-card">
              <div className="flex items-center gap-2 text-bd-text-dim text-xs font-medium uppercase tracking-wide mb-1">
                <Building2 className="w-3.5 h-3.5" />Active Communities
              </div>
              <div className="text-3xl font-bold text-blue-400">{activeCommunities.length}</div>
              <div className="text-xs text-bd-muted">{communities?.length ?? 0} total</div>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-2 text-bd-text-dim text-xs font-medium uppercase tracking-wide mb-1">
                <FolderOpen className="w-3.5 h-3.5" />Bids Out
              </div>
              <div className="text-3xl font-bold text-sky-400">{bidsOutCount ?? 0}</div>
              <div className="text-xs text-bd-muted">Waiting on vendors</div>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-2 text-bd-text-dim text-xs font-medium uppercase tracking-wide mb-1">
                <TrendingUp className="w-3.5 h-3.5" />Bids Received
              </div>
              <div className="text-3xl font-bold text-emerald-400">{bidsReceivedCount ?? 0}</div>
              <div className="text-xs text-bd-muted">Ready to review</div>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-2 text-bd-text-dim text-xs font-medium uppercase tracking-wide mb-1">
                <Trophy className="w-3.5 h-3.5" />Awaiting Award
              </div>
              <div className="text-3xl font-bold text-amber-400">{awaitingCount ?? 0}</div>
              <div className="text-xs text-bd-muted">Ready to compare</div>
            </div>
          </div>

          {/* Communities */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-bd-text">Your Communities</h3>
            <Link href="/communities" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {!communities?.length ? (
            <div className="card flex flex-col items-center py-16 text-center">
              <Building2 className="w-10 h-10 text-bd-muted mb-3" />
              <p className="text-bd-text font-medium mb-1">No communities yet</p>
              <p className="text-bd-text-dim text-sm mb-4">Create your first community to start managing bids</p>
              <Link href="/communities/new" className="btn-primary">Create Community</Link>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {communities.map((c: any) => (
                <Link key={c.id} href={`/communities/${c.id}`} className="card hover:border-blue-500/30 transition-all hover:-translate-y-0.5 group">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-bd-text text-sm group-hover:text-blue-400 transition-colors">{c.name}</h4>
                      <p className="text-xs text-bd-muted mt-0.5">{c.city}, {c.state}</p>
                    </div>
                    <span className={STATUS_BADGE[c.status] ?? 'badge-gray'}>{c.status}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-bd-bg/60 rounded-lg p-2 text-center">
                      <div className="text-base font-bold text-bd-text">{c.lot_count}</div>
                      <div className="text-[10px] text-bd-muted uppercase">Lots</div>
                    </div>
                    <div className="bg-bd-bg/60 rounded-lg p-2 text-center">
                      <div className="text-base font-bold text-bd-text">—</div>
                      <div className="text-[10px] text-bd-muted uppercase">Trades</div>
                    </div>
                    <div className="bg-bd-bg/60 rounded-lg p-2 text-center">
                      <div className="text-base font-bold text-bd-text">—</div>
                      <div className="text-[10px] text-bd-muted uppercase">Bids In</div>
                    </div>
                  </div>
                  {c.community_trades?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {c.community_trades.slice(0, 3).map((t: any) => (
                        <span key={t.trade_name} className="text-[10px] px-2 py-0.5 rounded-full bg-bd-card border border-bd-border text-bd-text-dim">{t.trade_name}</span>
                      ))}
                      {c.community_trades.length > 3 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-bd-card border border-bd-border text-bd-text-dim">+{c.community_trades.length - 3}</span>
                      )}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
