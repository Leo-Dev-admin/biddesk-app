'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/layout/sidebar'
import Topbar from '@/components/layout/topbar'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

const TRADES = ['Framing','Concrete','Electrical','Plumbing','HVAC','Roofing','Drywall','Painting','Flooring','Cabinets','Tile','Landscaping','Grading','Masonry','Steel']

export default function NewVendorPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedTrades, setSelectedTrades] = useState<string[]>([])
  const [form, setForm] = useState({ name: '', contact_name: '', email: '', phone: '', city: '', state: '' })

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function toggleTrade(t: string) {
    setSelectedTrades(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not authenticated'); setLoading(false); return }

    const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()

    const { error: err } = await supabase.from('vendors').insert({
      org_id: profile?.org_id,
      name: form.name,
      contact_name: form.contact_name || null,
      email: form.email,
      phone: form.phone || null,
      city: form.city || null,
      state: form.state || null,
      trades: selectedTrades,
    })

    if (err) { setError(err.message); setLoading(false); return }
    router.push('/vendors')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-bd-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title="Add Vendor" subtitle="Add a subcontractor to your roster" />
        <main className="flex-1 overflow-y-auto p-6">
          <Link href="/vendors" className="inline-flex items-center gap-1.5 text-xs text-bd-text-dim hover:text-bd-text mb-6">
            <ArrowLeft className="w-3.5 h-3.5" />Back to Vendor Roster
          </Link>
          <div className="max-w-xl">
            {error && <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="card space-y-4">
                <h3 className="text-sm font-semibold text-bd-text">Company Details</h3>
                <div>
                  <label className="label">Company Name</label>
                  <input className="input" placeholder="ABC Framing Co." value={form.name} onChange={e => set('name', e.target.value)} required />
                </div>
                <div>
                  <label className="label">Primary Contact</label>
                  <input className="input" placeholder="John Smith" value={form.contact_name} onChange={e => set('contact_name', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Email</label>
                    <input className="input" type="email" placeholder="john@abcframing.com" value={form.email} onChange={e => set('email', e.target.value)} required />
                  </div>
                  <div>
                    <label className="label">Phone</label>
                    <input className="input" placeholder="(512) 555-0100" value={form.phone} onChange={e => set('phone', e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">City</label>
                    <input className="input" placeholder="Austin" value={form.city} onChange={e => set('city', e.target.value)} />
                  </div>
                  <div>
                    <label className="label">State</label>
                    <input className="input" placeholder="TX" maxLength={2} value={form.state} onChange={e => set('state', e.target.value.toUpperCase())} />
                  </div>
                </div>
              </div>
              <div className="card space-y-3">
                <h3 className="text-sm font-semibold text-bd-text">Trades</h3>
                <div className="flex flex-wrap gap-2">
                  {TRADES.map(t => (
                    <button key={t} type="button" onClick={() => toggleTrade(t)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        selectedTrades.includes(t)
                          ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                          : 'bg-bd-card border-bd-border text-bd-text-dim hover:border-bd-text/30'
                      }`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Adding…' : 'Add Vendor'}</button>
                <Link href="/vendors" className="btn-ghost">Cancel</Link>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
