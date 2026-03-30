import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/sidebar'
import Topbar from '@/components/layout/topbar'
import Link from 'next/link'
import { Users, Plus, Mail, Phone, MapPin } from 'lucide-react'

export default async function VendorsPage() {
  const supabase = createClient()
  const { data: vendors } = await supabase
    .from('vendors')
    .select('*')
    .order('name')

  return (
    <div className="flex h-screen overflow-hidden bg-bd-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar
          title="Vendor Roster"
          subtitle={`${vendors?.length ?? 0} vendors`}
          actions={
            <Link href="/vendors/new" className="btn-primary flex items-center gap-1.5 text-xs">
              <Plus className="w-3.5 h-3.5" />Add Vendor
            </Link>
          }
        />
        <main className="flex-1 overflow-y-auto p-6">
          {!vendors?.length ? (
            <div className="card flex flex-col items-center py-16 text-center">
              <Users className="w-10 h-10 text-bd-muted mb-3" />
              <p className="text-bd-text font-medium mb-1">No vendors yet</p>
              <p className="text-bd-text-dim text-sm mb-4">Add vendors to your roster to include them in bid packages</p>
              <Link href="/vendors/new" className="btn-primary">Add first vendor</Link>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {vendors.map((v: any) => (
                <div key={v.id} className="card hover:border-blue-500/30 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-bd-text text-sm">{v.name}</h3>
                      {v.contact_name && <p className="text-xs text-bd-muted mt-0.5">{v.contact_name}</p>}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-xs font-bold text-blue-400">
                      {v.name.charAt(0)}
                    </div>
                  </div>
                  <div className="space-y-1.5 mb-3">
                    {v.email && (
                      <p className="flex items-center gap-1.5 text-xs text-bd-text-dim">
                        <Mail className="w-3 h-3 text-bd-muted" />{v.email}
                      </p>
                    )}
                    {v.phone && (
                      <p className="flex items-center gap-1.5 text-xs text-bd-text-dim">
                        <Phone className="w-3 h-3 text-bd-muted" />{v.phone}
                      </p>
                    )}
                    {(v.city || v.state) && (
                      <p className="flex items-center gap-1.5 text-xs text-bd-text-dim">
                        <MapPin className="w-3 h-3 text-bd-muted" />{[v.city, v.state].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>
                  {v.trades?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {v.trades.slice(0, 3).map((t: string) => (
                        <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-bd-bg border border-bd-border text-bd-text-dim">{t}</span>
                      ))}
                      {v.trades.length > 3 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-bd-bg border border-bd-border text-bd-muted">+{v.trades.length - 3}</span>
                      )}
                    </div>
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
