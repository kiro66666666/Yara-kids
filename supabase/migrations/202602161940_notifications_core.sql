create extension if not exists "pgcrypto";

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  email text,
  platform text not null check (platform in ('web', 'android')),
  token text not null,
  device_label text,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, platform, device_label)
);

create table if not exists public.notification_campaigns (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  image_url text,
  deeplink text,
  audience text not null default 'all',
  channels jsonb not null default '["web","android"]'::jsonb,
  category_slug text,
  schedule_for timestamptz,
  status text not null default 'scheduled' check (status in ('scheduled', 'sending', 'completed', 'partial_failure', 'cancelled')),
  created_by text,
  metrics jsonb not null default '{"total":0,"delivered":0,"clicked":0,"failed":0}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.notification_campaigns(id) on delete cascade,
  subscription_id uuid not null references public.push_subscriptions(id) on delete cascade,
  status text not null default 'queued' check (status in ('queued', 'sent', 'delivered', 'clicked', 'failed')),
  sent_at timestamptz,
  delivered_at timestamptz,
  clicked_at timestamptz,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(campaign_id, subscription_id)
);

create table if not exists public.notification_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  title text not null,
  body text not null,
  image_url text,
  deeplink text,
  audience text not null default 'all',
  category_slug text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notification_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  user_id text,
  status text not null default 'queued' check (status in ('queued', 'processed', 'failed')),
  error_message text,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_push_subscriptions_user_active on public.push_subscriptions(user_id, is_active);
create index if not exists idx_campaign_status on public.notification_campaigns(status, created_at desc);
create index if not exists idx_events_status on public.notification_events(status, created_at asc);

alter table public.push_subscriptions enable row level security;
alter table public.notification_campaigns enable row level security;
alter table public.notification_deliveries enable row level security;
alter table public.notification_templates enable row level security;
alter table public.notification_events enable row level security;

drop policy if exists push_subscriptions_all on public.push_subscriptions;
create policy push_subscriptions_all on public.push_subscriptions for all using (true) with check (true);

drop policy if exists notification_campaigns_all on public.notification_campaigns;
create policy notification_campaigns_all on public.notification_campaigns for all using (true) with check (true);

drop policy if exists notification_deliveries_all on public.notification_deliveries;
create policy notification_deliveries_all on public.notification_deliveries for all using (true) with check (true);

drop policy if exists notification_templates_all on public.notification_templates;
create policy notification_templates_all on public.notification_templates for all using (true) with check (true);

drop policy if exists notification_events_all on public.notification_events;
create policy notification_events_all on public.notification_events for all using (true) with check (true);
