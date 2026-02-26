-- Seed manual para testes completos no painel/admin e site cliente.
-- Pode rodar mais de uma vez (usa upsert).

begin;

-- 1) Forca modo real no app.
update public.site_settings
set data = coalesce(data, '{}'::jsonb) || jsonb_build_object('appMode', 'real');

-- 2) Categorias
insert into public.categories (id, name, slug, image, "mediaType", "videoUrl", "playAudioOnHover")
values
  ('cat-vestidos', 'Vestidos', 'vestidos', 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=900&q=80', 'image', null, false),
  ('cat-conjuntos', 'Conjuntos', 'conjuntos', 'https://images.unsplash.com/photo-1519238263496-6361937a42d8?w=900&q=80', 'image', null, false),
  ('cat-acessorios', 'Acessorios', 'acessorios', 'https://images.unsplash.com/photo-1617331530973-2dc7463f27a6?w=900&q=80', 'image', null, false),
  ('cat-video', 'Colecao em Video', 'colecao-video', 'https://images.unsplash.com/photo-1516726817505-f5ed825624d8?w=900&q=80', 'video', 'https://cdn.coverr.co/videos/coverr-kids-playing-in-the-yard-1579/1080p.mp4', false)
on conflict (id) do update
set
  name = excluded.name,
  slug = excluded.slug,
  image = excluded.image,
  "mediaType" = excluded."mediaType",
  "videoUrl" = excluded."videoUrl",
  "playAudioOnHover" = excluded."playAudioOnHover";

-- 3) Produtos
insert into public.products (
  id, name, "categoryId", "categoryName", gender, price, "originalPrice", discount, image,
  gallery, "colorImages", video, sizes, colors, stock, variants, rating, reviews, "isNew", "isBestSeller", description
)
values
(
  'prod-vestido-floral',
  'Vestido Floral Encantado',
  'cat-vestidos',
  'Vestidos',
  'girl',
  89.90,
  129.90,
  31,
  'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=1200&q=80',
  array[
    'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=1200&q=80',
    'https://images.unsplash.com/photo-1621452773781-0f992ee03591?w=1200&q=80'
  ]::text[],
  '[{"color":"Rosa","image":"https://images.unsplash.com/photo-1621452773781-0f992ee03591?w=1200&q=80"}]'::jsonb,
  null,
  array['4','6','8','10']::text[],
  '[{"name":"Rosa","hex":"#ff6fae"},{"name":"Branco","hex":"#ffffff"}]'::jsonb,
  24,
  '[{"size":"4","color":"Rosa","stock":6},{"size":"6","color":"Rosa","stock":6},{"size":"8","color":"Rosa","stock":6},{"size":"10","color":"Rosa","stock":6}]'::jsonb,
  4.9,
  124,
  true,
  true,
  'Vestido leve e confortavel para passeios e festas.'
),
(
  'prod-conjunto-dino',
  'Conjunto Dino Radical',
  'cat-conjuntos',
  'Conjuntos',
  'boy',
  69.90,
  89.90,
  22,
  'https://images.unsplash.com/photo-1632187752674-3232049e7b23?w=1200&q=80',
  array['https://images.unsplash.com/photo-1632187752674-3232049e7b23?w=1200&q=80']::text[],
  null,
  null,
  array['2','4','6']::text[],
  '[{"name":"Verde","hex":"#58cc6c"},{"name":"Azul","hex":"#4f8ff0"}]'::jsonb,
  18,
  '[{"size":"2","color":"Verde","stock":3},{"size":"4","color":"Verde","stock":3},{"size":"6","color":"Verde","stock":3},{"size":"2","color":"Azul","stock":3},{"size":"4","color":"Azul","stock":3},{"size":"6","color":"Azul","stock":3}]'::jsonb,
  4.7,
  56,
  true,
  false,
  'Conjunto de algodao para brincar com conforto.'
),
(
  'prod-tiara-perolas',
  'Tiara de Perolas',
  'cat-acessorios',
  'Acessorios',
  'girl',
  29.90,
  39.90,
  25,
  'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=1200&q=80',
  array['https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=1200&q=80']::text[],
  null,
  null,
  array['U']::text[],
  '[{"name":"Perola","hex":"#f6f2e8"}]'::jsonb,
  40,
  '[{"size":"U","color":"Perola","stock":40}]'::jsonb,
  4.8,
  33,
  false,
  true,
  'Acessorio delicado para completar o look.'
)
on conflict (id) do update
set
  name = excluded.name,
  "categoryId" = excluded."categoryId",
  "categoryName" = excluded."categoryName",
  gender = excluded.gender,
  price = excluded.price,
  "originalPrice" = excluded."originalPrice",
  discount = excluded.discount,
  image = excluded.image,
  gallery = excluded.gallery,
  "colorImages" = excluded."colorImages",
  video = excluded.video,
  sizes = excluded.sizes,
  colors = excluded.colors,
  stock = excluded.stock,
  variants = excluded.variants,
  rating = excluded.rating,
  reviews = excluded.reviews,
  "isNew" = excluded."isNew",
  "isBestSeller" = excluded."isBestSeller",
  description = excluded.description,
  "updatedAt" = now();

