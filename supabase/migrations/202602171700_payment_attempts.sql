create table if not exists public.payment_attempts (
  id uuid primary key default gen_random_uuid(),
  idempotency_key text not null unique,
  method text not null,
  amount numeric(12,2) not null,
  installments integer not null default 1,
  provider_payment_id text,
  status text not null default 'processing',
  response_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payment_attempts_status_idx on public.payment_attempts(status);

alter table public.payment_attempts enable row level security;

create policy "payment_attempts_admin_read"
on public.payment_attempts
for select
using (auth.jwt() ->> 'role' = 'admin');

create or replace function public.touch_payment_attempts_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_touch_payment_attempts_updated_at on public.payment_attempts;
create trigger trg_touch_payment_attempts_updated_at
before update on public.payment_attempts
for each row execute function public.touch_payment_attempts_updated_at();
