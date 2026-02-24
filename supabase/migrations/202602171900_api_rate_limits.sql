create table if not exists public.api_rate_limits (
  id uuid primary key default gen_random_uuid(),
  bucket text not null,
  key text not null,
  count integer not null default 1,
  window_started_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(bucket, key)
);

create index if not exists api_rate_limits_bucket_window_idx
  on public.api_rate_limits(bucket, window_started_at);

alter table public.api_rate_limits enable row level security;

create policy "api_rate_limits_admin_read"
on public.api_rate_limits
for select
using (auth.jwt() ->> 'role' = 'admin');

create or replace function public.touch_api_rate_limits_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_touch_api_rate_limits_updated_at on public.api_rate_limits;
create trigger trg_touch_api_rate_limits_updated_at
before update on public.api_rate_limits
for each row execute function public.touch_api_rate_limits_updated_at();
