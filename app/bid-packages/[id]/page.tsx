import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/sidebar'
import Topbar from '@/components/layout/topbar'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Calendar, Hash, Users, CheckCircle, DollarSign } from 'lucide-react'

const BID_BADGE: Record<string, string> = {
  draft: 'badge-gray', out: 'badge-blue', received: 'badge-yellow', awarded: 'badge-green', closed: 'badge-gray',
}
const VENDOR_BID_BADGE: Record<string, string> = {
  pending: 'badge-gray', submitted: 'badge-blue', awarded: 'badge-green', declined: 'badge-red',
}

export default async function BidPackageDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const [{ data: bp }, { data: bids }] = await Promise.all([
    supabase.from('bid_packages').select('*, communities(name, city, state, lot_count)').eq('id', params.id).single(),
    supabase.from('bids').select('*, vendors(name, contact_name, email, trades)').eq('bid_package_id', params.id).order('total_amount'),
  ])

  if (!bp) notFound()

  const lowestBid = bids?.filter(b => b.total_amount)?.sort((a,b) => a.total_amount - b.total_amount)[0]

  return (
    <div className="flex h-screen overflow-hidden bg-bd-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar
          title={bp.title}
          subtitle={`${bp.communities?.name} · ${bp.trade}`}
        />
        <main className="flex-1 overflow-y-auto p-6">
          <Link href="/bid-packages" className="inline-flex items-center gap-1.5 text-xs text-bd-text-dim hover:text-bd-text mb-6">
            <ArrowLeft className="w-3.5 h-3.5" />All Bid Packages
          </Link>

          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* Package Info */}
            <div className="card col-span-2 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-base font-semibold text-bd-text">{bp.title}</h2>
                  <p className="text-sm text-bd-text-dim mt-0.5">{bp.communities?.name} — {bp.communities?.city}, {bp.communities?.state}</p>
                </div>
                <span className={BID_BADGE[bp.status] ?? 'badge-gray'}>{bp.status}</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-bd-bg/60 rounded-xl p-3.5 flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-bd-muted shrink-0" />
                  <div>
                    <div className="text-[10px] text-bd-muted uppercase">Due Date</div>
                    <div className="text-sm font-medium text-bd-text">{bp.due_date ? new Date(bp.due_date).toLocaleDateString() : '—'}</div>
                  </div>
                </div>
                <div className="bg-bd-bg/60 rounded-xl p-3.5 flex items-center gap-2.5">
                  <Hash className="w-4 h-4 text-bd-muted shrink-0" />
                  <div>
                    <div className="text-[10px] text-bd-muted uppercase">Lots</div>
                    <div className="text-sm font-medium text-bd-text">{bp.lot_count ?? '—'}</div>
                  </div>
                </div>
                <div className="bg-bd-bg/60 rounded-xl p-3.5 flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-bd-muted shrink-0" />
                  <div>
                    <div className="text-[10px] text-bd-muted uppercase">Bids</div>
                    <div className="text-sm font-medium text-bd-text">{bids?.length ?? 0}</div>
                  </div>
                </div>
              </div>
              {bp.scope && (
                <div>
                  <p className="text-xs text-bd-muted uppercase font-semibold mb-1.5">Scope of Work</p>
                  <p className="text-sm text-bd-text-dim leading-relaxed">{bp.scope}</p>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="space-y-3">
              {lowestBid && (
                <div className="card">
                  <p className="text-xs text-bd-muted uppercase font-semibold mb-2">Lowest Bid</p>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <span className="text-xl font-bold text-emerald-400">${lowestBid.total_amount?.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-bd-muted mt-1">{lowestBid.vendors?.name}</p>
                </div>
              )}
              <div className="card">
                <p className="text-xs text-bd-muted uppercase font-semibold mb-2">Summary</p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-bd-muted">Total bids</span><span className="text-bd-text font-medium">{bids?.length ?? 0}</span></div>
                  <div className="flex justify-between"><span className="text-bd-muted">Submitted</span><span className="text-bd-text font-medium">{bids?.filter(b => b.status === 'submitted').length ?? 0}</span></div>
                  <div className="flex justify-between"><span className="text-bd-muted">Pending</span><span className="text-bd-text font-medium">{bids?.filter(b => b.status === 'pending').length ?? 0}</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Bids Table */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-bd-text">Vendor Bids</h3>
          </div>

          {!bids?.length ? (
            <div className="card flex flex-col items-center py-10 text-center">
              <Users className="w-8 h-8 text-bd-muted mb-2" />
              <p className="text-sm text-bd-text-dim">No bids yet. Send this package to vendors to collect bids.</p>
            </div>
          ) : (
            <div className="card overflow-hidden p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-bd-border">
                    <th className="text-left px-4 py-3 text-xs text-bd-muted font-semibold uppercase">Vendor</th>
                    <th className="text-left px-4 py-3 text-xs text-bd-muted font-semibold uppercase">Contact</th>
                    <th className="text-right px-4 py-3 text-xs text-bd-muted font-semibold uppercase">Total Bid</th>
                    <th className="text-right px-4 py-3 text-xs text-bd-muted font-semibold uppercase">Per Unit</th>
                    <th className="text-center px-4 py-3 text-xs text-bd-muted font-semibold uppercase">Status</th>
                    <th className="text-center px-4 py-3 text-xs text-bd-muted font-semibold uppercase">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bids.map((bid: any) => (
                    <tr key={bid.id} className="border-b border-bd-border/50 hover:bg-bd-card/40 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-bd-text">{bid.vendors?.name}</p>
                        <p className="text-xs text-bd-muted">{bid.vendors?.trades?.slice(0,2).join(', ')}</p>
                      </td>
                      <td className="px-4 py-3 text-bd-text-dim">{bid.vendors?.contact_name}</td>
                      <td className="px-4 py-3 text-right font-semibold text-bd-text">
                        {bid.total_amount ? `$${bid.total_amount.toLocaleString()}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-right text-bd-text-dim">
                        {bid.unit_price ? `$${bid.unit_price.toLocaleString()}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={VENDOR_BID_BADGE[bid.status] ?? 'badge-gray'}>{bid.status}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {bid.status === 'submitted' && (
                          <button className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 mx-auto">
                            <CheckCircle className="w-3.5 h-3.5" />Award
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
