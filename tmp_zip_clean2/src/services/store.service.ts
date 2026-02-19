
import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

// --- Interfaces ---
export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
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
  title?: string;
  subtitle?: string; 
  link: string;
  description?: string;
  badgeText?: string;
  endDate?: string; 
  active?: boolean;
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

// NEW: Feedback Interface
export interface Feedback {
  id: string;
  name: string;
  rating: number;
  message: string;
  date: string;
}

export interface Institutional {
  logoUrl: string; 
  aboutTitle: string;
  aboutText: string;
  aboutImage: string;
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
}

export interface InstagramPost {
  id: string;
  image_url: string;
  likes: number;
  link?: string;
}

// --- MOCK DATA ---
const DEFAULT_INSTITUTIONAL: Institutional = {
  logoUrl: '', 
  aboutTitle: 'Quem Somos',
  aboutText: 'A YARA Kids nasceu do sonho de vestir crianças com a pureza e a alegria da infância. Fundada em Redenção/PA, nossa loja busca trazer o que há de mais moderno e confortável na moda infantil.\n\nAcreditamos que roupa de criança tem que ser alegre, colorida e permitir o movimento. Por isso, selecionamos cada peça com muito carinho.',
  aboutImage: 'https://images.unsplash.com/photo-1621452773781-0f992ee03591?w=800&fit=crop',
  privacyText: '1. DADOS COLETADOS\nColetamos: nome, email, CPF, endereço, telefone para processamento de pedidos.\n\n2. USO DOS DADOS\nUsamos seus dados para processar pedidos e enviar notificações.\n\n3. COMPARTILHAMENTO\nNão vendemos seus dados. Compartilhamos apenas com transportadoras.',
  termsText: '1. ACEITAÇÃO\nAo usar o site YARA Kids, você concorda com estes termos.\n\n2. PRODUTOS\nAs imagens são ilustrativas. Cores podem variar.\n\n3. PREÇOS\nSujeitos a alteração sem aviso prévio.',
  exchangePolicyText: 'Você tem 7 dias para devolução por arrependimento e 30 dias para troca por defeito ou tamanho. O produto deve estar com a etiqueta.',
  whatsapp: '(94) 99133-4401',
  email: 'contato@yarakids.com.br',
  address: 'Redenção, PA — Brasil',
  instagramUrl: 'https://instagram.com/yarakids_moda_infatil',
  consentTitle: 'Sua Privacidade é Importante 🔒',
  consentText: 'Para garantir uma experiência segura e salvar suas compras, precisamos que você concorde com nossos termos. Ao continuar, você aceita nossa Política de Privacidade e Termos de Uso.',
  mercadoPagoPublicKey: '',
  mercadoPagoAccessToken: '',
  pixKey: '00.000.000/0001-00'
};

const MOCK_FAQS: FaqItem[] = [
    { id: '1', question: 'Quanto tempo demora a entrega?', answer: 'O prazo de entrega varia de acordo com o seu CEP e a modalidade escolhida (PAC ou SEDEX). Em média, para a região Norte/Nordeste leva de 3 a 7 dias úteis, e para outras regiões de 7 a 12 dias úteis. Você pode simular o prazo exato no carrinho.' },
    { id: '2', question: 'Quais as formas de pagamento?', answer: 'Aceitamos PIX com 5% de desconto (aprovação imediata), cartão de crédito em até 6x sem juros e boleto bancário (aprovação em até 2 dias úteis).' },
    { id: '3', question: 'Como sei o tamanho certo?', answer: 'Disponibilizamos uma tabela de medidas detalhada em cada página de produto. Recomendamos medir uma peça que a criança já usa e comparar. Na dúvida, sugerimos sempre um tamanho maior para garantir o conforto.' },
    { id: '4', question: 'Posso trocar se não servir?', answer: 'Sim! A primeira troca é grátis. Você tem até 30 dias corridos após o recebimento para solicitar a troca por tamanho ou defeito. O produto deve estar com a etiqueta e sem sinais de uso.' },
    { id: '5', question: 'A YARA Kids tem loja física?', answer: 'Sim! Nossa loja física está localizada em Redenção, PA. Você pode comprar pelo site e retirar na loja sem custo de frete.' },
    { id: '6', question: 'O site é seguro?', answer: 'Totalmente. Utilizamos criptografia SSL para proteger seus dados e processamos pagamentos através de plataformas certificadas e seguras.' }
];

