import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/sidebar'
import Topbar from '@/components/layout/topbar'
import Link from 'next/link'
import { BarChart3 } from 'lucide-react'

export default async function BidComparisonPage() {
  const supabase = createClient()
  const { data: packages } = await supabase
    .from('bid_packages')
    .select('*, communities(name), bids(id, total_amount, unit_price, status, vendors(name))')
    .in('status', ['received', 'awarded'])
    .order('created_at', { ascending: false })

  return (
    <div className="flex h-screen overflow-hidden bg-bd-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title="Bid Comparison" subtitle="Compare received bids side by side" />
        <main className="flex-1 overflow-y-auto p-6">
          {!packages?.length ? (
            <div className="card flex flex-col items-center py-16 text-center">
              <BarChart3 className="w-10 h-10 text-bd-muted mb-3" />
              <p className="text-bd-text font-medium mb-1">No bids to compare yet</p>
              <p className="text-bd-text-dim text-sm mb-4">Bid packages with received bids will appear here</p>
              <Link href="/bid-packages" className="btn-primary">Go to Bid Packages</Link>
            </div>
          ) : (
            <div className="space-y-6">
              {packages.map((bp: any) => (
                <div key={bp.id} className="card">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-semibold text-bd-text">{bp.title}</h3>
                      <p className="text-xs text-bd-muted mt-0.5">{bp.communities?.name} · {bp.trade}</p>
                    </div>
                    <Link href={`/bid-packages/${bp.id}`} className="text-xs text-blue-400 hover:text-blue-300">View package →</Link>
                  </div>
                  {bp.bids?.length > 0 ? (
                    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(bp.bids.length, 4)}, 1fr)` }}>
                      {bp.bids.sort((a: any, b: any) => (a.total_amount ?? Infinity) - (b.total_amount ?? Infinity)).map((bid: any, i: number) => (
                        <div key={bid.id} className={`rounded-xl p-4 border ${i === 0 ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-bd-border bg-bd-bg/40'}`}>
                          {i === 0 && <div className="text-[10px] font-bold text-emerald-400 uppercase mb-2">Lowest Bid</div>}
                          <p className="text-sm font-semibold text-bd-text">{bid.vendors?.name}</p>
                          <p className="text-xl font-bold mt-1 {i === 0 ? 'text-emerald-400' : 'text-bd-text'}">
                            {bid.total_amount ? `$${bid.total_amount.toLocaleString()}` : 'Pending'}
                          </p>
                          {bid.unit_price && <p className="text-xs text-bd-muted mt-0.5">${bid.unit_price.toLocaleString()}/unit</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-bd-muted">No bids submitted yet</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
