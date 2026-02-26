
import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { NotificationService } from './notification.service';

// --- Interfaces ---
export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  mediaType?: 'image' | 'video';
  videoUrl?: string;
  playAudioOnHover?: boolean;
}

export interface ProductVariant {
  size: string;
  color: string;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  categoryName?: string;
  gender: 'girl' | 'boy' | 'unisex';
  price: number;
  originalPrice: number;
  discount: number;
  image: string;
  gallery: string[];
  colorImages?: { color: string; image: string }[]; 
  video?: string; 
  sizes: string[];
  colors: { name: string; hex: string }[];
  stock: number; 
  variants?: ProductVariant[]; 
  rating: number;
  reviews: number;
  isNew: boolean;
  isBestSeller: boolean;
  description?: string;
}

export interface Review {
  id: string;
  productId: string;
  user: string;
  date: string;
  rating: number;
  comment: string;
  image?: string;
}

export interface Banner {
  id: string;
  location: 'home-hero' | 'home-mid' | 'catalog-sidebar' | 'catalog-top';
  image: string;
  mediaType?: 'image' | 'video';
  videoUrl?: string;
  title?: string;
  subtitle?: string; 
  link: string;
  description?: string;
  badgeText?: string;
  endDate?: string; 
  active?: boolean;
  playAudioOnHover?: boolean;
  order?: number;
}

export interface CartItem extends Product {
  selectedSize: string;
  selectedColor: string;
  quantity: number;
}

export interface OrderAddress {
  cep: string;
  street: string;
  number: string;
  city: string;
}

export interface Order {
  id: string;
  date: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: CartItem[];
  customerName: string;
  customerCpf?: string;     
  customerPhone?: string;   
  shippingAddress?: OrderAddress; 
  paymentMethod: string;
  userEmail?: string; 
  isGift?: boolean; 
}

export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  role: 'admin' | 'customer';
}

export interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
  id: number;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percent' | 'fixed' | 'shipping';
  value: number;
  minPurchase: number;
  active: boolean;
  description?: string; 
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  read: boolean;
}

export interface StockAlert {
  id: string;
  productName: string;
  email: string;
  date: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface Feedback {
  id: string;
  name: string;
  rating: number;
  message: string;
  date: string;
}

export interface NewsletterSubscribeResult {
  ok: boolean;
  status: 'mail_sent' | 'already_exists' | 'mail_failed' | 'invalid_email' | 'error' | 'visual_mode' | 'queued';
  message: string;
}

export interface InstitutionalMedia {
  type: 'image' | 'video';
  url: string;
  playAudioOnHover?: boolean;
}

export interface Institutional {
  logoUrl: string; 
  aboutTitle: string;
  aboutText: string;
  aboutImage: string;
  aboutMedia?: InstitutionalMedia[];
  privacyText: string;
  termsText: string;
  exchangePolicyText: string;
  whatsapp: string;
  email: string;
  address: string;
  instagramUrl: string;
  consentTitle: string;
  consentText: string;
  mercadoPagoPublicKey?: string;
  mercadoPagoAccessToken?: string;
  pixKey?: string; 
  iconVersion?: number;
  notificationsEnabled?: boolean;
  defaultDeepLink?: string;
}

// NEW: Instagram Post Interface for Admin Management
export interface InstagramPost {
  id: string | number;
  image_url: string;
  media_type?: 'image' | 'video';
  video_url?: string;
  play_audio_on_hover?: boolean;
  likes: number;
  link?: string;
}

// --- MOCK DATA ---
const DEFAULT_INSTITUTIONAL: Institutional = {
  logoUrl: '', 
  aboutTitle: 'Quem Somos',
  aboutText: 'A YARA Kids nasceu do sonho de vestir crianças com a pureza e a alegria da infância. Fundada em Redenção/PA, nossa loja busca trazer o que há de mais moderno e confortável na moda infantil.\n\nAcreditamos que roupa de criança tem que ser alegre, colorida e permitir o movimento. Por isso, selecionamos cada peça com muito carinho.',
  aboutImage: 'https://images.unsplash.com/photo-1621452773781-0f992ee03591?w=800&fit=crop',
  aboutMedia: [
    {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1621452773781-0f992ee03591?w=800&fit=crop',
      playAudioOnHover: false
    }
  ],
  privacyText: '1. DADOS COLETADOS\nColetamos: nome, e-mail, CPF, endereço e telefone para processamento de pedidos.\n\n2. USO DOS DADOS\nUsamos seus dados para processar pedidos e enviar notificações.\n\n3. COMPARTILHAMENTO\nNão vendemos seus dados. Compartilhamos apenas com transportadoras.',
  termsText: '1. ACEITAÇÃO\nAo usar o site YARA Kids, você concorda com estes termos.\n\n2. PRODUTOS\nAs imagens são ilustrativas. Cores podem variar.\n\n3. PREÇOS\nSujeitos a alteração sem aviso prévio.',
  exchangePolicyText: 'Você tem 7 dias para devolução por arrependimento e 30 dias para troca por defeito ou tamanho. O produto deve estar com a etiqueta.',
  whatsapp: '(94) 99133-4401',
  email: 'contato@yarakids.com.br',
  address: 'Redenção, PA - Brasil',
  instagramUrl: 'https://instagram.com/yarakids_moda_infantil',
  consentTitle: 'Sua Privacidade é Importante',
  consentText: 'Para garantir uma experiência segura e salvar suas compras, precisamos que você concorde com nossos termos. Ao continuar, você aceita nossa Política de Privacidade e Termos de Uso.',
  mercadoPagoPublicKey: '',
  mercadoPagoAccessToken: '',
  pixKey: '00.000.000/0001-00'
};

const MOCK_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Vestidos', slug: 'vestidos', image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=600&q=80', mediaType: 'image' },
  { id: 'cat-2', name: 'Conjuntos', slug: 'conjuntos', image: 'https://images.unsplash.com/photo-1519238263496-6361937a42d8?w=600&q=80', mediaType: 'image' },
  { id: 'cat-3', name: 'Acessórios', slug: 'acessorios', image: 'https://images.unsplash.com/photo-1617331530973-2dc7463f27a6?w=600&q=80', mediaType: 'image' },
  { id: 'cat-4', name: 'Maternidade', slug: 'maternidade', image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&q=80', mediaType: 'image' }
];

const createVariants = (sizes: string[], colors: string[], stockPerVariant: number) => {
  const variants: ProductVariant[] = [];
  sizes.forEach(s => {
    colors.forEach(c => {
      variants.push({ size: s, color: c, stock: stockPerVariant });
    });
  });
  return variants;
};

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'demo-1',
    name: 'Vestido Floral Encantado',
    categoryId: 'cat-1',
    categoryName: 'Vestidos',
    gender: 'girl',
    price: 89.9,
    originalPrice: 119.9,
    discount: 25,
    image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=800&q=80',
      'https://images.unsplash.com/photo-1621452773781-0f992ee03591?w=800&q=80'
    ],
    colorImages: [
        { color: 'Rosa', image: 'https://images.unsplash.com/photo-1621452773781-0f992ee03591?w=800&q=80' }
    ],
    video: '', 
    sizes: ['4', '6', '8', '10'],
    colors: [{ name: 'Rosa', hex: '#FF69B4' }],
    stock: 20,
    variants: createVariants(['4', '6', '8', '10'], ['Rosa'], 5),
    rating: 4.9,
    reviews: 124,
    isNew: true,
    isBestSeller: true,
    description: 'Vestido perfeito para festas de verão, tecido leve e respirável com estampa floral delicada.'
  },
  {
    id: 'demo-2',
    name: 'Conjunto Dino Radical',
    categoryId: 'cat-2',
    categoryName: 'Conjuntos',
    gender: 'boy',
    price: 69.9,
    originalPrice: 79.9,
    discount: 12,
    image: 'https://images.unsplash.com/photo-1632187752674-3232049e7b23?w=800&q=80',
    gallery: ['https://images.unsplash.com/photo-1632187752674-3232049e7b23?w=800&q=80'],
    sizes: ['2', '4', '6'],
    colors: [{ name: 'Verde', hex: '#4ADE80' }, { name: 'Azul', hex: '#60A5FA' }],
    stock: 30,
    variants: createVariants(['2', '4', '6'], ['Verde', 'Azul'], 5),
    rating: 4.8,
    reviews: 56,
    isNew: true,
    isBestSeller: false,
    description: 'Conjunto confortável de algodão para os pequenos exploradores brincarem à vontade.'
  }
];

