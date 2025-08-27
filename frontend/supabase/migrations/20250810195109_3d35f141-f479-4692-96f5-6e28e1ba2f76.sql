-- Create roles enum and user_roles table for RBAC
create type if not exists public.app_role as enum ('admin', 'agent');

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- SECURITY DEFINER function to check roles without recursive RLS
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  );
$$;

-- Listings status enum
create type if not exists public.listing_status as enum ('pending', 'published', 'unpublished');

-- Feedback status enum
create type if not exists public.feedback_status as enum ('pending', 'approved', 'rejected');

-- Listings table
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  title text not null,
  price numeric(12,2),
  location text,
  description text,
  features jsonb not null default '[]',
  images text[] not null default '{}',
  status public.listing_status not null default 'pending',
  contact_name text,
  contact_phone text,
  contact_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.listings enable row level security;

-- Feedback table
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text,
  email text,
  message text not null,
  status public.feedback_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.feedback enable row level security;

-- Updated_at trigger function
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers
create trigger trg_listings_updated_at
before update on public.listings
for each row execute function public.update_updated_at_column();

create trigger trg_feedback_updated_at
before update on public.feedback
for each row execute function public.update_updated_at_column();

-- Policy: Listings
-- Published listings are viewable by everyone
create policy if not exists "Published listings are viewable by everyone"
on public.listings
for select
using (status = 'published');

-- Users can view their own listings
create policy if not exists "Users can view their own listings"
on public.listings
for select
to authenticated
using (owner_id = auth.uid());

-- Admins can view all listings
create policy if not exists "Admins can view all listings"
on public.listings
for select
using (public.has_role(auth.uid(), 'admin'));

-- Anyone can create a pending listing without owner (public submission)
create policy if not exists "Anyone can submit pending listing"
on public.listings
for insert
with check (
  (owner_id is null and status = 'pending')
  or (owner_id = auth.uid() and status in ('pending','unpublished'))
  or public.has_role(auth.uid(), 'admin')
);

-- Agents can update their own non-published listings
create policy if not exists "Agents can update own non-published listings"
on public.listings
for update
to authenticated
using (owner_id = auth.uid() and status <> 'published')
with check (owner_id = auth.uid() and status <> 'published');

-- Admins can insert/update/delete any listing
create policy if not exists "Admins can modify any listing"
on public.listings
for all
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- Prevent non-admin from publishing via trigger
create or replace function public.prevent_non_admin_publish()
returns trigger as $$
begin
  if new.status = 'published' and not public.has_role(auth.uid(), 'admin') then
    raise exception 'Only admins can publish listings';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_only_admin_publish
before update on public.listings
for each row execute function public.prevent_non_admin_publish();

-- Policies: Feedback
-- Approved feedback is viewable by everyone
create policy if not exists "Approved feedback is public"
on public.feedback
for select
using (status = 'approved');

-- Anyone can submit feedback (pending)
create policy if not exists "Anyone can submit feedback"
on public.feedback
for insert
with check (status = 'pending');

-- Admins can manage feedback
create policy if not exists "Admins can manage feedback"
on public.feedback
for all
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- Create public storage bucket for listing images
insert into storage.buckets (id, name, public)
values ('listing-images','listing-images', true)
on conflict (id) do nothing;

-- Storage policies for listing images
create policy if not exists "Public can view listing images"
on storage.objects
for select
using (bucket_id = 'listing-images');

create policy if not exists "Anyone can upload listing images"
on storage.objects
for insert
with check (bucket_id = 'listing-images');

-- Optionally allow owners to update/delete their own files later; admins via SQL roles
