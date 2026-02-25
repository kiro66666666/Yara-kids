alter table if exists public.categories
  add column if not exists "mediaType" text not null default 'image',
  add column if not exists "videoUrl" text,
  add column if not exists "playAudioOnHover" boolean not null default false;

alter table if exists public.banners
  add column if not exists "mediaType" text not null default 'image',
  add column if not exists "videoUrl" text,
  add column if not exists "playAudioOnHover" boolean not null default false,
  add column if not exists "order" integer not null default 1;

alter table if exists public.instagram_posts
  add column if not exists media_type text not null default 'image',
  add column if not exists video_url text,
  add column if not exists play_audio_on_hover boolean not null default false;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'categories_media_type_check'
  ) then
    alter table public.categories
      add constraint categories_media_type_check check ("mediaType" in ('image', 'video'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'banners_media_type_check'
  ) then
    alter table public.banners
      add constraint banners_media_type_check check ("mediaType" in ('image', 'video'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'instagram_posts_media_type_check'
  ) then
    alter table public.instagram_posts
      add constraint instagram_posts_media_type_check check (media_type in ('image', 'video'));
  end if;
end $$;

create index if not exists idx_banners_location_order on public.banners(location, "order");