-- 4) Banners
insert into public.banners (
  id, location, image, title, subtitle, link, description, "badgeText", "endDate", active,
  "mediaType", "videoUrl", "playAudioOnHover", "order"
)
values
(
  'ban-home-1',
  'home-hero',
  'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?w=1800&q=85',
  'Nova Colecao',
  'Conforto e estilo para criancas',
  '/catalogo',
  'Lancamentos da semana',
  'Novidade',
  null,
  true,
  'image',
  null,
  false,
  1
),
(
  'ban-home-2',
  'home-hero',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1800&q=85',
  'Promocao Especial',
  'Ate 30% OFF',
  '/catalogo?promo=true',
  'Pecas selecionadas com desconto',
  'Tempo limitado',
  now() + interval '7 day',
  true,
  'image',
  null,
  false,
  2
),
(
  'ban-catalogo-video',
  'catalog-top',
  'https://images.unsplash.com/photo-1516726817505-f5ed825624d8?w=1800&q=85',
  'Video da Colecao',
  'Veja os looks em movimento',
  '/catalogo',
  'Banner em video para validar midia',
  null,
  null,
  true,
  'video',
  'https://cdn.coverr.co/videos/coverr-kids-playing-in-the-yard-1579/1080p.mp4',
  false,
  1
)
on conflict (id) do update
set
  location = excluded.location,
  image = excluded.image,
  title = excluded.title,
  subtitle = excluded.subtitle,
  link = excluded.link,
  description = excluded.description,
  "badgeText" = excluded."badgeText",
  "endDate" = excluded."endDate",
  active = excluded.active,
  "mediaType" = excluded."mediaType",
  "videoUrl" = excluded."videoUrl",
  "playAudioOnHover" = excluded."playAudioOnHover",
  "order" = excluded."order",
  "updatedAt" = now();

-- 5) Cupons
insert into public.coupons (id, code, type, value, "minPurchase", active, description)
values
  ('cup-welcome10', 'WELCOME10', 'percent', 10, 50, true, '10% OFF para primeira compra'),
  ('cup-frete', 'FRETEGRATIS', 'shipping', 0, 150, true, 'Frete gratis acima de R$150')
on conflict (id) do update
set
  code = excluded.code,
  type = excluded.type,
  value = excluded.value,
  "minPurchase" = excluded."minPurchase",
  active = excluded.active,
  description = excluded.description,
  "updatedAt" = now();

-- 6) FAQ
insert into public.faqs (id, question, answer)
values
  ('faq-1', 'Quanto tempo demora a entrega?', 'Normalmente de 3 a 8 dias uteis, dependendo da regiao.'),
  ('faq-2', 'Posso trocar se nao servir?', 'Sim. Voce pode solicitar troca em ate 7 dias apos o recebimento.'),
  ('faq-3', 'Tem cupom para primeira compra?', 'Sim, use WELCOME10 no checkout.')
on conflict (id) do update
set
  question = excluded.question,
  answer = excluded.answer,
  "updatedAt" = now();

