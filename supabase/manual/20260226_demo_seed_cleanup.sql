-- Remove os dados de teste inseridos por 20260226_demo_seed_data.sql

begin;

delete from public.orders where id = 'ord-demo-1001';
delete from public.contact_messages where id in ('msg-1', 'msg-2');
delete from public.feedbacks where id in ('feed-1', 'feed-2', 'feed-3');
delete from public.faqs where id in ('faq-1', 'faq-2', 'faq-3');
delete from public.coupons where id in ('cup-welcome10', 'cup-frete');
delete from public.banners where id in ('ban-home-1', 'ban-home-2', 'ban-catalogo-video');
delete from public.products where id in ('prod-vestido-floral', 'prod-conjunto-dino', 'prod-tiara-perolas');
delete from public.categories where id in ('cat-vestidos', 'cat-conjuntos', 'cat-acessorios', 'cat-video');
delete from public.instagram_posts where id in (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222'
);

commit;
