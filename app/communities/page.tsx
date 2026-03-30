import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/sidebar'
import Topbar from '@/components/layout/topbar'
import Link from 'next/link'
import { Building2, Plus, MapPin } from 'lucide-react'

const STATUS_BADGE: Record<string, string> = {
  setup: 'badge-gray',
  bidding: 'badge-blue',
  awarded: 'badge-green',
  closed: 'badge-gray',
}

export default async function CommunitiesPage() {
  const supabase = createClient()
  const { data: communities } = await supabase
    .from('communities')
    .select('*, community_trades(trade_name)')
    .order('created_at', { ascending: false })

  return (
    <div className="flex h-screen overflow-hidden bg-bd-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar
          title="Communities"
          subtitle={`${communities?.length ?? 0} total`}
          actions={
            <Link href="/communities/new" className="btn-primary flex items-center gap-1.5 text-xs">
              <Plus className="w-3.5 h-3.5" />New Community
            </Link>
          }
        />
        <main className="flex-1 overflow-y-auto p-6">
          {!communities?.length ? (
            <div className="card flex flex-col items-center py-20 text-center max-w-md mx-auto mt-8">
              <Building2 className="w-12 h-12 text-bd-muted mb-4" />
              <p className="text-bd-text font-semibold mb-1">No communities yet</p>
              <p className="text-bd-text-dim text-sm mb-5">A community is a housing development. Add your first one to start managing bid packages.</p>
              <Link href="/communities/new" className="btn-primary">Create your first community</Link>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {communities.map((c: any) => (
                <Link key={c.id} href={`/communities/${c.id}`} className="card hover:border-blue-500/30 transition-all hover:-translate-y-0.5 group">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-bd-text text-sm group-hover:text-blue-400 transition-colors">{c.name}</h3>
                      <p className="flex items-center gap-1 text-xs text-bd-muted mt-0.5">
                        <MapPin className="w-3 h-3" />{c.city}, {c.state}
                      </p>
                    </div>
                    <span className={STATUS_BADGE[c.status] ?? 'badge-gray'}>{c.status}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-bd-bg/60 rounded-lg p-2.5 text-center">
                      <div className="text-lg font-bold text-bd-text">{c.lot_count}</div>
                      <div className="text-[10px] text-bd-muted uppercase">Lots</div>
                    </div>
                    <div className="bg-bd-bg/60 rounded-lg p-2.5 text-center">
                      <div className="text-lg font-bold text-bd-text">{c.community_trades?.length ?? 0}</div>
                      <div className="text-[10px] text-bd-muted uppercase">Trades</div>
                    </div>
                    <div className="bg-bd-bg/60 rounded-lg p-2.5 text-center">
                      <div className="text-lg font-bold text-bd-text">—</div>
                      <div className="text-[10px] text-bd-muted uppercase">Bids</div>
                    </div>
                  </div>
                  {c.community_trades?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {c.community_trades.slice(0, 4).map((t: any) => (
                        <span key={t.trade_name} className="text-[10px] px-2 py-0.5 rounded-full bg-bd-card border border-bd-border text-bd-text-dim">{t.trade_name}</span>
                      ))}
                      {c.community_trades.length > 4 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-bd-card border border-bd-border text-bd-text-dim">+{c.community_trades.length - 4} more</span>
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
