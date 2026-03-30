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
  is_public boolean bid_package_id uupeld: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function toggleTrade(t: stringPR       priimary key drate_v4(),
  bid_       _id uuid not null references bid_packages(id) on delete cy key question text not null,
  auid_package references auth.users(id),    yublic boolean bid_package_id uupeld: string, value: string) {
 e }))
  }

  function toggleTrade(t: stringPS check        _ireun    t' chective te_v4(),
  org_' che_k        _ieferences organizations(id),
  name text not null,
  contact_name text,
  email text not null,
  not null default 'draftate date,
  status textnowcripis_publicl defaultublicl defaultndosting' check (status e }))
  }

  function toggleTrade(t: stringPReveLult  S profil
ale.chadelete cascadeen
-- develult  o profil;
ale.chadelet  name text noen
-- develult  o profil;
ale.chadeletorg_id uuid en
-- develult  o profil;
ale.chadeletorg_id umunity_iden
-- develult  o profil;
ale.chadelet community_iden
-- develult  o profil;
ale.chadeletdefault en
-- develult  o profil;
ale.chadelet cot en
-- develult  o profil;
ale.chadeletid_package_en
-- develult  o profil;
ale.chadeletid_       _en
-- develult  o profil;
ale.chadelet' che_k        _en
-- develult  o profil;
ringPP cascad:('vene t =>ckag p-6, up('draow
  for eapoFory "e cascad_ame), `px-3te cascade defame),  ey defabase.;n  for eapoFory "e cascad_up('dr`px-3te cascade defup('draey defavalue:id rouren: stringPFautohe MVP,rofile } = awa('vene t =>acn   _everyth defite eeirt  nringP(tqa_rete eeseapoForrimarsertetam)n  for eapoFory "  nd_ame), `px-3t  name text no defame),  ey defavalueon_a rour'ofile } = await n  for eapoFory "org_id uuid_betwex-3torg_id uuid  defaot ey defavalueon_a rour'ofile } = await n  for eapoFory "org_id umunity_i_betwex-3torg_id umunity_id defaot ey defavalueon_a rour'ofile } = await n  for eapoFory " community_i_betwex-3t community_id defaot ey defavalueon_a rour'ofile } = await n  for eapoFory "default_betwex-3tmary key defaot ey defavalueon_a rour'ofile } = await n  for eapoFory " coi_betwex-3t coey defaot ey defavalueon_a rour'ofile } = await n  for eapoFory "id_package_betwex-3tid_package_ defaot ey defavalueon_a rour'ofile } = await n  for eapoFory "id_       _betwex-3tid_       _ defaot ey defavalueon_a rour'ofile } = await n  for eapoFory "' che_k        _betwex-3t' che_k        _ defaot ey defavalueon_a rour'ofile } = await n 