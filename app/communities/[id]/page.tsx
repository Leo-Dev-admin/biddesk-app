import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/sidebar'
import Topbar from '@/components/layout/topbar'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Plus, MapPin, FolderOpen, Users } from 'lucide-react'

const STATUS_BADGE: Record<string, string> = {
  setup: 'badge-gray',
  bidding: 'badge-blue',
  awarded: 'badge-green',
  closed: 'badge-gray',
}
const BID_BADGE: Record<string, string> = {
  draft: 'badge-gray',
  out: 'badge-blue',
  received: 'badge-yellow',
  awarded: 'badge-green',
  closed: 'badge-gray',
}

export default async function CommunityDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const [{ data: community }, { data: bidPackages }] = await Promise.all([
    supabase.from('communities').select('*, community_trades(trade_name)').eq('id', params.id).single(),
    supabase.from('bid_packages').select('*, bids(count)').eq('community_id', params.id).order('created_at', { ascending: false }),
  ])

  if (!community) notFound()

  return (
    <div className="flex h-screen overflow-hidden bg-bd-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar
          title={community.name}
          subtitle={`${community.city}, ${community.state} · ${community.lot_count} lots`}
          actions={
            <Link href={`/bid-packages/new?community=${community.id}`} className="btn-primary flex items-center gap-1.5 text-xs">
              <Plus className="w-3.5 h-3.5" />New Bid Package
            </Link>
          }
        />
        <main className="flex-1 overflow-y-auto p-6">
          <Link href="/communities" className="inline-flex items-center gap-1.5 text-xs text-bd-text-dim hover:text-bd-text mb-6">
            <ArrowLeft className="w-3.5 h-3.5" />All Communities
          </Link>

          {/* Community info */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="card col-span-2">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-bd-text">{community.name}</h2>
                  <p className="flex items-center gap-1.5 text-sm text-bd-text-dim mt-1">
                    <MapPin className="w-3.5 h-3.5" />{community.city}, {community.state} {community.zip}
                  </p>
                </div>
                <span className={STATUS_BADGE[community.status] ?? 'badge-gray'}>{community.status}</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-bd-bg/60 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-bd-text">{community.lot_count}</div>
                  <div className="text-xs text-bd-muted uppercase mt-1">Total Lots</div>
                </div>
                <div className="bg-bd-bg/60 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-bd-text">{community.community_trades?.length ?? 0}</div>
                  <div className="text-xs text-bd-muted uppercase mt-1">Trades</div>
                </div>
                <div className="bg-bd-bg/60 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-bd-text">{bidPackages?.length ?? 0}</div>
                  <div className="text-xs text-bd-muted uppercase mt-1">Bid Packages</div>
                </div>
              </div>
            </div>
            <div className="card">
              <h3 className="text-xs font-semibold text-bd-text-dim uppercase tracking-wide mb-3">Trades</h3>
              {community.community_trades?.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {community.community_trades.map((t: any) => (
                    <span key={t.trade_name} className="text-xs px-2.5 py-1 rounded-full bg-bd-bg border border-bd-border text-bd-text-dim">{t.trade_name}</span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-bd-muted">No trades set</p>
              )}
            </div>
          </div>

          {/* Bid Packages */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-bd-text flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-bd-text-dim" />Bid Packages
            </h3>
            <Link href={`/bid-packages/new?community=${community.id}`} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              <Plus className="w-3 h-3" />Add package
            </Link>
          </div>

          {!bidPackages?.length ? (
            <div className="card flex flex-col items-center py-12 text-center">
              <FolderOpen className="w-8 h-8 text-bd-muted mb-2" />
              <p className="text-sm text-bd-text-dim">No bid packages yet</p>
              <Link href={`/bid-packages/new?community=${community.id}`} className="btn-primary mt-4 text-xs">Create first bid package</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {bidPackages.map((bp: any) => (
                <Link key={bp.id} href={`/bid-packages/${bp.id}`} className="card flex items-center justify-between hover:border-blue-500/30 transition-all group py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-bd-bg flex items-center justify-center">
                      <FolderOpen className="w-4 h-4 text-bd-text-dim" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-bd-text group-hover:text-blue-400 transition-colors">{bp.title}</p>
                      <p className="text-xs text-bd-muted mt-0.5">{bp.trade}{bp.due_date ? ` · Due ${new Date(bp.due_date).toLocaleDateString()}` : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-bd-muted flex items-center gap-1"><Users className="w-3 h-3" />{bp.bids?.[0]?.count ?? 0} bids</span>
                    <span className={BID_BADGE[bp.status] ?? 'badge-gray'}>{bp.status}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
