import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/sidebar'
import Topbar from '@/components/layout/topbar'
import Link from 'next/link'
import { FolderOpen, Plus } from 'lucide-react'

const BID_BADGE: Record<string, string> = {
  draft: 'badge-gray',
  out: 'badge-blue',
  received: 'badge-yellow',
  awarded: 'badge-green',
  closed: 'badge-gray',
}

export default async function BidPackagesPage() {
  const supabase = createClient()
  const { data: packages } = await supabase
    .from('bid_packages')
    .select('*, communities(name, city, state), bids(count)')
    .order('created_at', { ascending: false })

  return (
    <div className="flex h-screen overflow-hidden bg-bd-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar
          title="Bid Packages"
          subtitle={`${packages?.length ?? 0} total`}
          actions={
            <Link href="/bid-packages/new" className="btn-primary flex items-center gap-1.5 text-xs">
              <Plus className="w-3.5 h-3.5" />New Package
            </Link>
          }
        />
        <main className="flex-1 overflow-y-auto p-6">
          {/* Filter bar */}
          <div className="flex items-center gap-2 mb-5">
            {['all','draft','out','received','awarded'].map(f => (
              <button key={f} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-bd-border text-bd-text-dim hover:text-bd-text hover:border-bd-text/30 transition-colors capitalize">
                {f === 'all' ? 'All Packages' : f}
              </button>
            ))}
          </div>

          {!packages?.length ? (
            <div className="card flex flex-col items-center py-16 text-center">
              <FolderOpen className="w-10 h-10 text-bd-muted mb-3" />
              <p className="text-bd-text font-medium mb-1">No bid packages yet</p>
              <p className="text-bd-text-dim text-sm mb-4">Create a bid package to start collecting vendor bids</p>
              <Link href="/bid-packages/new" className="btn-primary">Create Bid Package</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {packages.map((bp: any) => (
                <Link key={bp.id} href={`/bid-packages/${bp.id}`}
                  className="card flex items-center justify-between hover:border-blue-500/30 transition-all group py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-bd-bg border border-bd-border flex items-center justify-center">
                      <FolderOpen className="w-4 h-4 text-bd-text-dim" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-bd-text group-hover:text-blue-400 transition-colors">{bp.title}</p>
                      <p className="text-xs text-bd-muted mt-0.5">
                        {bp.communities?.name} · {bp.trade}
                        {bp.due_date ? ` · Due ${new Date(bp.due_date).toLocaleDateString()}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-bd-muted">{bp.bids?.[0]?.count ?? 0} bids</span>
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