const MOCK_REVIEWS: Review[] = [
  { id: 'r1', productId: 'demo-1', user: 'Ana Paula', date: '12/02/2026', rating: 5, comment: 'Amei o tecido! Minha filha não quer tirar mais.', image: 'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=100&q=80' },
  { id: 'r2', productId: 'demo-1', user: 'Marcos Silva', date: '10/02/2026', rating: 4, comment: 'Chegou super rápido, o tamanho ficou perfeito.' }
];

const FUTURE_DATE = new Date();
FUTURE_DATE.setHours(FUTURE_DATE.getHours() + 48);

const MOCK_BANNERS: Banner[] = [
  {
    id: 'b1',
    location: 'home-hero',
    image: 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?w=1800&q=85',
    mediaType: 'image',
    title: 'Nova Coleção',
    subtitle: 'Estilo e conforto',
    link: '/catalogo',
    active: true,
    order: 1
  },
  {
    id: 'b2',
    location: 'home-mid',
    image: 'https://images.unsplash.com/photo-1604467794349-0b74285de7e7?w=1200&q=80',
    mediaType: 'image',
    title: 'Looks Completos',
    subtitle: 'Praticidade para mamães',
    description: 'Aproveite descontos exclusivos. Vestidos e conjuntos dignos de princesa!',
    badgeText: 'Tempo Limitado',
    endDate: FUTURE_DATE.toISOString(),
    link: '/catalogo?cat=conjuntos',
    active: true,
    order: 1
  },
  {
    id: 'b3',
    location: 'home-hero',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1800&q=85',
    mediaType: 'image',
    title: 'Promoção Especial',
    subtitle: 'Até 30% OFF',
    link: '/catalogo?promo=true',
    active: true,
    order: 2
  },
  {
    id: 'b4',
    location: 'catalog-top',
    image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=1800&q=85',
    mediaType: 'image',
    title: 'Descubra Novidades',
    subtitle: 'Peças que encantam',
    link: '/catalogo?sort=newest',
    active: true,
    order: 1
  },
  {
    id: 'b5',
    location: 'catalog-sidebar',
    image: 'https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?w=900&q=80',
    mediaType: 'image',
    title: 'Oferta da Semana',
    subtitle: 'Preço especial',
    link: '/catalogo?promo=true',
    active: true,
    order: 1
  }
];

const MOCK_COUPONS: Coupon[] = [
  { id: '1', code: 'BEMVINDA10', type: 'percent', value: 10, minPurchase: 0, active: true, description: '10% de desconto para novos clientes' },
  { id: '2', code: 'YARA20', type: 'fixed', value: 20, minPurchase: 100, active: true, description: 'R$ 20 OFF em compras acima de R$ 100' },
  { id: '3', code: 'FRETEGRATIS', type: 'shipping', value: 0, minPurchase: 50, active: true, description: 'Frete grátis para todo Brasil' }
];

const MOCK_FAQS: FaqItem[] = [
  { id: '1', question: 'Quanto tempo demora a entrega?', answer: 'O prazo varia conforme o CEP e a modalidade escolhida (PAC ou SEDEX).' },
  { id: '2', question: 'Quais as formas de pagamento?', answer: 'Aceitamos PIX, cartão de crédito e boleto.' },
  { id: '3', question: 'Posso trocar se não servir?', answer: 'Sim. A primeira troca é grátis dentro do prazo da política de trocas.' }
];

const MOCK_FEEDBACKS: Feedback[] = [
  { id: '1', name: 'Maria Souza', rating: 5, message: 'Amei as roupinhas! Chegou rápido.', date: '15/02/2026' },
  { id: '2', name: 'João Paulo', rating: 4, message: 'Qualidade ótima, atendimento muito bom.', date: '10/02/2026' }
];

function normalizeInstitutionalMedia(
  input: unknown,
  fallbackImage?: string
): InstitutionalMedia[] {
  const fromInput: InstitutionalMedia[] = Array.isArray(input)
    ? input
        .map((item: any) => ({
          type: item?.type === 'video' ? ('video' as const) : ('image' as const),
          url: String(item?.url || '').trim(),
          playAudioOnHover: item?.type === 'video' ? !!item?.playAudioOnHover : false
        }))
        .filter(item => item.url.length > 0)
    : [];

  if (fromInput.length > 0) return fromInput;

  const fallback = String(fallbackImage || '').trim();
  if (!fallback) return [];

  return [{ type: 'image', url: fallback, playAudioOnHover: false }];
}

const TODAY_STR = new Date().toLocaleDateString('pt-BR'); // Format: dd/mm/yyyy

const MOCK_ORDERS: Order[] = [
  { 
    id: '9821', date: TODAY_STR, status: 'paid', total: 179.8, customerName: 'Ana Clara', 
    items: [
        { ...MOCK_PRODUCTS[0], selectedSize: '6', selectedColor: 'Rosa', quantity: 2 } as CartItem
    ], 
    paymentMethod: 'pix',
    customerCpf: '123.456.789-00', customerPhone: '(94) 99999-9999', shippingAddress: { cep: '68550-000', street: 'Av. Brasil', number: '120', city: 'Redenção - PA' } 
  },
  { 
    id: '9820', date: TODAY_STR, status: 'pending', total: 69.9, customerName: 'Bruno Silva', 
    items: [
        { ...MOCK_PRODUCTS[1], selectedSize: '4', selectedColor: 'Verde', quantity: 1 } as CartItem
    ], 
    paymentMethod: 'card',
    customerCpf: '987.654.321-11', customerPhone: '(11) 98888-8888', shippingAddress: { cep: '01001-000', street: 'Praca da Se', number: '15', city: 'Sao Paulo - SP' }
  }
];

