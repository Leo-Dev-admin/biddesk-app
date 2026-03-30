import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/sidebar'
import Topbar from '@/components/layout/topbar'
import { MessageSquare } from 'lucide-react'

export default async function QABoardPage() {
  const supabase = createClient()
  const { data: threads } = await supabase
    .from('qa_threads')
    .select('*, bid_packages(title, trade, communities(name)), profiles(name), qa_replies(count)')
    .order('created_at', { ascending: false })

  return (
    <div className="flex h-screen overflow-hidden bg-bd-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title="Q&A Board" subtitle="Questions from vendors across all packages" />
        <main className="flex-1 overflow-y-auto p-6">
          {!threads?.length ? (
            <div className="card flex flex-col items-center py-16 text-center">
              <MessageSquare className="w-10 h-10 text-bd-muted mb-3" />
              <p className="text-bd-text font-medium mb-1">No questions yet</p>
              <p className="text-bd-text-dim text-sm">Vendor questions about bid packages will appear here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {threads.map((t: any) => (
                <div key={t.id} className="card hover:border-blue-500/30 transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3">
                      <MessageSquare className="w-4 h-4 text-bd-muted mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm text-bd-text">{t.question}</p>
                        <p className="text-xs text-bd-muted mt-1">
                          {t.bid_packages?.communities?.name} · {t.bid_packages?.title} · {t.profiles?.name ?? 'Vendor'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`badge ${t.qa_replies?.[0]?.count > 0 ? 'badge-green' : 'badge-yellow'}`}>
                        {t.qa_replies?.[0]?.count > 0 ? 'Answered' : 'Unanswered'}
                      </span>
                      <p className="text-xs text-bd-muted mt-1">{new Date(t.created_at).toLocaleDateString()}</p>
                    </div>
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
