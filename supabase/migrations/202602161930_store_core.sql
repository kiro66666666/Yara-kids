create extension if not exists "pgcrypto";

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id text primary key,
  name text not null,
  slug text not null,
  image text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id text primary key,
  name text not null,
  "categoryId" text,
  "categoryName" text,
  gender text not null default 'unisex',
  price numeric(12,2) not null default 0,
  "originalPrice" numeric(12,2) not null default 0,
  discount integer not null default 0,
  image text not null default '',
  gallery jsonb not null default '[]'::jsonb,
  "colorImages" jsonb,
  video text,
  sizes jsonb not null default '[]'::jsonb,
  colors jsonb not null default '[]'::jsonb,
  stock integer not null default 0,
  variants jsonb,
  rating numeric(4,2) not null default 0,
  reviews integer not null default 0,
  "isNew" boolean not null default false,
  "isBestSeller" boolean not null default false,
  description text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.orders (
  id text primary key,
  date text not null,
  status text not null default 'pending',
  total numeric(12,2) not null default 0,
  items jsonb not null default '[]'::jsonb,
  "customerName" text not null,
  "customerCpf" text,
  "customerPhone" text,
  "shippingAddress" jsonb,
  "paymentMethod" text not null default 'pix',
  "userEmail" text,
  "isGift" boolean not null default false,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.banners (
  id text primary key,
  location text not null,
  image text not null,
  title text,
  subtitle text,
  link text not null default '/catalogo',
  description text,
  "badgeText" text,
  "endDate" timestamptz,
  active boolean not null default true,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.coupons (
  id text primary key,
  code text not null unique,
  type text not null default 'percent',
  value numeric(12,2) not null default 0,
  "minPurchase" numeric(12,2) not null default 0,
  active boolean not null default true,
  description text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id text primary key,
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  date text not null,
  read boolean not null default false,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.stock_alerts (
  id text primary key,
  "productName" text not null,
  email text not null,
  date text not null,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.instagram_posts (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  likes integer not null default 0,
  link text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

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

create index if not exists idx_products_category_id on public.products("categoryId");
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_user_email on public.orders("userEmail");
create index if not exists idx_banners_location on public.banners(location);
create index if not exists idx_coupons_code on public.coupons(code);
create index if not exists idx_contact_messages_email on public.contact_messages(email);
create index if not exists idx_stock_alerts_email on public.stock_alerts(email);
create index if not exists idx_feedbacks_date on public.feedbacks(date);

insert into public.site_settings (id, data)
select gen_random_uuid(), '{"appMode":"visual","branding":{"logoUrl":"","iconVersion":0},"notifications":{"enabled":true,"defaultDeepLink":"/"}}'::jsonb
where not exists (select 1 from public.site_settings);

alter table public.site_settings enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.banners enable row level security;
alter table public.coupons enable row level security;
alter table public.contact_messages enable row level security;
alter table public.stock_alerts enable row level security;
alter table public.instagram_posts enable row level security;
alter table public.faqs enable row level security;
alter table public.feedbacks enable row level security;

drop policy if exists site_settings_all on public.site_settings;
create policy site_settings_all on public.site_settings for all using (true) with check (true);

drop policy if exists categories_all on public.categories;
create policy categories_all on public.categories for all using (true) with check (true);

drop policy if exists products_all on public.products;
create policy products_all on public.products for all using (true) with check (true);

drop policy if exists orders_all on public.orders;
create policy orders_all on public.orders for all using (true) with check (true);

drop policy if exists banners_all on public.banners;
create policy banners_all on public.banners for all using (true) with check (true);

drop policy if exists coupons_all on public.coupons;
create policy coupons_all on public.coupons for all using (true) with check (true);

drop policy if exists contact_messages_all on public.contact_messages;
create policy contact_messages_all on public.contact_messages for all using (true) with check (true);

drop policy if exists stock_alerts_all on public.stock_alerts;
create policy stock_alerts_all on public.stock_alerts for all using (true) with check (true);

drop policy if exists instagram_posts_all on public.instagram_posts;
create policy instagram_posts_all on public.instagram_posts for all using (true) with check (true);

drop policy if exists faqs_all on public.faqs;
create policy faqs_all on public.faqs for all using (true) with check (true);

drop policy if exists feedbacks_all on public.feedbacks;
create policy feedbacks_all on public.feedbacks for all using (true) with check (true);
