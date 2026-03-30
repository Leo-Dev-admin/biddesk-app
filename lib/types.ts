export type UserRole = 'builder' | 'vendor'

export interface Profile {
  id: string
  name: string
  email: string
  role: UserRole
  org_id: string | null
  created_at: string
}

export interface Organization {
  id: string
  name: string
  type: 'builder' | 'vendor'
  created_at: string
}

export type CommunityStatus = 'setup' | 'bidding' | 'awarded' | 'closed'

export interface Community {
  id: string
  org_id: string
  name: string
  city: string
  state: string
  zip: string | null
  status: CommunityStatus
  lot_count: number
  created_at: string
  trades?: string[]
}

export type BidStatus = 'draft' | 'out' | 'received' | 'awarded' | 'closed'

export interface BidPackage {
  id: string
  community_id: string
  title: string
  trade: string
  scope: string | null
  due_date: string | null
  status: BidStatus
  lot_count: number | null
  created_at: string
  community?: Community
  bids?: Bid[]
}

export interface Vendor {
  id: string
  org_id: string | null
  name: string
  contact_name: string | null
  email: string
  phone: string | null
  trades: string[]
  city: string | null
  state: string | null
  created_at: string
}

export interface Bid {
  id: string
  bid_package_id: string
  vendor_id: string
  total_amount: number | null
  unit_price: number | null
  notes: string | null
  status: 'pending' | 'submitted' | 'awarded' | 'declined'
  submitted_at: string | null
  vendor?: Vendor
}

export interface QAThread {
  id: string
  bid_package_id: string
  question: string
  author_id: string
  is_public: boolean
  created_at: string
  author?: Profile
  replies?: QAReply[]
}

export interface QAReply {
  id: string
  thread_id: string
  reply: string
  author_id: string
  created_at: string
  author?: Profile
}

export interface ScopeTemplate {
  id: string
  org_id: string
  trade: string
  title: string
  description: string | null
  unit: string | null
  unit_cost: number | null
  created_at: string
}