// Mock Instagram Posts (Fallback)
const MOCK_INSTAGRAM: InstagramPost[] = [
    { id: '1', image_url: 'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=400&q=80', media_type: 'image', likes: 124 },
    { id: '2', image_url: 'https://images.unsplash.com/photo-1621452773781-0f992ee03591?w=400&q=80', media_type: 'image', likes: 256 },
    { id: '3', image_url: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=400&q=80', media_type: 'image', likes: 89 },
    { id: '4', image_url: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=400&q=80', media_type: 'image', likes: 412 },
    { id: 5, image_url: 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?w=400&q=80', media_type: 'image', likes: 132 },
    { id: 6, image_url: 'https://images.unsplash.com/photo-1471286174890-9c808743a753?w=400&q=80', media_type: 'image', likes: 98 },
] as any;

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  supabase = inject(SupabaseService);
  notifications = inject(NotificationService);

  // --- State ---
  mode = signal<'visual' | 'real'>('real');
  theme = signal<'light' | 'dark'>('light');
  animationsEnabled = signal<boolean>(true); 
  
  // Data Signals
  categories = signal<Category[]>([]);
  products = signal<Product[]>([]);
  banners = signal<Banner[]>([]);
  orders = signal<Order[]>([]);
  reviews = signal<Review[]>([]); 
  cart = signal<CartItem[]>([]);
  user = signal<User | null>(null);
  favorites = signal<string[]>([]);
  coupons = signal<Coupon[]>([]);
  institutional = signal<Institutional>(DEFAULT_INSTITUTIONAL);
  instagramPosts = signal<InstagramPost[]>([]); // New Signal
  faqs = signal<FaqItem[]>([]);
  feedbacks = signal<Feedback[]>([]);
  
  // Admin Inbox Signals
  contactMessages = signal<ContactMessage[]>([]);
  stockAlerts = signal<StockAlert[]>([]);
  
  // New: Privacy & Terms State
  termsAccepted = signal<boolean>(false);

  // Cart Logic
  appliedCoupon = signal<Coupon | null>(null);
  isGiftWrapped = signal<boolean>(false); 
  giftWrapFee = 5; 
  
  recentProducts = signal<Product[]>([]);

  // UI State
  isCartOpen = signal<boolean>(false);
  showWelcomePopup = signal<boolean>(false);
  
  toasts = signal<Toast[]>([]);
  private authSyncInitialized = false;
  private settingsRealtimeInitialized = false;
  private readonly missingTableWarnings = new Set<string>();

  // --- Computed ---
  cartTotal = computed(() => Math.max(0, this.cart().reduce((acc, item) => acc + (item.price * item.quantity), 0)));
  cartCount = computed(() => Math.max(0, this.cart().reduce((acc, item) => acc + item.quantity, 0)));
  
  discountAmount = computed(() => {
    const coupon = this.appliedCoupon();
    const total = this.cartTotal();
    if (!coupon) return 0;
    
    if (total < coupon.minPurchase) return 0;
    
    if (coupon.type === 'percent') return total * (coupon.value / 100);
    if (coupon.type === 'fixed') return Math.min(total, coupon.value);
    return 0; 
  });

  finalPrice = computed(() => {
    const base = this.cartTotal() - this.discountAmount();
    const gift = this.isGiftWrapped() ? this.giftWrapFee : 0;
    return Math.max(0, base + gift);
  });

  dashboardStats = computed(() => {
    const currentOrders = this.orders();
    const sales = currentOrders.filter(o => o.status !== 'cancelled').reduce((acc, o) => acc + o.total, 0);
    const pending = currentOrders.filter(o => o.status === 'pending').length;
    
    let labels: string[] = [];
    let data: number[] = [];

    if (this.mode() === 'visual') {
        const today = new Date();
        for(let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            labels.push(d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
        }
        data = [450, 380, 620, 890, 340, 760, sales]; 
    } else {
        const salesMap = new Map<string, number>();
        const today = new Date();
        
        for(let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const fullDateStr = d.toLocaleDateString('pt-BR'); 
            const shortDateStr = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }); 
            
            salesMap.set(fullDateStr, 0);
            labels.push(shortDateStr);
        }

        currentOrders.forEach(order => {
            if(order.status !== 'cancelled') {
                if (salesMap.has(order.date)) {
                    salesMap.set(order.date, (salesMap.get(order.date) || 0) + order.total);
                }
            }
        });

        data = Array.from(salesMap.values());
    }
    
    return {
      sales: sales,
      orders: currentOrders.length,
      pending: pending,
      chart: { labels, data }
    };
  });

  constructor() {
    this.init();
    
    // Effect to update favicon whenever logo changes
    effect(() => {
        const logo = this.institutional().logoUrl;
        if (logo) {
            this.updateFavicon(logo);
        }
    });
  }

  private init() {
    // Theme
    const savedTheme = localStorage.getItem('yarakids_theme') as 'light' | 'dark';
    if (savedTheme) {
      this.theme.set(savedTheme);
    } else if (globalThis.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.theme.set('dark');
    }

    const savedAnim = localStorage.getItem('yarakids_animations');
    if (savedAnim === 'false') {
        this.animationsEnabled.set(false);
    }

    const savedTerms = localStorage.getItem('yarakids_terms_accepted');
    if (savedTerms === 'true') {
        this.termsAccepted.set(true);
    }
    
    this.initGlobalMode();

    // Persist Effects
    effect(() => localStorage.setItem('yarakids_cart', JSON.stringify(this.cart())));
    effect(() => localStorage.setItem('yarakids_favorites', JSON.stringify(this.favorites())));
    effect(() => {
        if (this.animationsEnabled()) {
            document.body.classList.remove('reduce-motion');
            localStorage.setItem('yarakids_animations', 'true');
        } else {
            document.body.classList.add('reduce-motion');
            localStorage.setItem('yarakids_animations', 'false');
        }
    });
    
    effect(() => {
      const t = this.theme();
      localStorage.setItem('yarakids_theme', t);
      if (t === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    });
  }

  private async getLatestSiteSettingsRow(): Promise<{ id: string; data: any } | null> {
    const orderedQueries = [
      this.supabase.supabase.from('site_settings').select('id,data').order('updated_at', { ascending: false }).limit(1),
      this.supabase.supabase.from('site_settings').select('id,data').order('created_at', { ascending: false }).limit(1),
      this.supabase.supabase.from('site_settings').select('id,data').order('id', { ascending: false }).limit(1),
      this.supabase.supabase.from('site_settings').select('id,data').limit(1)
    ];

    let lastError: any = null;

    for (const query of orderedQueries) {
      const { data, error } = await query;
      if (!error) {
        return data?.[0] || null;
      }

      lastError = error;
      const message = String(error?.message || '').toLowerCase();
      const isMissingOrderColumn = message.includes('column') && message.includes('does not exist');
      if (isMissingOrderColumn) {
        continue;
      }

      const noRows = error?.code === 'PGRST116' || message.includes('0 rows');
      if (noRows) {
        return null;
      }

      throw error;
    }

    if (lastError) {
      throw lastError;
    }

    return null;
  }

  private async upsertSiteSettingsData(nextData: Record<string, any>): Promise<void> {
    const existing = await this.getLatestSiteSettingsRow();
    if (existing?.id) {
      const { error } = await this.supabase.supabase
        .from('site_settings')
        .update({ data: nextData })
        .eq('id', existing.id);
      if (error) throw error;
      return;
    }

    const { error } = await this.supabase.supabase.from('site_settings').insert({ data: nextData });
    if (error) throw error;
  }

  private async initGlobalMode() {
    try {
      const existing = await this.getLatestSiteSettingsRow();
      const serverMode = existing?.data?.appMode;
      if (serverMode === 'visual' || serverMode === 'real') {
        this.mode.set(serverMode);
      }
    } catch (e) {
      console.error('Erro ao carregar modo global', e);
    }

    if (this.mode() === 'real') {
      this.initAuthSync();
    }

    this.initSettingsRealtime();
    this.loadData();
  }

  private initAuthSync() {
    if (this.authSyncInitialized) return;
    this.authSyncInitialized = true;

    this.supabase.supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      const role = data.user.app_metadata?.['role'] || data.user.user_metadata?.['role'];
      const isAdmin = role === 'admin';
      const avatarUrl = data.user.user_metadata?.['avatar_url'] || data.user.user_metadata?.['picture'] || '';
      this.user.set({
        id: data.user.id,
        email: data.user.email,
        phone: data.user.phone,
        name: data.user.user_metadata?.['full_name'] || data.user.user_metadata?.['name'] || data.user.email?.split('@')[0] || data.user.phone || 'Cliente',
        avatarUrl: avatarUrl || undefined,
        role: isAdmin ? 'admin' : 'customer'
      });
      this.notifications.initialize({ id: data.user.id, email: data.user.email || undefined });
    });

    this.supabase.supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const role = session.user.app_metadata?.['role'] || session.user.user_metadata?.['role'];
        const isAdmin = role === 'admin';
        const avatarUrl = session.user.user_metadata?.['avatar_url'] || session.user.user_metadata?.['picture'] || '';
        this.user.set({
          id: session.user.id,
          email: session.user.email,
          phone: session.user.phone,
          name: session.user.user_metadata?.['full_name'] || session.user.email?.split('@')[0] || session.user.phone || 'Cliente',
          avatarUrl: avatarUrl || undefined,
          role: isAdmin ? 'admin' : 'customer'
        });
        this.notifications.initialize({ id: session.user.id, email: session.user.email || undefined });
        this.loadData();
      } else if (event === 'SIGNED_OUT') {
        if (session?.user?.id) {
          this.notifications.deactivateUserSubscriptions(session.user.id);
        }
        this.user.set(null);
      }
    });
  }

  private initSettingsRealtime() {
    if (this.settingsRealtimeInitialized) return;
    this.settingsRealtimeInitialized = true;

    this.supabase.supabase
      .channel('settings-global-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, () => this.loadRealSettings())
      .subscribe();
  }

  // --- GLOBAL ICON / IDENTITY MANAGER ---
  private updateFavicon(url: string) {
    const icon = document.getElementById('appIcon') as HTMLLinkElement;
    const appleIcon = document.getElementById('appAppleIcon') as HTMLLinkElement;
    
    if (icon) icon.href = url;
    if (appleIcon) appleIcon.href = url;
    this.updateDynamicManifest(url, this.institutional().iconVersion || Date.now());
  }

  private updateDynamicManifest(iconUrl: string, iconVersion: number) {
    const manifest = {
      name: 'YARA Kids - Moda Infantil',
      short_name: 'YARA Kids',
      start_url: '/',
      display: 'standalone',
      background_color: '#FFF0F5',
      theme_color: '#FF69B4',
      orientation: 'portrait-primary',
      scope: '/',
      icons: [
        { src: `${iconUrl}?v=${iconVersion}`, sizes: '192x192', type: 'image/png' },
        { src: `${iconUrl}?v=${iconVersion}`, sizes: '512x512', type: 'image/png' },
        { src: `${iconUrl}?v=${iconVersion}`, sizes: '192x192', type: 'image/png', purpose: 'maskable' }
      ]
    };

    const blob = new Blob([JSON.stringify(manifest)], { type: 'application/manifest+json' });
    const url = URL.createObjectURL(blob);
    const existing = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    if (existing) {
      existing.href = url;
    }
  }

  acceptTerms() {
    this.termsAccepted.set(true);
    localStorage.setItem('yarakids_terms_accepted', 'true');
  }

  toggleAnimations() {
      this.animationsEnabled.update(v => !v);
      const msg = this.animationsEnabled() ? 'Animacoes ativadas!' : 'Modo desempenho ativado (sem animaes)';
      this.showToast(msg, 'info');
  }

  async setMode(newMode: 'visual' | 'real') {
    if (this.mode() === newMode) return;
    
    const previousMode = this.mode();
    this.mode.set(newMode);

    const persisted = await this.persistGlobalMode(newMode);
    if (!persisted) {
      this.mode.set(previousMode);
      this.showToast('Erro ao salvar modo global no servidor', 'error');
      return;
    }

    if (newMode === 'real') {
      this.initAuthSync();
    }

    this.cart.set([]); 
    this.appliedCoupon.set(null); 
    this.isGiftWrapped.set(false);
    await this.loadData();
    this.showToast(`Modo ${newMode === 'visual' ? 'Visual' : 'Real'} ativado!`, 'success');
  }

  private async persistGlobalMode(mode: 'visual' | 'real'): Promise<boolean> {
    try {
      const existing = await this.getLatestSiteSettingsRow();
      const currentData = existing?.data ?? {};
      const nextData = { ...currentData, appMode: mode };
      await this.upsertSiteSettingsData(nextData);

      return true;
    } catch (e) {
      console.error('Erro ao persistir modo global', e);
      return false;
    }
  }

  toggleTheme() {
    this.theme.update(t => t === 'light' ? 'dark' : 'light');
  }

  toggleGiftWrap() {
    this.isGiftWrapped.update(v => !v);
  }

  private async loadData() {
    if (this.mode() === 'visual') {
      this.loadVisualData();
      return;
    }

    await this.loadRealData();
  }

  private loadVisualData() {
    this.categories.set(MOCK_CATEGORIES);
    this.products.set(MOCK_PRODUCTS);
    this.banners.set(MOCK_BANNERS);
    this.orders.set(MOCK_ORDERS);
    this.reviews.set(MOCK_REVIEWS);
    this.coupons.set(MOCK_COUPONS);
    this.instagramPosts.set(MOCK_INSTAGRAM);
    this.faqs.set(MOCK_FAQS);
    this.feedbacks.set(MOCK_FEEDBACKS);
  }

  private async loadRealData() {
    await this.loadRealSettings();
    await this.loadRealInstagram();
    await this.loadRealCatalog();
    await this.loadRealFaqs();
    await this.loadRealUserData();
    await this.flushPendingNewsletterQueue();
  }

  private async flushPendingNewsletterQueue() {
    try {
      const key = 'yara_newsletter_pending';
      const raw = localStorage.getItem(key);
      if (!raw) return;
      const pending = JSON.parse(raw);
      if (!Array.isArray(pending) || pending.length === 0) return;

      const keep: string[] = [];
      for (const email of pending) {
        try {
          await this.supabase.insert('newsletter_subscribers', {
            email,
            source: 'footer',
            status: 'active'
          });
        } catch (e: any) {
          const code = String(e?.code || '');
          const message = String(e?.message || '').toLowerCase();
          const duplicate = code === '23505' || message.includes('duplicate') || message.includes('unique');
          if (!duplicate) {
            keep.push(email);
          }
        }
      }

      if (keep.length > 0) {
        localStorage.setItem(key, JSON.stringify(keep));
      } else {
        localStorage.removeItem(key);
      }
    } catch (e) {
      console.error('Erro ao sincronizar newsletter pendente', e);
    }
  }

  private async loadRealFaqs() {
    const faqs = await this.safeGetAll<FaqItem[]>('faqs', [], 'faq', true);
    this.faqs.set(faqs.length > 0 ? faqs : MOCK_FAQS);
  }

  private async safeGetAll<T>(table: string, fallback: T, context: string, showToastOnMissing = false): Promise<T> {
    try {
      const data = await this.supabase.getAll(table);
      return (data as T) ?? fallback;
    } catch (e: any) {
      const message = String(e?.message || e);
      const isMissingTable = e?.code === 'PGRST205' || message.includes(`Could not find the table 'public.${table}'`);
      console.error(`Erro ao carregar ${context} (${table})`, e);
      if (isMissingTable && showToastOnMissing && !this.missingTableWarnings.has(table)) {
        this.missingTableWarnings.add(table);
        this.showToast(`Tabela '${table}' não existe no banco ainda. Usando fallback.`, 'info');
      }
      return fallback;
    }
  }

  private async loadRealSettings() {
    try {
      const existing = await this.getLatestSiteSettingsRow();
      const settingsData = existing?.data;
      if (settingsData) {
        const normalizedAboutMedia = normalizeInstitutionalMedia(
          settingsData?.aboutMedia,
          settingsData?.aboutImage || DEFAULT_INSTITUTIONAL.aboutImage
        );
        const firstImage = normalizedAboutMedia.find(item => item.type === 'image')?.url;
        const merged = {
          ...DEFAULT_INSTITUTIONAL,
          ...settingsData,
          logoUrl: settingsData?.branding?.logoUrl || settingsData?.logoUrl || DEFAULT_INSTITUTIONAL.logoUrl,
          aboutMedia: normalizedAboutMedia,
          aboutImage: firstImage || normalizedAboutMedia[0]?.url || settingsData?.aboutImage || DEFAULT_INSTITUTIONAL.aboutImage,
          iconVersion: settingsData?.branding?.iconVersion || settingsData?.iconVersion || Date.now(),
          notificationsEnabled: settingsData?.notifications?.enabled ?? true,
          defaultDeepLink: settingsData?.notifications?.defaultDeepLink || '/'
        };
        this.institutional.set(merged);
      }
    } catch (e) {
      console.error('Erro settings', e);
    }
  }

  private async loadRealInstagram() {
    const posts = await this.safeGetAll<InstagramPost[]>('instagram_posts', [], 'feed do Instagram', true);
    this.instagramPosts.set(posts.length > 0 ? posts : MOCK_INSTAGRAM);
  }

  private async loadRealCatalog() {
    const cats = await this.safeGetAll<Category[]>('categories', [], 'categorias', true);
    this.categories.set(cats);

    const prods = await this.safeGetAll<Product[]>('products', [], 'produtos', true);
    this.products.set(prods);

    const banners = await this.safeGetAll<Banner[]>('banners', [], 'banners', true);
    this.banners.set(banners.length > 0 ? banners : MOCK_BANNERS);

    const coupons = await this.safeGetAll<Coupon[]>('coupons', [], 'cupons', true);
    this.coupons.set(coupons.length > 0 ? coupons : MOCK_COUPONS);
  }

  private async loadRealUserData() {
    const user = this.user();
    if (!user) return;

    const orders = await this.safeGetAll<Order[]>('orders', [], 'pedidos', true);
    this.orders.set(orders);

    if (user.role !== 'admin') return;

    const msgs = await this.safeGetAll<ContactMessage[]>('contact_messages', [], 'mensagens de contato', true);
    this.contactMessages.set(msgs);
    const alerts = await this.safeGetAll<StockAlert[]>('stock_alerts', [], 'alertas de estoque', true);
    this.stockAlerts.set(alerts);
    const feedbacks = await this.safeGetAll<Feedback[]>('feedbacks', [], 'feedbacks', true);
    this.feedbacks.set(feedbacks);
  }

  // --- Settings Persistence ---
  async updateInstitutional(data: Institutional) {
    const normalizedAboutMedia = normalizeInstitutionalMedia(data.aboutMedia, data.aboutImage);
    const firstImage = normalizedAboutMedia.find(item => item.type === 'image')?.url;
    const normalizedInstitutional: Institutional = {
      ...data,
      aboutMedia: normalizedAboutMedia,
      aboutImage: firstImage || normalizedAboutMedia[0]?.url || data.aboutImage
    };

    this.institutional.set(normalizedInstitutional);
    
    if (this.mode() === 'real') {
        try {
            const existing = await this.getLatestSiteSettingsRow();
            const currentData = existing?.data ?? {};
            const iconVersion = Date.now();
            const nextData = {
              ...currentData,
              ...normalizedInstitutional,
              branding: {
                ...(currentData?.branding ? currentData.branding : undefined),
                logoUrl: normalizedInstitutional.logoUrl,
                iconVersion
              },
              notifications: {
                ...(currentData?.notifications ? currentData.notifications : undefined),
                enabled: normalizedInstitutional.notificationsEnabled ?? true,
                defaultDeepLink: normalizedInstitutional.defaultDeepLink || '/'
              }
            };

            await this.upsertSiteSettingsData(nextData);
            this.showToast('Configuracoes salvas no servidor!', 'success');
        } catch (e) {
            console.error('Erro ao salvar settings', e);
            this.showToast('Erro ao salvar no banco de dados', 'error');
        }
    } else {
        this.showToast('Configuracoes salvas (Modo Visual)', 'success');
    }
  }

  async refreshInstitutionalSettings() {
    await this.loadRealSettings();
  }

  // --- Instagram Management (Admin) ---
  async addInstagramPost(payload: { mediaType: 'image' | 'video'; imageUrl?: string; videoUrl?: string; playAudioOnHover?: boolean }) {
      const row: InstagramPost = {
        id: 'insta-' + Date.now(),
        image_url: payload.imageUrl || '',
        media_type: payload.mediaType,
        video_url: payload.videoUrl || undefined,
        play_audio_on_hover: !!payload.playAudioOnHover,
        likes: 0,
        link: ''
      };

      if (this.mode() === 'real') {
          const { error } = await this.supabase.supabase.from('instagram_posts').insert({
            image_url: row.image_url,
            media_type: row.media_type,
            video_url: row.video_url || null,
            play_audio_on_hover: row.play_audio_on_hover,
            likes: row.likes
          });
          if(!error) {
              this.loadData();
              this.showToast('Post adicionado ao feed!', 'success');
          } else {
              console.error('Erro ao inserir post no feed', error);
              this.showToast('Erro ao salvar post no servidor.', 'error');
          }
      } else {
          this.instagramPosts.update(p => [row, ...p]);
          this.showToast('Post adicionado (Visual)', 'success');
      }
  }

  async deleteInstagramPost(id: string | number) {
      const normalizedId = String(id);
      if (this.mode() === 'real') {
          await this.supabase.delete('instagram_posts', normalizedId);
          this.instagramPosts.update(p => p.filter(x => String(x.id) !== normalizedId));
      } else {
          this.instagramPosts.update(p => p.filter(x => String(x.id) !== normalizedId));
      }
      this.showToast('Post removido', 'info');
  }

  // --- Actions for Messages & Alerts ---
  async sendContactMessage(data: { name: string, email: string, subject: string, message: string }) {
    const msg: ContactMessage = {
      id: 'msg-' + Date.now(),
      ...data,
      date: new Date().toLocaleDateString('pt-BR'),
      read: false
    };

    if (this.mode() === 'real') {
      try {
        await this.supabase.insert('contact_messages', msg);
      } catch (e) { console.error(e); }
    } else {
      this.contactMessages.update(m => [msg, ...m]);
    }
    
    this.showToast('Mensagem enviada! Em breve retornaremos.', 'success');
    if (this.mode() === 'real') {
      await this.notifications.queueEvent('contact_message_created', {
        name: msg.name,
        email: msg.email,
        subject: msg.subject
      }, this.user()?.id);
    }
  }

  async createStockAlert(data: { productName: string, email: string }) {
    const alert: StockAlert = {
      id: 'alert-' + Date.now(),
      ...data,
      date: new Date().toLocaleDateString('pt-BR')
    };

    if (this.mode() === 'real') {
      try {
        await this.supabase.insert('stock_alerts', alert);
      } catch (e) { console.error(e); }
    } else {
      this.stockAlerts.update(a => [alert, ...a]);
    }
    
    this.showToast('Alerta criado! Avisaremos quando chegar.', 'success');
    if (this.mode() === 'real') {
      await this.notifications.queueEvent('stock_alert_created', {
        productName: alert.productName,
        email: alert.email
      }, this.user()?.id);
    }
  }

  addFaq(item: FaqItem) {
    this.faqs.update(list => [item, ...list]);
    if (this.mode() === 'real') {
      this.supabase.insert('faqs', item).catch(e => console.error('Erro ao inserir FAQ', e));
    }
    this.showToast('Pergunta adicionada!', 'success');
  }

  updateFaq(item: FaqItem) {
    this.faqs.update(list => list.map(i => i.id === item.id ? item : i));
    if (this.mode() === 'real') {
      this.supabase.update('faqs', item.id, item).catch(e => console.error('Erro ao atualizar FAQ', e));
    }
    this.showToast('FAQ atualizada!', 'success');
  }

  deleteFaq(id: string) {
    this.faqs.update(list => list.filter(i => i.id !== id));
    if (this.mode() === 'real') {
      this.supabase.delete('faqs', id).catch(e => console.error('Erro ao remover FAQ', e));
    }
    this.showToast('FAQ removida.', 'info');
  }

  async sendFeedback(data: { name: string; rating: number; message: string }) {
    const feedback: Feedback = {
      id: 'feed-' + Date.now(),
      name: data.name,
      rating: data.rating,
      message: data.message,
      date: new Date().toLocaleDateString('pt-BR')
    };

    this.feedbacks.update(list => [feedback, ...list]);
    if (this.mode() === 'real') {
      try {
        await this.supabase.insert('feedbacks', feedback);
      } catch (e) {
        console.error('Erro ao salvar feedback', e);
      }
    }
    this.showToast('Avaliação enviada. Obrigado!', 'success');
  }

  async subscribeNewsletter(email: string): Promise<NewsletterSubscribeResult> {
    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return { ok: false, status: 'invalid_email', message: 'Digite um e-mail válido.' };
    }

    if (this.mode() !== 'real') {
      return {
        ok: true,
        status: 'visual_mode',
        message: 'Modo visual: inscrição simulada com sucesso.'
      };
    }

    try {
      const response = await this.supabase.callFunction('newsletter-subscribe', {
        email: normalizedEmail,
        source: 'footer'
      });

      if (response?.ok) {
        return {
          ok: true,
          status: response.status === 'already_exists' ? 'already_exists' : 'mail_sent',
          message: response.message || 'Inscrição confirmada! Verifique seu e-mail.'
        };
      }

      if (response?.status === 'already_exists') {
        return {
          ok: true,
          status: 'already_exists',
          message: response.message || 'Este e-mail já está cadastrado.'
        };
      }

      if (response?.status === 'mail_failed') {
        return {
          ok: false,
          status: 'mail_failed',
          message: response.message || 'E-mail salvo, mas houve falha ao enviar a mensagem.'
        };
      }

      return {
        ok: false,
        status: 'error',
        message: response?.message || 'Não foi possível concluir sua inscrição agora.'
      };
    } catch (e) {
      console.error('Erro ao inscrever newsletter', e);
      return this.fallbackNewsletterInsert(normalizedEmail);
    }
  }

  private async fallbackNewsletterInsert(email: string): Promise<NewsletterSubscribeResult> {
    try {
      const inserted = await this.supabase.insert('newsletter_subscribers', {
        email,
        source: 'footer',
        status: 'active'
      });

      if (inserted) {
        return {
          ok: true,
          status: 'mail_sent',
          message: 'Inscrição confirmada! Confira seu e-mail em instantes.'
        };
      }
    } catch (e: any) {
      const code = String(e?.code || '');
      const message = String(e?.message || '').toLowerCase();
      if (code === '23505' || message.includes('duplicate') || message.includes('unique')) {
        return {
          ok: true,
          status: 'already_exists',
          message: 'Este e-mail já está cadastrado na newsletter.'
        };
      }
      console.error('Fallback newsletter falhou', e);
    }

    // Final fallback: queue locally to avoid user-facing hard failure.
    try {
      const key = 'yara_newsletter_pending';
      const raw = localStorage.getItem(key);
      const current = raw ? JSON.parse(raw) : [];
      if (Array.isArray(current) && !current.includes(email)) {
        current.push(email);
      }
      localStorage.setItem(key, JSON.stringify(current));
      return {
        ok: true,
        status: 'queued',
        message: 'Cadastro recebido. Vamos sincronizar sua inscrição em seguida.'
      };
    } catch (queueError) {
      console.error('Fallback local da newsletter falhou', queueError);
    }

    return {
      ok: false,
      status: 'error',
      message: 'Falha de conexão ao cadastrar newsletter.'
    };
  }

  deleteFeedback(id: string) {
    this.feedbacks.update(list => list.filter(i => i.id !== id));
    if (this.mode() === 'real') {
      this.supabase.delete('feedbacks', id).catch(e => console.error('Erro ao remover feedback', e));
    }
    this.showToast('Feedback removido.', 'info');
  }

  // --- External API Actions (Simulated Backend) ---
  
  async fetchAddressByCep(cep: string): Promise<any> {
    try {
      const cleanCep = cep.replaceAll(/\D/g, '');
      if (cleanCep.length !== 8) return null;
      
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();
      
      if (data.erro) return null;
      
      return {
        address: data.logradouro,
        city: `${data.localidade} - ${data.uf}`,
        neighborhood: data.bairro
      };
    } catch (error) {
      console.error('CEP Error:', error);
      return null;
    }
  }

  // --- Order Actions ---
  async createOrder(data: { 
    customer: string, 
    payment: string, 
    cpf?: string, 
    phone?: string, 
    address?: OrderAddress 
  }) {
    const newOrder = this.buildOrder(data);
    this.orders.update(o => [newOrder, ...o]);

    await this.persistOrder(newOrder);
    this.applyOrderStock(newOrder);

    this.clearCart();
    this.showToast('Pedido realizado com sucesso!', 'success');
    if (this.mode() === 'real') {
      await this.notifications.queueEvent('order_created', {
        orderId: newOrder.id,
        total: newOrder.total,
        customerName: newOrder.customerName
      }, this.user()?.id);
    }
    return newOrder;
  }

  private buildOrder(data: { customer: string; payment: string; cpf?: string; phone?: string; address?: OrderAddress }): Order {
    const currentUser = this.user();
    return {
      id: Math.floor(10000 + Math.random() * 90000).toString(),
      date: new Date().toLocaleDateString('pt-BR'),
      status: 'pending',
      total: this.finalPrice(),
      items: [...this.cart()],
      customerName: data.customer,
      paymentMethod: data.payment,
      userEmail: currentUser ? currentUser.email : undefined,
      customerCpf: data.cpf,
      customerPhone: data.phone,
      shippingAddress: data.address,
      isGift: this.isGiftWrapped()
    };
  }

  private async persistOrder(order: Order) {
    if (this.mode() !== 'real') return;

    try {
      await this.supabase.insert('orders', order);
    } catch (e) {
      console.error('Erro ao salvar pedido no Supabase', e);
      this.showToast('Erro ao salvar pedido no servidor', 'error');
    }
  }

  private applyOrderStock(order: Order) {
    this.products.update(prods => prods.map(p => this.applyProductStockDelta(p, order)));
  }

  private applyProductStockDelta(product: Product, order: Order): Product {
    const itemsInOrder = order.items.filter(i => i.id === product.id);
    if (itemsInOrder.length === 0) return product;

    const updatedProduct: Product = { ...product };
    for (const item of itemsInOrder) {
      updatedProduct.stock = Math.max(0, updatedProduct.stock - item.quantity);
      if (updatedProduct.variants) {
        updatedProduct.variants = updatedProduct.variants.map(v => {
          if (v.size === item.selectedSize && v.color === item.selectedColor) {
            return { ...v, stock: Math.max(0, v.stock - item.quantity) };
          }
          return v;
        });
      }
    }

    if (this.mode() === 'real') {
      this.supabase.update('products', product.id, { stock: updatedProduct.stock, variants: updatedProduct.variants });
    }

    return updatedProduct;
  }

  // --- Auth Actions ---
  
  async login(email: string, password?: string) {
    if (this.mode() === 'real') {
        if (!password) {
            this.showToast('Senha  obrigatoria!', 'error');
            return false;
        }
        try {
            const { error } = await this.supabase.supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            return true;
        } catch (e: any) {
            this.showToast('Erro no login: ' + e.message, 'error');
            return false;
        }
    } else {
        const newUser: User = {
          id: 'u-' + Date.now(),
          name: email.split('@')[0],
          email: email,
          role: 'customer'
        };
        this.user.set(newUser);
        this.showToast(`Bem-vindo, ${newUser.name}!`, 'success');
        return true;
    }
  }

  async loginWithGoogle() {
    if (this.mode() === 'real') {
        try {
            const { error } = await this.supabase.supabase.auth.signInWithOAuth({
              provider: 'google',
              options: {
                redirectTo: globalThis.location.origin,
                queryParams: {
                  prompt: 'select_account'
                }
              }
            });
            if (error) throw error;
            return true;
        } catch (e: any) {
            this.showToast('Erro Google Auth: ' + e.message, 'error');
            return false;
        }
    } else {
        setTimeout(() => {
            const newUser: User = {
                id: 'u-google-' + Date.now(),
                name: 'Usuario Google',
                email: 'usuario.google@gmail.com',
                avatarUrl: 'https://www.gravatar.com/avatar/?d=mp',
                role: 'customer'
            };
            this.user.set(newUser);
            this.showToast('Login com Google simulado!', 'success');
        }, 1000);
        return true;
    }
  }

  async register(email: string, password?: string, name?: string) {
    if (this.mode() === 'real') {
      if (!password) {
        this.showToast('Senha  obrigatoria para cadastro.', 'error');
        return false;
      }
      try {
        const { error } = await this.supabase.supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name: name || 'Cliente' }
          }
        });
        if (error) {
            if (error.message.includes('already registered')) {
                this.showToast('Este e-mail ja possui conta. Tente recuperar a senha.', 'info');
            } else {
                throw error;
            }
            return false;
        }
        
        this.showToast('Cadastro realizado! Verifique seu e-mail para confirmar.', 'success');
        return true;
      } catch (e: any) {
        this.showToast('Erro no cadastro: ' + e.message, 'error');
        return false;
      }
    } else {
      return this.login(email, password);
    }
  }

  async recoverPassword(email: string) {
     if (this.mode() === 'real') {
       if (!email) {
         this.showToast('Digite seu e-mail.', 'error');
         return false;
       }
       try {
         const { error } = await this.supabase.supabase.auth.resetPasswordForEmail(email, {
           redirectTo: globalThis.location.origin + '/#/minha-conta/update-password',
         });
         if (error) throw error;
         this.showToast('E-mail de recuperacao enviado!', 'success');
         return true;
       } catch(e: any) {
         this.showToast('Erro: ' + e.message, 'error');
         return false;
       }
     } else {
       this.showToast('Simulacao: E-mail de recuperacao enviado.', 'success');
       return true;
     }
  }

  async loginWithOtp(contact: string, type: 'sms' | 'email') {
      if(this.mode() === 'real') {
          try {
              if (type === 'sms') {
                  const { error } = await this.supabase.supabase.auth.signInWithOtp({
                      phone: contact,
                      options: { shouldCreateUser: true }
                  });
                  if(error) throw error;
              } else {
                  const { error } = await this.supabase.supabase.auth.signInWithOtp({
                      email: contact,
                      options: { shouldCreateUser: true }
                  });
                  if(error) throw error;
              }
              
              this.showToast(`Código enviado para seu ${type === 'sms' ? 'celular' : 'e-mail'}!`, 'success');
              return true;
          } catch(e: any) {
              this.showToast('Erro ao enviar código: ' + e.message, 'error');
              return false;
          }
      } else {
          this.showToast(`Código 123456 enviado para ${contact} (Visual)`, 'success');
          return true;
      }
  }
  async verifyOtp(contact: string, token: string, type: 'sms' | 'email') {
    if (this.mode() === 'real') {
      return this.verifyOtpReal(contact, token, type);
    }
    return this.verifyOtpVisual(contact, token, type);
  }

  private async verifyOtpReal(contact: string, token: string, type: 'sms' | 'email'): Promise<boolean> {
    try {
      if (type === 'sms') {
        const { error } = await this.supabase.supabase.auth.verifyOtp({
          token,
          type: 'sms',
          phone: contact
        });
        if (error) throw error;
      } else {
        const { error } = await this.supabase.supabase.auth.verifyOtp({
          token,
          type: 'email',
          email: contact
        });
        if (error) throw error;
      }
      return true;
    } catch (e: any) {
      console.error('Erro ao verificar OTP', e);
      this.showToast('Código inválido ou expirado.', 'error');
      return false;
    }
  }

  private verifyOtpVisual(contact: string, token: string, type: 'sms' | 'email'): boolean {
    if (token !== '123456') {
      this.showToast('Código incorreto (Use 123456)', 'error');
      return false;
    }

    const newUser: User = {
      id: 'u-otp-' + Date.now(),
      name: 'Cliente ' + type.toUpperCase(),
      email: type === 'email' ? contact : undefined,
      phone: type === 'sms' ? contact : undefined,
      role: 'customer'
    };

    this.user.set(newUser);
    this.showToast('Autenticado com sucesso!', 'success');
    return true;
  }

  logout() {
    if (this.mode() === 'real') {
        if (this.user()?.id) {
          this.notifications.deactivateUserSubscriptions(this.user()!.id);
        }
        this.supabase.supabase.auth.signOut();
    }
    this.user.set(null);
    this.showToast('Você saiu da conta', 'info');
  }

  async updateUserAvatar(avatarUrl: string) {
    const currentUser = this.user();
    if (!currentUser) return;

    const nextAvatar = avatarUrl?.trim() || undefined;
    this.user.set({ ...currentUser, avatarUrl: nextAvatar });

    if (this.mode() === 'real') {
      try {
        const { error } = await this.supabase.supabase.auth.updateUser({
          data: { avatar_url: nextAvatar || null }
        });
        if (error) throw error;
        this.showToast('Foto de perfil atualizada!', 'success');
      } catch (e: any) {
        console.error('Erro ao atualizar avatar', e);
        this.showToast('Não foi possível salvar a foto de perfil.', 'error');
      }
    }
  }

  async addProduct(product: Product) {
    this.products.update(p => [...p, product]);
    if (this.mode() === 'real') {
       try { await this.supabase.insert('products', product); } catch(e) { console.error(e); }
    }
    this.showToast('Produto cadastrado!', 'success');
  }

  async updateProduct(product: Product) {
    const previous = this.products().find(prod => prod.id === product.id);
    this.products.update(p => p.map(prod => prod.id === product.id ? product : prod));
    if (this.mode() === 'real') {
        try { await this.supabase.update('products', product.id, product); } catch(e) { console.error(e); }
        if ((previous?.stock || 0) <= 0 && (product.stock || 0) > 0) {
          this.notifications.queueEvent('product_restocked', {
            productId: product.id,
            productName: product.name,
            stock: product.stock
          }, this.user()?.id);
        }
    }
    this.showToast('Produto atualizado!', 'success');
  }

  async deleteProduct(id: string) {
    this.products.update(p => p.filter(prod => prod.id !== id));
    if (this.mode() === 'real') {
      try {
        await this.supabase.delete('products', id);
      } catch (e) {
        console.error('Erro ao remover produto no servidor', e);
        this.showToast('Erro ao remover no servidor', 'error');
      }
    }
    this.showToast('Produto removido.', 'info');
  }

  addCategory(c: Category) {
    this.categories.update(l => [...l, c]);
    if (this.mode() === 'real') {
      this.supabase.insert('categories', c);
    }
  }

  updateCategory(c: Category) {
    this.categories.update(l => l.map(i => i.id === c.id ? c : i));
    if (this.mode() === 'real') {
      this.supabase.update('categories', c.id, c);
    }
  }

  deleteCategory(id: string) {
    this.categories.update(l => l.filter(i => i.id !== id));
    if (this.mode() === 'real') {
      this.supabase.delete('categories', id);
    }
  }

  addBanner(b: Banner) {
    this.banners.update(l => [...l, b]);
    if (this.mode() === 'real') {
      this.supabase.insert('banners', b).catch(e => console.error('Erro ao inserir banner', e));
    }
  }

  updateBanner(b: Banner) {
    this.banners.update(l => l.map(i => i.id === b.id ? b : i));
    if (this.mode() === 'real') {
      this.supabase.update('banners', b.id, b).catch(e => console.error('Erro ao atualizar banner', e));
    }
  }

  deleteBanner(id: string) {
    this.banners.update(l => l.filter(i => i.id !== id));
    if (this.mode() === 'real') {
      this.supabase.delete('banners', id).catch(e => console.error('Erro ao remover banner', e));
    }
  }

  addCoupon(c: Coupon) {
    this.coupons.update(l => [...l, c]);
    if (this.mode() === 'real') {
      this.supabase.insert('coupons', c).catch(e => console.error('Erro ao inserir cupom', e));
      this.notifications.queueEvent('promotion_created', {
        code: c.code,
        description: c.description || '',
        value: c.value,
        type: c.type
      }, this.user()?.id);
    }
  }

  deleteCoupon(id: string) {
    this.coupons.update(l => l.filter(i => i.id !== id));
    if (this.mode() === 'real') {
      this.supabase.delete('coupons', id).catch(e => console.error('Erro ao remover cupom', e));
    }
  }

  showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
    const id = Date.now();
    this.toasts.update(t => [...t, { message, type, id }]);
    setTimeout(() => {
      this.toasts.update(t => t.filter(toast => toast.id !== id));
    }, 3000);
  }

  toggleCart(open: boolean) {
    this.isCartOpen.set(open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  closeWelcomePopup() {
    this.showWelcomePopup.set(false);
    localStorage.setItem('yarakids_popup_seen', 'true');
  }

  toggleFavorite(productId: string) {
    if (this.favorites().includes(productId)) {
      this.favorites.update(f => f.filter(id => id !== productId));
      this.showToast('Removido dos favoritos', 'info');
      return;
    }

    this.favorites.update(f => [...f, productId]);
    this.showToast('Adicionado aos favoritos!', 'success');
  }

  isFavorite(productId: string) {
    return this.favorites().includes(productId);
  }

  getVariantStock(product: Product, size: string, color: string): number {
    if (product.variants?.length) {
      const variant = product.variants.find(v => v.size === size && v.color === color);
      return variant ? variant.stock : 0;
    }
    return product.stock;
  }

  addToCart(product: Product, size: string, color: string) {
    const currentCart = this.cart();
    const existingItem = currentCart.find(i => i.id === product.id && i.selectedSize === size && i.selectedColor === color);
    const quantityInCart = existingItem ? existingItem.quantity : 0;
    const availableStock = this.getVariantStock(product, size, color);

    if (quantityInCart + 1 > availableStock) {
      this.showToast(`Estoque insuficiente! Apenas ${availableStock} disponiveis nesta combinacao.`, 'error');
      return;
    }

    this.cart.update(current => {
      if (existingItem) {
        this.showToast('Quantidade atualizada na sacola', 'success');
        this.toggleCart(true);
        return current.map(i => i === existingItem ? { ...i, quantity: i.quantity + 1 } : i);
      }

      this.showToast('Produto adicionado a sacola!', 'success');
      this.toggleCart(true);
      return [...current, { ...product, selectedSize: size, selectedColor: color, quantity: 1 }];
    });
  }

  removeFromCart(itemId: string, size: string, color: string) {
    this.cart.update(current => current.filter(i => !(i.id === itemId && i.selectedSize === size && i.selectedColor === color)));
    this.showToast('Produto removido', 'info');
  }

  updateQuantity(itemId: string, size: string, color: string, delta: number) {
    const product = this.products().find(p => p.id === itemId);
    if (!product) return;

    this.cart.update(current => current.map(item => {
      if (item.id !== itemId || item.selectedSize !== size || item.selectedColor !== color) {
        return item;
      }

      const newQty = item.quantity + delta;
      const maxStock = this.getVariantStock(product, size, color);
      if (delta > 0 && newQty > maxStock) {
        this.showToast(`Limite de estoque atingido! (${maxStock})`, 'error');
        return item;
      }
      if (newQty < 1) return item;

      return { ...item, quantity: newQty };
    }));
  }

  clearCart() {
    this.cart.set([]);
    this.appliedCoupon.set(null);
    this.isGiftWrapped.set(false);
  }

  validateCoupon(code: string) {
    const coupon = this.coupons().find(c => c.code === code && c.active);
    if (!coupon) {
      return { valid: false, discount: 0, message: 'Cupom inválido' };
    }
    if (this.cartTotal() < coupon.minPurchase) {
      return { valid: false, discount: 0, message: `Mínimo de R$ ${coupon.minPurchase} para este cupom` };
    }

    let discount = 0;
    if (coupon.type === 'percent') {
      discount = this.cartTotal() * (coupon.value / 100);
    } else if (coupon.type === 'fixed') {
      discount = coupon.value;
    }

    return { valid: true, discount, message: 'Cupom aplicado com sucesso!' };
  }

  applyCoupon(code: string) {
    const res = this.validateCoupon(code);
    if (res.valid) {
      const coupon = this.coupons().find(c => c.code === code);
      this.appliedCoupon.set(coupon || null);
      this.showToast(res.message, 'success');
      return;
    }

    this.showToast(res.message, 'error');
  }

  removeCoupon() {
    this.appliedCoupon.set(null);
    this.showToast('Cupom removido', 'info');
  }

  addToRecent(product: Product) {
    const current = this.recentProducts();
    const filtered = current.filter(p => p.id !== product.id);
    const updated = [product, ...filtered].slice(0, 10);
    this.recentProducts.set(updated);
    localStorage.setItem('yarakids_recent', JSON.stringify(updated));
  }

  updateOrderStatus(orderId: string, status: Order['status']) {
    this.orders.update(orders => orders.map(o => o.id === orderId ? { ...o, status } : o));
    if (this.mode() === 'real') {
      this.supabase.update('orders', orderId, { status });
      this.notifications.queueEvent('order_status_changed', { orderId, status }, this.user()?.id);
    }
    this.showToast(`Status do pedido #${orderId} atualizado.`, 'success');
  }

  getReviews(productId: string): Review[] {
    return this.reviews().filter(r => r.productId === productId);
  }

  canReview(productId: string): boolean {
    const currentUser = this.user();
    if (!currentUser) return false;

    return this.orders().some(order =>
      order.userEmail === currentUser.email &&
      (order.status === 'paid' || order.status === 'delivered' || order.status === 'shipped') &&
      order.items.some(item => item.id === productId)
    );
  }

  addReview(productId: string, rating: number, comment: string) {
    const currentUser = this.user();
    if (!currentUser) {
      this.showToast('Faca login para avaliar', 'error');
      return;
    }

    const newReview: Review = {
      id: 'rev-' + Date.now(),
      productId,
      user: currentUser.name,
      date: new Date().toLocaleDateString(),
      rating,
      comment
    };

    this.reviews.update(r => [newReview, ...r]);
    this.products.update(prods => prods.map(p => {
      if (p.id !== productId) return p;
      const prodReviews = this.reviews().filter(r => r.productId === productId);
      const avg = prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length;
      return { ...p, rating: avg, reviews: prodReviews.length };
    }));

    this.showToast('Obrigado pela sua avaliacao!', 'success');
  }
}