const MOCK_FEEDBACKS: Feedback[] = [
  { id: '1', name: 'Maria Souza', rating: 5, message: 'Amei as roupinhas! Chegou super rápido.', date: '15/02/2026' },
  { id: '2', name: 'João Paulo', rating: 4, message: 'Qualidade boa, mas demorou um pouco o correio.', date: '10/02/2026' }
];

const MOCK_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Vestidos', slug: 'vestidos', image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=600&q=80' },
  { id: 'cat-2', name: 'Conjuntos', slug: 'conjuntos', image: 'https://images.unsplash.com/photo-1519238263496-6361937a42d8?w=600&q=80' },
  { id: 'cat-3', name: 'Acessórios', slug: 'acessorios', image: 'https://images.unsplash.com/photo-1617331530973-2dc7463f27a6?w=600&q=80' },
  { id: 'cat-4', name: 'Maternidade', slug: 'maternidade', image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&q=80' }
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
    price: 89.90,
    originalPrice: 119.90,
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
    price: 69.90,
    originalPrice: 79.90,
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
    title: 'Nova Coleção',
    subtitle: 'Estilo e conforto',
    link: '/catalogo'
  },
  {
    id: 'b2',
    location: 'home-mid',
    image: 'https://images.unsplash.com/photo-1604467794349-0b74285de7e7?w=1200&q=80',
    title: 'Looks Completos',
    subtitle: 'Praticidade para mamães',
    description: 'Aproveite descontos exclusivos. Vestidos e conjuntos dignos de princesa!',
    badgeText: 'Tempo Limitado',
    endDate: FUTURE_DATE.toISOString(),
    link: '/catalogo?cat=conjuntos'
  }
];

const MOCK_COUPONS: Coupon[] = [
  { id: '1', code: 'BEMVINDA10', type: 'percent', value: 10, minPurchase: 0, active: true, description: '10% de desconto para novos clientes' },
  { id: '2', code: 'YARA20', type: 'fixed', value: 20, minPurchase: 100, active: true, description: 'R$ 20 OFF em compras acima de R$ 100' },
  { id: '3', code: 'FRETEGRATIS', type: 'shipping', value: 0, minPurchase: 50, active: true, description: 'Frete Grátis para todo Brasil' }
];

const TODAY_STR = new Date().toLocaleDateString('pt-BR'); // Format: dd/mm/yyyy

const MOCK_ORDERS: Order[] = [
  { 
    id: '9821', date: TODAY_STR, status: 'paid', total: 179.80, customerName: 'Ana Clara', 
    items: [
        { ...MOCK_PRODUCTS[0], selectedSize: '6', selectedColor: 'Rosa', quantity: 2 } as CartItem
    ], 
    paymentMethod: 'pix',
    customerCpf: '123.456.789-00', customerPhone: '(94) 99999-9999', shippingAddress: { cep: '68550-000', street: 'Av. Brasil', number: '120', city: 'Redenção - PA' } 
  },
  { 
    id: '9820', date: TODAY_STR, status: 'pending', total: 69.90, customerName: 'Bruno Silva', 
    items: [
        { ...MOCK_PRODUCTS[1], selectedSize: '4', selectedColor: 'Verde', quantity: 1 } as CartItem
    ], 
    paymentMethod: 'card',
    customerCpf: '987.654.321-11', customerPhone: '(11) 98888-8888', shippingAddress: { cep: '01001-000', street: 'Praça da Sé', number: '15', city: 'São Paulo - SP' }
  }
];

