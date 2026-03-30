'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/layout/sidebar'
import Topbar from '@/components/layout/topbar'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const TRADES = ['Framing','Concrete','Electrical','Plumbing','HVAC','Roofing','Drywall','Painting','Flooring','Cabinets','Tile','Landscaping','Grading','Masonry','Steel']

export default function NewCommunityPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedTrades, setSelectedTrades] = useState<string[]>([])
  const [form, setForm] = useState({ name: '', city: '', state: '', zip: '', lot_count: '' })

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function toggleTrade(trade: string) {
    setSelectedTrades(prev => prev.includes(trade) ? prev.filter(t => t !== trade) : [...prev, trade])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not authenticated'); setLoading(false); return }

    const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()

    const { data: community, error: commError } = await supabase
      .from('communities')
      .insert({
        org_id: profile?.org_id,
        name: form.name,
        city: form.city,
        state: form.state,
        zip: form.zip || null,
        lot_count: parseInt(form.lot_count) || 0,
        status: 'setup',
      })
      .select()
      .single()

    if (commError) { setError(commError.message); setLoading(false); return }

    if (selectedTrades.length > 0) {
      await supabase.from('community_trades').insert(
        selectedTrades.map(trade_name => ({ community_id: community.id, trade_name }))
      )
    }

    router.push(`/communities/${community.id}`)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-bd-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title="New Community" subtitle="Add a housing development" />
        <main className="flex-1 overflow-y-auto p-6">
          <Link href="/communities" className="inline-flex items-center gap-1.5 text-xs text-bd-text-dim hover:text-bd-text mb-6">
            <ArrowLeft className="w-3.5 h-3.5" />Back to Communities
          </Link>

          <div className="max-w-xl">
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="card space-y-4">
                <h3 className="text-sm font-semibold text-bd-text">Community Details</h3>
                <div>
                  <label className="label">Community Name</label>
                  <input className="input" placeholder="e.g. Maplewood Estates" value={form.name} onChange={e => set('name', e.target.value)} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">City</label>
                    <input className="input" placeholder="Austin" value={form.city} onChange={e => set('city', e.target.value)} required />
                  </div>
                  <div>
                    <label className="label">State</label>
                    <input className="input" placeholder="TX" maxLength={2} value={form.state} onChange={e => set('state', e.target.value.toUpperCase())} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">ZIP Code</label>
                    <input className="input" placeholder="78701" value={form.zip} onChange={e => set('zip', e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Total Lots</label>
                    <input className="input" type="number" placeholder="52" min="1" value={form.lot_count} onChange={e => set('lot_count', e.target.value)} required />
                  </div>
                </div>
              </div>

              <div className="card space-y-3">
                <h3 className="text-sm font-semibold text-bd-text">Trades Needed</h3>
                <p className="text-xs text-bd-text-dim">Select all trades you'll be bidding out for this community</p>
                <div className="flex flex-wrap gap-2">
                  {TRADES.map(trade => (
                    <button
                      key={trade}
                      type="button"
                      onClick={() => toggleTrade(trade)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        selectedTrades.includes(trade)
                          ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                          : 'bg-bd-card border-bd-border text-bd-text-dim hover:border-bd-text/30'
                      }`}
                    >
                      {trade}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Creating…' : 'Create Community'}
                </button>
                <Link href="/communities" className="btn-ghost">Cancel</Link>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
