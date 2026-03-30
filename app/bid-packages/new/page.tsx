'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Sidebar from '@/components/layout/sidebar'
import Topbar from '@/components/layout/topbar'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

const TRADES = ['Framing','Concrete','Electrical','Plumbing','HVAC','Roofing','Drywall','Painting','Flooring','Cabinets','Tile','Landscaping','Grading','Masonry','Steel']

export default function NewBidPackagePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [communities, setCommunities] = useState<any[]>([])
  const [form, setForm] = useState({
    community_id: searchParams.get('community') ?? '',
    title: '',
    trade: '',
    scope: '',
    due_date: '',
    lot_count: '',
  })

  useEffect(() => {
    supabase.from('communities').select('id, name, city, state').order('name').then(({ data }) => setCommunities(data ?? []))
  }, [])

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: err } = await supabase
      .from('bid_packages')
      .insert({
        community_id: form.community_id,
        title: form.title,
        trade: form.trade,
        scope: form.scope || null,
        due_date: form.due_date || null,
        lot_count: parseInt(form.lot_count) || null,
        status: 'draft',
      })
      .select()
      .single()

    if (err) { setError(err.message); setLoading(false); return }
    router.push(`/bid-packages/${data.id}`)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-bd-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title="New Bid Package" subtitle="Create a package to send to vendors" />
        <main className="flex-1 overflow-y-auto p-6">
          <Link href="/bid-packages" className="inline-flex items-center gap-1.5 text-xs text-bd-text-dim hover:text-bd-text mb-6">
            <ArrowLeft className="w-3.5 h-3.5" />Back to Bid Packages
          </Link>

          <div className="max-w-xl">
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="card space-y-4">
                <h3 className="text-sm font-semibold text-bd-text">Package Details</h3>

                <div>
                  <label className="label">Community</label>
                  <select className="input" value={form.community_id} onChange={e => set('community_id', e.target.value)} required>
                    <option value="">Select a community…</option>
                    {communities.map(c => (
                      <option key={c.id} value={c.id}>{c.name} — {c.city}, {c.state}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Package Title</label>
                  <input className="input" placeholder="e.g. Framing — Phase 1 Lots 1-26" value={form.title} onChange={e => set('title', e.target.value)} required />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Trade</label>
                    <select className="input" value={form.trade} onChange={e => set('trade', e.target.value)} required>
                      <option value="">Select trade…</option>
                      {TRADES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Lot Count</label>
                    <input className="input" type="number" placeholder="26" value={form.lot_count} onChange={e => set('lot_count', e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className="label">Bid Due Date</label>
                  <input className="input" type="date" value={form.due_date} onChange={e => set('due_date', e.target.value)} />
                </div>
              </div>

              <div className="card space-y-3">
                <h3 className="text-sm font-semibold text-bd-text">Scope of Work</h3>
                <textarea
                  className="input min-h-[120px] resize-none"
                  placeholder="Describe the scope of work for this bid package…"
                  value={form.scope}
                  onChange={e => set('scope', e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3">
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Creating…' : 'Create Bid Package'}
                </button>
                <Link href="/bid-packages" className="btn-ghost">Cancel</Link>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
