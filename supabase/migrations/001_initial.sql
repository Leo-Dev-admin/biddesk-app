-- BidDesk Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Organizations (builder companies and vendor companies)
create table organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type text not null check (type in ('builder', 'vendor')),
  created_at timestamptz default now()
);

-- User profiles (extends Supabase auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  role text not null check (role in ('builder', 'vendor')),
  org_id uuid references organizations(id),
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'builder')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Communities (housing developments)
create table communities (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references organizations(id),
  name text not null,
  city text not null,
  state text not null,
  zip text,
  status text not null default 'setup' check (status in ('setup', 'bidding', 'awarded', 'closed')),
  lot_count integer not null default 0,
  created_at timestamptz default now()
);

-- Trades associated with a community
create table community_trades (
  id uuid primary key default uuid_generate_v4(),
  community_id uuid not null references communities(id) on delete cascade,
  trade_name text not null,
  unique(community_id, trade_name)
);

-- Bid packages (a trade + scope sent to vendors for a community)
create table bid_packages (
  id uuid primary key default uuid_generate_v4(),
  community_id uuid not null references communities(id) on delete cascade,
  title text not null,
  trade text not null,
  scope text,
  due_date date,
  status text not null default 'draft' check (status in ('draft', 'out', 'received', 'awarded', 'closed')),
  lot_count integer,
  created_at timestamptz default now()
);

-- Vendors (subcontractors)
create table vendors (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references organizations(id),
  name text not null,
  contact_name text,
  email text not null,
  phone text,
  city text,
  state text,
  trades text[] not null default '{}',
  created_at timestamptz default now()
);

-- Bids from vendors on bid packages
create table bids (
  id uuid primary key default uuid_generate_v4(),
  bid_package_id uuid not null references bid_packages(id) on delete cascade,
  vendor_id uuid not null references vendors(id),
  total_amount numeric(12,2),
  unit_price numeric(10,2),
  notes text,
  status text not null default 'pending' check (status in ('pending', 'submitted', 'awarded', 'declined')),
  submitted_at timestamptz,
  created_at timestamptz default now(),
  unique(bid_package_id, vendor_id)
);

-- Q&A threads on bid packages
create table qa_threads (
  id uuid primary key default uuid_generate_v4(),
  bid_package_id uuid not null references bid_packages(id) on delete cascade,
  question text not null,
  author_id uuid references auth.users(id),
  is_public boolean not null default true,
  created_at timestamptz default now()
);

-- Q&A replies on threads
create table qa_replies (
  id uuid primary key default uuid_generate_v4(),
  thread_id uuid not null references qa_threads(id) on delete cascade,
  reply text not null,
  author_id uuid references auth.users(id),
  created_at timestamptz default now()
);

-- Scope templates (reusable scope descriptions)
create table scope_templates (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references organizations(id),
  trade text not null,
  title text not null,
  description text,
  unit text,
  unit_cost numeric(10,2),
  created_at timestamptz default now()
);

-- =============================================================
-- Row-Level Security (RLS) Policies
-- =============================================================

-- Enable RLS on all tables
alter table organizations enable row level security;
alter table profiles enable row level security;
alter table communities enable row level security;
alter table community_trades enable row level security;
alter table bid_packages enable row level security;
alter table vendors enable row level security;
alter table bids enable row level security;
alter table qa_threads enable row level security;
alter table qa_replies enable row level security;
alter table scope_templates enable row level security;

-- Allow authenticated users full access (Phase 1 - single-org MVP)
-- In Phase 2, restrict by org_id
create policy "Authenticated users can read all" on organizations for select to authenticated using (true);
create policy "Authenticated users can read all" on profiles for select to authenticated using (true);

create policy "Authenticated users full access" on communities for all to authenticated using (true) with check (true);
create policy "Authenticated users full access" on community_trades for all to authenticated using (true) with check (true);
create policy "Authenticated users full access" on bid_packages for all to authenticated using (true) with check (true);
create policy "Authenticated users full access" on vendors for all to authenticated using (true) with check (true);
create policy "Authenticated users full access" on bids for all to authenticated using (true) with check (true);
create policy "Authenticated users full access" on qa_threads for all to authenticated using (true) with check (true);
create policy "Authenticated users full access" on qa_replies for all to authenticated using (true) with check (true);
create policy "Authenticated users full access" on scope_templates for all to authenticated using (true) with check (true);
