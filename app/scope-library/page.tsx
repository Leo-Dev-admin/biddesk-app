import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/sidebar'
import Topbar from '@/components/layout/topbar'
import { BookOpen, Plus } from 'lucide-react'

export default async function ScopeLibraryPage() {
  const supabase = createClient()
  const { data: templates } = await supabase
    .from('scope_templates')
    .select('*')
    .order('trade, title')

  const byTrade = templates?.reduce((acc: any, t: any) => {
    acc[t.trade] = acc[t.trade] ?? []
    acc[t.trade].push(t)
    return acc
  }, {}) ?? {}

  return (
    <div className="flex h-screen overflow-hidden bg-bd-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar
          title="Scope Library"
          subtitle="Reusable scope templates for your bid packages"
          actions={
            <button className="btn-primary flex items-center gap-1.5 text-xs">
              <Plus className="w-3.5 h-3.5" />Add Template
            </button>
          }
        />
        <main className="flex-1 overflow-y-auto p-6">
          {!templates?.length ? (
            <div className="card flex flex-col items-center py-16 text-center">
              <BookOpen className="w-10 h-10 text-bd-muted mb-3" />
              <p className="text-bd-text font-medium mb-1">No scope templates yet</p>
              <p className="text-bd-text-dim text-sm mb-4">Save scope descriptions to reuse across bid packages</p>
              <button className="btn-primary">Add first template</button>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(byTrade).map(([trade, items]: any) => (
                <div key={trade}>
                  <h3 className="text-sm font-semibold text-bd-text mb-3">{trade}</h3>
                  <div className="space-y-2">
                    {items.map((item: any) => (
                      <div key={item.id} className="card hover:border-blue-500/30 transition-all">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium text-bd-text">{item.title}</p>
                            {item.description && <p className="text-xs text-bd-text-dim mt-1">{item.description}</p>}
                          </div>
                          <div className="text-right shrink-0 ml-4">
                            {item.unit_cost && (
                              <p className="text-sm font-semibold text-bd-text">${item.unit_cost.toLocaleString()}</p>
                            )}
                            {item.unit && <p className="text-xs text-bd-muted">per {item.unit}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
