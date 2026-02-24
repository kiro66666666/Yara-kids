create table if not exists public.payment_webhook_events (
  id uuid primary key default gen_random_uuid(),
  event_id text not null unique,
  topic text not null default 'payment',
  payload jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.payment_webhook_events enable row level security;

create policy "payment_webhook_events_admin_read"
on public.payment_webhook_events
for select
using (auth.jwt() ->> 'role' = 'admin');

create index if not exists payment_webhook_events_created_at_idx
  on public.payment_webhook_events(created_at desc);
