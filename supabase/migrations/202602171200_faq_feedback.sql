create table if not exists public.faqs (
  id text primary key,
  question text not null,
  answer text not null,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.feedbacks (
  id text primary key,
  name text not null,
  rating integer not null default 5,
  message text not null,
  date text not null,
  "createdAt" timestamptz not null default now()
);

create index if not exists idx_feedbacks_date on public.feedbacks(date);

alter table public.faqs enable row level security;
alter table public.feedbacks enable row level security;

drop policy if exists faqs_all on public.faqs;
create policy faqs_all on public.faqs for all using (true) with check (true);

drop policy if exists feedbacks_all on public.feedbacks;
create policy feedbacks_all on public.feedbacks for all using (true) with check (true);