// Mock Instagram Posts (Fallback)
const MOCK_INSTAGRAM: InstagramPost[] = [
    { id: '1', image_url: 'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=400&q=80', likes: 124 },
    { id: '2', image_url: 'https://images.unsplash.com/photo-1621452773781-0f992ee03591?w=400&q=80', likes: 256 },
    { id: '3', image_url: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=400&q=80', likes: 89 },
    { id: '4', image_url: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=400&q=80', likes: 412 },
    { id: 5, image: 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?w=400&q=80', likes: 132 },
    { id: 6, image: 'https://images.unsplash.com/photo-1471286174890-9c808743a753?w=400&q=80', likes: 98 },
] as any;

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  supabase = inject(SupabaseService);

  // --- State ---
  mode = signal<'visual' | 'real'>('visual');
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
  instagramPosts = signal<InstagramPost[]>([]);
  faqs = signal<FaqItem[]>([]);
  feedbacks = signal<Feedback[]>([]); // New Signal for Feedbacks
  
  // Admin Inbox Signals
  contactMessages = signal<ContactMessage[]>([]);
  stockAlerts = signal<StockAlert[]>([]);
  
  // New: Privacy & Terms State
  termsAccepted = signal<boolean>(false);

  // Cart Logic
  appliedCoupon = signal<Coupon | null>(null);
  isGiftWrapped = signal<boolean>(false); 
  giftWrapFee = 5.00; 
  
  recentProducts = signal<Product[]>([]);

  // UI State
  isCartOpen = signal<boolean>(false);
  showWelcomePopup = signal<boolean>(false);
  
  toasts = signal<Toast[]>([]);

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
    // Mode
    const savedMode = localStorage.getItem('yarakids_modo') as 'visual' | 'real';
    if (savedMode && (savedMode === 'visual' || savedMode === 'real')) {
      this.mode.set(savedMode);
    }
    
    // Theme
    const savedTheme = localStorage.getItem('yarakids_theme') as 'light' | 'dark';
    if (savedTheme) {
      this.theme.set(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
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
    
    // Check Auth State on Init (Supabase)
    if (this.mode() === 'real') {
      this.supabase.supabase.auth.getUser().then(({ data }) => {
        if (data.user) {
          const isAdmin = data.user.email === 'admin@yarakids.com.br'; 
          this.user.set({
            id: data.user.id,
            email: data.user.email,
            phone: data.user.phone,
            name: data.user.user_metadata?.['name'] || data.user.email?.split('@')[0] || data.user.phone || 'Cliente',
            role: isAdmin ? 'admin' : 'customer'
          });
        }
      });
      
      this.supabase.supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
           const isAdmin = session.user.email === 'admin@yarakids.com.br';
           this.user.set({
             id: session.user.id,
             email: session.user.email,
             phone: session.user.phone,
             name: session.user.user_metadata?.['full_name'] || session.user.email?.split('@')[0] || session.user.phone || 'Cliente',
             role: isAdmin ? 'admin' : 'customer'
           });
           this.loadData();
        } else if (event === 'SIGNED_OUT') {
           this.user.set(null);
        }
      });
    }

    this.loadData();

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

  // --- GLOBAL ICON / IDENTITY MANAGER ---
  private updateFavicon(url: string) {
    const icon = document.getElementById('appIcon') as HTMLLinkElement;
    const appleIcon = document.getElementById('appAppleIcon') as HTMLLinkElement;
    
    if (icon) icon.href = url;
    if (appleIcon) appleIcon.href = url;
  }

  acceptTerms() {
    this.termsAccepted.set(true);
    localStorage.setItem('yarakids_terms_accepted', 'true');
  }

  toggleAnimations() {
      this.animationsEnabled.update(v => !v);
      const msg = this.animationsEnabled() ? 'Animações ativadas!' : 'Modo desempenho ativado (sem animações)';
      this.showToast(msg, 'info');
  }

  setMode(newMode: 'visual' | 'real') {
    if (this.mode() === newMode) return;
    
    this.mode.set(newMode);
    localStorage.setItem('yarakids_modo', newMode);
    this.cart.set([]); 
    this.appliedCoupon.set(null); 
    this.isGiftWrapped.set(false);
    this.loadData();
    this.showToast(`Modo ${newMode === 'visual' ? 'Visual' : 'Real'} ativado!`, 'success');
  }

  toggleTheme() {
    this.theme.update(t => t === 'light' ? 'dark' : 'light');
  }

  toggleGiftWrap() {
    this.isGiftWrapped.update(v => !v);
  }

  private async loadData() {
    if (this.mode() === 'visual') {
      this.categories.set(MOCK_CATEGORIES);
      this.products.set(MOCK_PRODUCTS);
      this.banners.set(MOCK_BANNERS);
      this.orders.set(MOCK_ORDERS);
      this.reviews.set(MOCK_REVIEWS);
      this.coupons.set(MOCK_COUPONS);
      this.instagramPosts.set(MOCK_INSTAGRAM); 
      this.faqs.set(MOCK_FAQS); 
      this.feedbacks.set(MOCK_FEEDBACKS); // Load Mock Feedbacks
    } else {
      // --- REAL MODE (SUPABASE) ---
      
      try {
        const { data, error } = await this.supabase.supabase.from('site_settings').select('data').single();
        if (data && data.data) {
            this.institutional.set({ ...DEFAULT_INSTITUTIONAL, ...data.data });
        }
      } catch (e) { console.error('Erro settings', e); }

      try {
        const faqs = await this.supabase.getAll('faqs');
        if (faqs && faqs.length > 0) this.faqs.set(faqs);
        else this.faqs.set(MOCK_FAQS);
      } catch (e) { 
        this.faqs.set(MOCK_FAQS);
      }

      // Load Feedbacks
      if (this.user()?.role === 'admin') {
        try {
          const feeds = await this.supabase.getAll('feedbacks');
          this.feedbacks.set(feeds || []);
        } catch (e) { this.feedbacks.set([]); }
      }

      try {
        const posts = await this.supabase.getAll('instagram_posts');
        if(posts && posts.length > 0) {
            this.instagramPosts.set(posts);
        } else {
            this.instagramPosts.set(MOCK_INSTAGRAM); 
        }
      } catch (e) { 
        this.instagramPosts.set(MOCK_INSTAGRAM); 
      }

      try {
        const cats = await this.supabase.getAll('categories');
        this.categories.set(cats || []);
      } catch (e) { console.error('Erro ao carregar categorias', e); }

      try {
        const prods = await this.supabase.getAll('products');
        this.products.set(prods || []);
      } catch (e) { console.error('Erro ao carregar produtos', e); }

      if (this.user()) {
        try {
          const orders = await this.supabase.getAll('orders');
          this.orders.set(orders || []);
        } catch (e) { console.error('Erro ao carregar pedidos', e); }

        if (this.user()?.role === 'admin') {
           try {
             const msgs = await this.supabase.getAll('contact_messages');
             this.contactMessages.set(msgs || []);
             const alerts = await this.supabase.getAll('stock_alerts');
             this.stockAlerts.set(alerts || []);
           } catch (e) { console.error('Erro ao carregar mensagens', e); }
        }
      }
    }
  }

  // --- Feedback Management ---
  async sendFeedback(feedback: Omit<Feedback, 'id' | 'date'>) {
    const newFeedback: Feedback = {
      id: 'feed-' + Date.now(),
      ...feedback,
      date: new Date().toLocaleDateString('pt-BR')
    };

    if (this.mode() === 'real') {
      try {
        await this.supabase.insert('feedbacks', newFeedback);
      } catch (e) { console.error(e); }
    } else {
      this.feedbacks.update(f => [newFeedback, ...f]);
    }
    
    this.showToast('Obrigado pelo seu feedback! ⭐', 'success');
  }

  async deleteFeedback(id: string) {
    if (this.mode() === 'real') {
      await this.supabase.delete('feedbacks', id);
    }
    this.feedbacks.update(f => f.filter(x => x.id !== id));
    this.showToast('Feedback removido', 'info');
  }

  // --- FAQ Management ---
  async addFaq(faq: FaqItem) {
    this.faqs.update(f => [...f, faq]);
    if (this.mode() === 'real') {
      try { await this.supabase.insert('faqs', faq); } catch(e) { console.error(e); }
    }
    this.showToast('Pergunta adicionada!', 'success');
  }

  async updateFaq(faq: FaqItem) {
    this.faqs.update(list => list.map(f => f.id === faq.id ? faq : f));
    if (this.mode() === 'real') {
      try { await this.supabase.update('faqs', faq.id, faq); } catch(e) { console.error(e); }
    }
    this.showToast('Pergunta atualizada!', 'success');
  }

  async deleteFaq(id: string) {
    this.faqs.update(list => list.filter(f => f.id !== id));
    if (this.mode() === 'real') {
      try { await this.supabase.delete('faqs', id); } catch(e) { console.error(e); }
    }
    this.showToast('Pergunta removida!', 'info');
  }

  // --- Settings Persistence ---
  async updateInstitutional(data: Institutional) {
    this.institutional.set(data);
    
    if (this.mode() === 'real') {
        try {
            // Check if settings row exists
            const { data: existing } = await this.supabase.supabase.from('site_settings').select('id').single();
            
            if (existing) {
                await this.supabase.supabase.from('site_settings').update({ data: data }).eq('id', existing.id);
            } else {
                await this.supabase.supabase.from('site_settings').insert({ data: data });
            }
            this.showToast('Configurações salvas no servidor!', 'success');
        } catch (e) {
            console.error('Erro ao salvar settings', e);
            this.showToast('Erro ao salvar no banco de dados', 'error');
        }
    } else {
        this.showToast('Configurações salvas (Modo Visual)', 'success');
    }
  }

  // --- Instagram Management (Admin) ---
  async addInstagramPost(imageUrl: string) {
      const newPost = { id: 'insta-'+Date.now(), image_url: imageUrl, likes: 0, link: '' };
      
      if (this.mode() === 'real') {
          const { error } = await this.supabase.supabase.from('instagram_posts').insert({ image_url: imageUrl, likes: 0 });
          if(!error) {
              this.loadData();
              this.showToast('Post adicionado ao feed!', 'success');
          }
      } else {
          this.instagramPosts.update(p => [newPost, ...p]);
          this.showToast('Post adicionado (Visual)', 'success');
      }
  }

  async deleteInstagramPost(id: string) {
      if (this.mode() === 'real') {
          await this.supabase.delete('instagram_posts', id);
          this.instagramPosts.update(p => p.filter(x => x.id !== id));
      } else {
          this.instagramPosts.update(p => p.filter(x => x.id !== id));
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
  }

  // --- External API Actions (Simulated Backend) ---
  
  async fetchAddressByCep(cep: string): Promise<any> {
    try {
      const cleanCep = cep.replace(/\D/g, '');
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

  async verifyAdminPassword(password: string): Promise<boolean> {
      await new Promise(resolve => setTimeout(resolve, 800));
      return password === 'YaraAdmin@2026!';
  }

  // --- Order Actions ---
  async createOrder(data: { 
    customer: string, 
    payment: string, 
    cpf?: string, 
    phone?: string, 
    address?: OrderAddress 
  }) {
      const currentUser = this.user();
      
      const newOrder: Order = {
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
      
      this.orders.update(o => [newOrder, ...o]);

      if(this.mode() === 'real') {
        try {
          await this.supabase.insert('orders', newOrder);
        } catch (e) {
          console.error('Erro ao salvar pedido no Supabase', e);
          this.showToast('Erro ao salvar pedido no servidor', 'error');
        }
      }

      this.products.update(prods => {
          return prods.map(p => {
              const itemsInOrder = newOrder.items.filter(i => i.id === p.id);
              if (itemsInOrder.length > 0) {
                 const updatedProduct = { ...p };
                 itemsInOrder.forEach(item => {
                    updatedProduct.stock = Math.max(0, updatedProduct.stock - item.quantity);
                    if (updatedProduct.variants) {
                        updatedProduct.variants = updatedProduct.variants.map(v => {
                            if (v.size === item.selectedSize && v.color === item.selectedColor) {
                                return { ...v, stock: Math.max(0, v.stock - item.quantity) };
                            }
                            return v;
                        });
                    }
                 });
                 if(this.mode() === 'real') {
                    this.supabase.update('products', p.id, { stock: updatedProduct.stock, variants: updatedProduct.variants });
                 }
                 return updatedProduct;
              }
              return p;
          });
      });

      this.clearCart();
      this.showToast('Pedido realizado com sucesso!', 'success');
      return newOrder;
  }

  // --- Auth Actions ---
  
  async login(email: string, password?: string) {
    if (this.mode() === 'real') {
        if (!password) {
            this.showToast('Senha é obrigatória!', 'error');
            return false;
        }
        try {
            const { data, error } = await this.supabase.supabase.auth.signInWithPassword({ email, password });
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
          role: email.includes('admin') ? 'admin' : 'customer'
        };
        this.user.set(newUser);
        this.showToast(`Bem-vindo, ${newUser.name}!`, 'success');
        return true;
    }
  }

  async loginWithGoogle() {
    if (this.mode() === 'real') {
        try {
            const { data, error } = await this.supabase.supabase.auth.signInWithOAuth({
              provider: 'google',
              options: {
                redirectTo: window.location.origin
              }
            });
            if (error) throw error;
        } catch (e: any) {
            this.showToast('Erro Google Auth: ' + e.message, 'error');
        }
    } else {
        setTimeout(() => {
            const newUser: User = {
                id: 'u-google-' + Date.now(),
                name: 'Usuario Google',
                email: 'usuario.google@gmail.com',
                role: 'customer'
            };
            this.user.set(newUser);
            this.showToast('Login com Google simulado!', 'success');
        }, 1000);
    }
  }

  async register(email: string, password?: string, name?: string) {
    if (this.mode() === 'real') {
      if (!password) {
        this.showToast('Senha é obrigatória para cadastro.', 'error');
        return false;
      }
      try {
        const { data, error } = await this.supabase.supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name: name || 'Cliente' }
          }
        });
        if (error) {
            if (error.message.includes('already registered')) {
                this.showToast('Este e-mail já possui conta. Tente recuperar a senha.', 'info');
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
           redirectTo: window.location.origin + '/minha-conta/update-password',
         });
         if (error) throw error;
         this.showToast('E-mail de recuperação enviado!', 'success');
         return true;
       } catch(e: any) {
         this.showToast('Erro: ' + e.message, 'error');
         return false;
       }
     } else {
       this.showToast('Simulação: E-mail de recuperação enviado.', 'success');
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
      if(this.mode() === 'real') {
          try {
              if (type === 'sms') {
                  const { error } = await this.supabase.supabase.auth.verifyOtp({
                      token: token,
                      type: 'sms',
                      phone: contact
                  });
                  if(error) throw error;
              } else {
                  const { error } = await this.supabase.supabase.auth.verifyOtp({
                      token: token,
                      type: 'email',
                      email: contact
                  });
                  if(error) throw error;
              }
              return true;
          } catch(e: any) {
              this.showToast('Código inválido ou expirado.', 'error');
              return false;
          }
      } else {
          if (token === '123456') {
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
          this.showToast('Código incorreto (Use 123456)', 'error');
          return false;
      }
  }

  logout() {
    if (this.mode() === 'real') {
        this.supabase.supabase.auth.signOut();
    }
    this.user.set(null);
    localStorage.removeItem('admin_token');
    this.showToast('Você saiu da conta', 'info');
  }

  async addProduct(product: Product) {
    this.products.update(p => [...p, product]);
    if (this.mode() === 'real') {
       try { await this.supabase.insert('products', product); } catch(e) { console.error(e); }
    }
    this.showToast('Produto cadastrado!', 'success');
  }

  async updateProduct(product: Product) {
    this.products.update(p => p.map(prod => prod.id === product.id ? product : prod));
    if (this.mode() === 'real') {
        try { await this.supabase.update('products', product.id, product); } catch(e) { console.error(e); }
    }
    this.showToast('Produto atualizado!', 'success');
  }

  async deleteProduct(id: string) {
    this.products.update(p => p.filter(prod => prod.id !== id));
    if (this.mode() === 'real') {
        try { await this.supabase.delete('products', id); } catch(e) { console.error(e); }
    }
    this.showToast('Produto removido.', 'info');
  }

  addCategory(c: Category) { this.categories.update(l => [...l, c]); if(this.mode()==='real') this.supabase.insert('categories', c); }
  updateCategory(c: Category) { this.categories.update(l => l.map(i => i.id === c.id ? c : i)); if(this.mode()==='real') this.supabase.update('categories', c.id, c); }
  deleteCategory(id: string) { this.categories.update(l => l.filter(i => i.id !== id)); if(this.mode()==='real') this.supabase.delete('categories', id); }
  addBanner(b: Banner) { this.banners.update(l => [...l, b]); }
  updateBanner(b: Banner) { this.banners.update(l => l.map(i => i.id === b.id ? b : i)); }
  deleteBanner(id: string) { this.banners.update(l => l.filter(i => i.id !== id)); }
  addCoupon(c: Coupon) { this.coupons.update(l => [...l, c]); }
  deleteCoupon(id: string) { this.coupons.update(l => l.filter(i => i.id !== id)); }
  
  showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
    const id = Date.now();
    this.toasts.update(t => [...t, { message, type, id }]);
    setTimeout(() => {
        this.toasts.update(t => t.filter(toast => toast.id !== id));
    }, 3000);
  }

  toggleCart(open: boolean) { this.isCartOpen.set(open); if(open) document.body.style.overflow = 'hidden'; else document.body.style.overflow = ''; }
  closeWelcomePopup() { this.showWelcomePopup.set(false); localStorage.setItem('yarakids_popup_seen', 'true'); }
  toggleFavorite(productId: string) { if (this.favorites().includes(productId)) { this.favorites.update(f => f.filter(id => id !== productId)); this.showToast('Removido dos favoritos', 'info'); } else { this.favorites.update(f => [...f, productId]); this.showToast('❤️ Adicionado aos favoritos!', 'success'); } }
  isFavorite(productId: string) { return this.favorites().includes(productId); }
  getVariantStock(product: Product, size: string, color: string): number { if (product.variants && product.variants.length > 0) { const variant = product.variants.find(v => v.size === size && v.color === color); return variant ? variant.stock : 0; } return product.stock; }
  addToCart(product: Product, size: string, color: string) { const currentCart = this.cart(); const existingItem = currentCart.find(i => i.id === product.id && i.selectedSize === size && i.selectedColor === color); const quantityInCart = existingItem ? existingItem.quantity : 0; const availableStock = this.getVariantStock(product, size, color); if (quantityInCart + 1 > availableStock) { this.showToast(`Estoque insuficiente! Apenas ${availableStock} disponíveis nesta combinação.`, 'error'); return; } this.cart.update(current => { if (existingItem) { this.showToast('Quantidade atualizada na sacola', 'success'); this.toggleCart(true); return current.map(i => i === existingItem ? { ...i, quantity: i.quantity + 1 } : i); } this.showToast('Produto adicionado à sacola!', 'success'); this.toggleCart(true); return [...current, { ...product, selectedSize: size, selectedColor: color, quantity: 1 }]; }); }
  removeFromCart(itemId: string, size: string, color: string) { this.cart.update(current => current.filter(i => !(i.id === itemId && i.selectedSize === size && i.selectedColor === color))); this.showToast('Produto removido', 'info'); }
  updateQuantity(itemId: string, size: string, color: string, delta: number) { const product = this.products().find(p => p.id === itemId); if (!product) return; this.cart.update(current => { return current.map(item => { if (item.id === itemId && item.selectedSize === size && item.selectedColor === color) { const newQty = item.quantity + delta; const maxStock = this.getVariantStock(product, size, color); if (delta > 0 && newQty > maxStock) { this.showToast(`Limite de estoque atingido! (${maxStock})`, 'error'); return item; } if (newQty < 1) return item; return { ...item, quantity: newQty }; } return item; }); }); }
  clearCart() { this.cart.set([]); this.appliedCoupon.set(null); this.isGiftWrapped.set(false); }
  validateCoupon(code: string) { const coupon = this.coupons().find(c => c.code === code && c.active); if (!coupon) return { valid: false, discount: 0, message: 'Cupom inválido' }; if (this.cartTotal() < coupon.minPurchase) { return { valid: false, discount: 0, message: `Mínimo de R$ ${coupon.minPurchase} para este cupom` }; } let discount = 0; if (coupon.type === 'percent') { discount = this.cartTotal() * (coupon.value / 100); } else if (coupon.type === 'fixed') { discount = coupon.value; } return { valid: true, discount, message: 'Cupom aplicado com sucesso!' }; }
  applyCoupon(code: string) { const res = this.validateCoupon(code); if (res.valid) { const coupon = this.coupons().find(c => c.code === code); this.appliedCoupon.set(coupon || null); this.showToast(res.message, 'success'); } else { this.showToast(res.message, 'error'); } }
  removeCoupon() { this.appliedCoupon.set(null); this.showToast('Cupom removido', 'info'); }
  addToRecent(product: Product) { const current = this.recentProducts(); const filtered = current.filter(p => p.id !== product.id); const updated = [product, ...filtered].slice(0, 10); this.recentProducts.set(updated); localStorage.setItem('yarakids_recent', JSON.stringify(updated)); }
  updateOrderStatus(orderId: string, status: Order['status']) { this.orders.update(orders => orders.map(o => o.id === orderId ? { ...o, status } : o)); if(this.mode() === 'real') { this.supabase.update('orders', orderId, { status }); } this.showToast(`Status do pedido #${orderId} atualizado.`, 'success'); }
  
  getReviews(productId: string): Review[] { return this.reviews().filter(r => r.productId === productId); }
  canReview(productId: string): boolean { const currentUser = this.user(); if (!currentUser) return false; return this.orders().some(order => order.userEmail === currentUser.email && (order.status === 'paid' || order.status === 'delivered' || order.status === 'shipped') && order.items.some(item => item.id === productId) ); }
  addReview(productId: string, rating: number, comment: string) { const currentUser = this.user(); if (!currentUser) { this.showToast('Faça login para avaliar', 'error'); return; } const newReview: Review = { id: 'rev-' + Date.now(), productId, user: currentUser.name, date: new Date().toLocaleDateString(), rating, comment }; this.reviews.update(r => [newReview, ...r]); this.products.update(prods => prods.map(p => { if (p.id === productId) { const prodReviews = this.reviews().filter(r => r.productId === productId); const avg = prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length; return { ...p, rating: avg, reviews: prodReviews.length }; } return p; })); this.showToast('Obrigado pela sua avaliação! ⭐', 'success'); }
}