-- 7) Feedbacks/avaliacoes
insert into public.feedbacks (id, name, rating, message, date)
values
  ('feed-1', 'Ana Paula', 5, 'A qualidade das roupas e excelente. Atendimento super rapido!', to_char(current_date, 'DD/MM/YYYY')),
  ('feed-2', 'Carlos Mendes', 4, 'Gostei muito. Entrega dentro do prazo e produto lindo.', to_char(current_date - 1, 'DD/MM/YYYY')),
  ('feed-3', 'Juliana Rocha', 5, 'Minha filha amou o vestido. Voltarei a comprar!', to_char(current_date - 2, 'DD/MM/YYYY'))
on conflict (id) do update
set
  name = excluded.name,
  rating = excluded.rating,
  message = excluded.message,
  date = excluded.date;

-- 8) Mensagens de contato
insert into public.contact_messages (id, name, email, subject, message, date, read)
values
  ('msg-1', 'Cliente Teste', 'cliente1@example.com', 'Duvida sobre tamanho', 'Quero ajuda para escolher tamanho infantil.', to_char(current_date, 'DD/MM/YYYY'), false),
  ('msg-2', 'Maria Teste', 'cliente2@example.com', 'Prazo de entrega', 'Meu pedido chega ate sexta?', to_char(current_date - 1, 'DD/MM/YYYY'), true)
on conflict (id) do update
set
  name = excluded.name,
  email = excluded.email,
  subject = excluded.subject,
  message = excluded.message,
  date = excluded.date,
  read = excluded.read;

-- 9) Pedido de teste (compra)
insert into public.orders (
  id, date, status, total, items, "customerName", "customerCpf", "customerPhone", "shippingAddress",
  "paymentMethod", "userEmail", "isGift"
)
values
(
  'ord-demo-1001',
  to_char(current_date, 'DD/MM/YYYY'),
  'paid',
  159.80,
  jsonb_build_array(
    jsonb_build_object(
      'id', 'prod-vestido-floral',
      'name', 'Vestido Floral Encantado',
      'price', 89.90,
      'quantity', 1,
      'selectedSize', '6',
      'selectedColor', 'Rosa',
      'image', 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=1200&q=80'
    ),
    jsonb_build_object(
      'id', 'prod-tiara-perolas',
      'name', 'Tiara de Perolas',
      'price', 29.90,
      'quantity', 1,
      'selectedSize', 'U',
      'selectedColor', 'Perola',
      'image', 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=1200&q=80'
    )
  ),
  'Cliente Demo',
  '123.456.789-00',
  '(94) 99111-2222',
  '{"cep":"68550-000","street":"Av. Brasil","number":"120","city":"Redencao - PA"}'::jsonb,
  'pix',
  'cliente.demo@example.com',
  false
)
on conflict (id) do update
set
  date = excluded.date,
  status = excluded.status,
  total = excluded.total,
  items = excluded.items,
  "customerName" = excluded."customerName",
  "customerCpf" = excluded."customerCpf",
  "customerPhone" = excluded."customerPhone",
  "shippingAddress" = excluded."shippingAddress",
  "paymentMethod" = excluded."paymentMethod",
  "userEmail" = excluded."userEmail",
  "isGift" = excluded."isGift",
  "updatedAt" = now();

-- 10) Instagram feed (imagem + video)
insert into public.instagram_posts (id, image_url, likes, link, media_type, video_url, play_audio_on_hover)
values
  ('11111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=700&q=80', 120, 'https://instagram.com', 'image', null, false),
  ('22222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1621452773781-0f992ee03591?w=700&q=80', 90, 'https://instagram.com', 'video', 'https://cdn.coverr.co/videos/coverr-kids-playing-in-the-yard-1579/1080p.mp4', false)
on conflict (id) do update
set
  image_url = excluded.image_url,
  likes = excluded.likes,
  link = excluded.link,
  media_type = excluded.media_type,
  video_url = excluded.video_url,
  play_audio_on_hover = excluded.play_audio_on_hover,
  "updatedAt" = now();

commit;
