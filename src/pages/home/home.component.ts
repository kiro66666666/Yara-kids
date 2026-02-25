
import { Component, inject, OnInit, OnDestroy, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from '../../services/store.service';
import { ProductCardComponent } from '../../components/product-card.component';
import { InstagramFeedComponent } from '../../components/instagram-feed.component';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../ui/icons';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ProductCardComponent, RouterLink, IconComponent, InstagramFeedComponent],
  template: `
    <!-- Hero Section (Eager Load - LCP) -->
    <div class="relative w-full h-[500px] lg:h-[600px] overflow-hidden bg-brand-soft dark:bg-brand-darkbg group">
      @if (currentHeroBanner(); as banner) {
        <div class="absolute inset-0">
          @if (banner.mediaType === 'video' && banner.videoUrl) {
            <video [src]="banner.videoUrl"
                   class="w-full h-full object-cover object-center lg:object-[center_30%] transition-transform duration-[20s] group-hover:scale-105"
                   autoplay
                   loop
                   muted
                   playsinline
                   (mouseenter)="onMediaHoverStart($any($event.target), banner.playAudioOnHover)"
                   (mouseleave)="onMediaHoverEnd($any($event.target))"></video>
          } @else {
            <img [src]="banner.image" 
                 [alt]="banner.title || 'Nova Coleção'" 
                 (error)="handleImageError($event)"
                 class="w-full h-full object-cover object-center lg:object-[center_30%] transition-transform duration-[20s] group-hover:scale-105"
                 fetchpriority="high"> <!-- Priority Load -->
          }
          
          <div class="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent md:via-black/20 md:to-transparent"></div>
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
        </div>
        
        <div class="absolute inset-0 w-full max-w-[1440px] mx-auto px-6 flex flex-col justify-center h-full relative z-20">
          <div class="max-w-2xl animate-slide-up space-y-6 pt-12 md:pt-0">
            <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white text-[10px] md:text-xs font-bold uppercase tracking-widest shadow-lg self-start">
              <span class="animate-pulse">✨</span> {{ banner.subtitle || 'Nova Coleção 2026' }}
            </div>
            
            <h1 class="text-4xl sm:text-5xl md:text-7xl font-black text-white leading-[1.1] drop-shadow-2xl">
              {{ banner.title || 'Moda que Encanta' }}
            </h1>
            
            <p class="text-sm sm:text-base md:text-lg text-gray-100 font-medium max-w-lg leading-relaxed drop-shadow-lg shadow-black">
              Confira as novidades da estação. Peças leves e confortáveis para os pequenos.
            </p>
            
            <div class="flex gap-4 pt-4">
              <a [routerLink]="banner.link" class="px-8 py-3.5 bg-white text-brand-dark font-black rounded-full hover:bg-gray-100 transition-all shadow-xl text-xs md:text-sm tracking-widest uppercase transform hover:-translate-y-1">
                Ver Coleção
              </a>
              <a routerLink="/catalogo" [queryParams]="{cat: 'vestidos'}" class="px-8 py-3.5 bg-transparent border-2 border-white text-white font-black rounded-full hover:bg-white hover:text-brand-dark transition-all text-xs md:text-sm tracking-widest uppercase">
                Vestidos
              </a>
            </div>
          </div>
        </div>

        @if (heroBanners().length > 1) {
          <button (click)="prevBanner('hero')" class="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/30 text-white backdrop-blur hover:bg-black/50 transition-colors">
            <app-icon name="chevron-left" size="20px"></app-icon>
          </button>
          <button (click)="nextBanner('hero')" class="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/30 text-white backdrop-blur hover:bg-black/50 transition-colors">
            <app-icon name="chevron-right" size="20px"></app-icon>
          </button>
          <div class="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-full backdrop-blur">
            @for (item of heroBanners(); track item.id; let i = $index) {
              <button (click)="goToBanner('hero', i)" class="w-2.5 h-2.5 rounded-full border border-white/70 transition-colors"
                      [ngClass]="i === heroIndex() ? 'bg-white' : 'bg-white/30'"></button>
            }
          </div>
        }
      } @else {
        <div class="absolute inset-0 bg-brand-pink flex items-center justify-center text-white">
           <p class="font-bold">Configure o Banner Principal no Admin</p>
        </div>
      }
    </div>

    <!-- Features Strip -->
    <div class="bg-white dark:bg-brand-darksurface border-b border-gray-100 dark:border-gray-800 py-8 shadow-sm relative z-20 -mt-6 rounded-t-[2rem] md:mt-0 md:rounded-none transition-colors duration-300">
      <div class="w-full max-w-[1440px] mx-auto px-4 md:px-6">
         <div class="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-12 text-center divide-x-0 md:divide-x divide-gray-100 dark:divide-gray-800">
           <div class="flex flex-col items-center gap-2 group cursor-default">
             <div class="text-brand-pink transform group-hover:scale-110 transition-transform"><app-icon name="truck" size="28px"></app-icon></div>
             <div><p class="font-bold text-xs md:text-sm text-gray-800 dark:text-gray-200">Frete Grátis</p><p class="text-[10px] text-gray-400">Acima de R$ 150</p></div>
           </div>
           <div class="flex flex-col items-center gap-2 group cursor-default">
             <div class="text-brand-pink transform group-hover:scale-110 transition-transform"><app-icon name="dollar-sign" size="28px"></app-icon></div>
             <div><p class="font-bold text-xs md:text-sm text-gray-800 dark:text-gray-200">6x Sem Juros</p><p class="text-[10px] text-gray-400">No cartão</p></div>
           </div>
           <div class="flex flex-col items-center gap-2 group cursor-default">
             <div class="text-brand-pink font-black text-lg transform group-hover:scale-110 transition-transform">5%</div>
             <div><p class="font-bold text-xs md:text-sm text-gray-800 dark:text-gray-200">Desconto PIX</p><p class="text-[10px] text-gray-400">Pagamento à vista</p></div>
           </div>
           <div class="flex flex-col items-center gap-2 group cursor-default">
             <div class="text-brand-pink transform group-hover:scale-110 transition-transform"><app-icon name="check" size="28px"></app-icon></div>
             <div><p class="font-bold text-xs md:text-sm text-gray-800 dark:text-gray-200">Compra Segura</p><p class="text-[10px] text-gray-400">Site protegido</p></div>
           </div>
         </div>
      </div>
    </div>

    <!-- Categories -->
    <section class="py-12 bg-brand-light dark:bg-brand-darkbg transition-colors duration-300">
      <div class="w-full max-w-[1440px] mx-auto px-4 md:px-6">
        <div class="text-center mb-10">
           <div class="w-1 h-8 bg-brand-pink mx-auto rounded-full mb-3"></div>
           <h2 class="text-2xl md:text-3xl font-black text-brand-dark dark:text-white">Navegue por Categorias</h2>
        </div>
        
        <div class="flex flex-wrap justify-center gap-6 md:gap-12">
          @for (cat of store.categories(); track cat.id) {
            <a [routerLink]="['/catalogo']" [queryParams]="{cat: cat.slug}" class="flex flex-col items-center gap-4 group cursor-pointer w-24 md:w-32">
              <div class="w-24 h-24 md:w-32 md:h-32 rounded-full p-[3px] bg-gradient-to-tr from-brand-pink via-purple-400 to-brand-lilac shadow-lg group-hover:scale-105 transition-transform duration-300">
                <div class="w-full h-full rounded-full border-[3px] border-white dark:border-brand-darkbg overflow-hidden bg-white">
                   @if (cat.mediaType === 'video' && cat.videoUrl) {
                     <video [src]="cat.videoUrl"
                            class="w-full h-full object-cover hover:opacity-90 transition-opacity"
                            autoplay
                            loop
                            muted
                            playsinline
                            (mouseenter)="onMediaHoverStart($any($event.target), cat.playAudioOnHover)"
                            (mouseleave)="onMediaHoverEnd($any($event.target))"></video>
                   } @else {
                     <img [src]="cat.image" [alt]="cat.name" (error)="handleImageError($event)" class="w-full h-full object-cover hover:opacity-90 transition-opacity">
                   }
                </div>
              </div>
              <span class="text-sm font-bold text-gray-700 dark:text-gray-200 group-hover:text-brand-pink transition-colors">{{ cat.name }}</span>
            </a>
          }
        </div>
      </div>
    </section>

    <!-- Best Sellers (Lazy Loaded on Viewport) -->
    <section class="py-16 bg-white dark:bg-brand-darksurface transition-colors duration-300">
      <div class="w-full max-w-[1440px] mx-auto px-4 md:px-6">
        <div class="flex justify-between items-end mb-8 md:mb-12">
          <div>
            <h2 class="text-2xl md:text-3xl font-black text-brand-dark dark:text-white mb-2 flex items-center gap-2">
               <span class="text-3xl">🔥</span> Mais Vendidos
            </h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">As peças que as mamães mais amam ❤️</p>
          </div>
          <a routerLink="/catalogo" class="hidden md:flex items-center gap-2 text-sm font-bold text-brand-pink hover:text-brand-lilac transition-colors border-b-2 border-transparent hover:border-brand-lilac pb-1">Ver tudo <app-icon name="chevron-right" size="16px"></app-icon></a>
        </div>
        
        <!-- Defer Loading of Heavy Product Cards until they are near viewport -->
        @defer (on viewport) {
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 animate-fade-in">
            @for (product of store.products().slice(0, 4); track product.id) {
               <app-product-card [product]="product"></app-product-card>
            }
          </div>
        } @placeholder {
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
             @for (i of [1,2,3,4]; track i) {
               <div class="h-[300px] bg-gray-100 dark:bg-gray-800 rounded-3xl animate-pulse"></div>
             }
          </div>
        }
        
        <div class="mt-10 text-center md:hidden">
           <a routerLink="/catalogo" class="inline-block px-8 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold rounded-full text-xs uppercase tracking-wide">Ver todos os produtos</a>
        </div>
      </div>
    </section>

    <!-- PROMO BANNER (HOME MID) -->
    @if (currentPromoBanner(); as banner) {
      @defer (on viewport) {
        <section class="py-16 bg-gradient-to-r from-brand-soft to-white dark:from-brand-darkbg dark:to-brand-darksurface relative overflow-hidden">
           <div class="w-full max-w-[1440px] mx-auto px-4 md:px-6 relative z-10 flex flex-col md:flex-row items-center gap-12">
             <div class="w-full md:w-1/2">
                <div class="relative rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white dark:border-brand-darksurface rotate-1 hover:rotate-0 transition-transform duration-500">
                   @if (banner.mediaType === 'video' && banner.videoUrl) {
                     <video [src]="banner.videoUrl"
                            class="w-full object-cover h-[400px]"
                            autoplay
                            loop
                            muted
                            playsinline
                            (mouseenter)="onMediaHoverStart($any($event.target), banner.playAudioOnHover)"
                            (mouseleave)="onMediaHoverEnd($any($event.target))"></video>
                   } @else {
                     <img [src]="banner.image" (error)="handleImageError($event)" class="w-full object-cover h-[400px]">
                   }
                   @if(banner.badgeText) {
                     <div class="absolute bottom-6 left-6 bg-white/90 backdrop-blur px-4 py-2 rounded-xl text-brand-dark font-black text-xs uppercase tracking-widest shadow-lg">
                       {{ banner.badgeText }}
                     </div>
                   }
                </div>
             </div>
             
             <div class="w-full md:w-1/2 text-center md:text-left">
                @if(banner.badgeText) {
                  <div class="inline-block px-3 py-1 bg-red-500 text-white text-[10px] font-bold rounded uppercase tracking-wider mb-4 animate-bounce-gentle">{{ banner.badgeText }}</div>
                }
                <h2 class="text-3xl md:text-5xl font-black text-brand-dark dark:text-white leading-tight mb-4">
                  {{ banner.title || 'Oferta' }}
                  <br><span class="text-brand-pink">{{ banner.subtitle || 'Imperdível' }}</span>
                </h2>
                <p class="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto md:mx-0">
                  {{ banner.description || 'Aproveite descontos exclusivos. Vestidos e conjuntos dignos de princesa!' }}
                </p>
                
                <div class="flex gap-4 justify-center md:justify-start">
                   <div class="text-center">
                     <div class="bg-white dark:bg-brand-darksurface w-16 h-16 rounded-2xl shadow-sm flex items-center justify-center text-xl font-black text-brand-dark dark:text-white border border-gray-100 dark:border-gray-700">{{ timeLeft().hours }}</div>
                     <span class="text-[10px] font-bold text-gray-400 uppercase mt-1 block">Horas</span>
                   </div>
                   <div class="text-center">
                     <div class="bg-white dark:bg-brand-darksurface w-16 h-16 rounded-2xl shadow-sm flex items-center justify-center text-xl font-black text-brand-dark dark:text-white border border-gray-100 dark:border-gray-700">{{ timeLeft().minutes }}</div>
                     <span class="text-[10px] font-bold text-gray-400 uppercase mt-1 block">Min</span>
                   </div>
                   <div class="text-center">
                     <div class="bg-white dark:bg-brand-darksurface w-16 h-16 rounded-2xl shadow-sm flex items-center justify-center text-xl font-black text-brand-dark dark:text-white border border-gray-100 dark:border-gray-700">{{ timeLeft().seconds }}</div>
                     <span class="text-[10px] font-bold text-gray-400 uppercase mt-1 block">Seg</span>
                   </div>
                </div>
                
                <div class="mt-8">
                  <a [routerLink]="banner.link" class="px-10 py-4 bg-brand-dark text-white font-bold rounded-full hover:bg-brand-pink transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 text-sm uppercase tracking-wide inline-block">
                    Comprar Agora
                  </a>
                </div>
             </div>
           </div>

           @if (promoBanners().length > 1) {
             <button (click)="prevBanner('promo')" class="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 text-white backdrop-blur hover:bg-black/50 transition-colors">
               <app-icon name="chevron-left" size="20px"></app-icon>
             </button>
             <button (click)="nextBanner('promo')" class="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 text-white backdrop-blur hover:bg-black/50 transition-colors">
               <app-icon name="chevron-right" size="20px"></app-icon>
             </button>
             <div class="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/10 px-3 py-1.5 rounded-full backdrop-blur">
               @for (item of promoBanners(); track item.id; let i = $index) {
                 <button (click)="goToBanner('promo', i)" class="w-2.5 h-2.5 rounded-full border border-gray-500/50 transition-colors"
                         [ngClass]="i === promoIndex() ? 'bg-gray-700 dark:bg-white' : 'bg-white/60 dark:bg-gray-500'"></button>
               }
             </div>
           }
        </section>
      } @placeholder {
        <!-- Add Placeholder to prevent defer crash -->
        <div class="w-full h-[400px] bg-gray-50 dark:bg-gray-800 animate-pulse flex items-center justify-center text-gray-300 dark:text-gray-600">
           <span class="text-xs font-bold uppercase tracking-widest">Carregando Promoção...</span>
        </div>
      }
    }

    <!-- Instagram Feed (Lazy Load) -->
    @defer (on viewport) {
      <app-instagram-feed></app-instagram-feed>
    } @placeholder {
      <div class="py-16 text-center text-gray-400">Carregando feed...</div>
    }
  `
})
export class HomeComponent implements OnInit, OnDestroy {
  store = inject(StoreService);
  seo = inject(SeoService);
  
  // Dynamic Banners
  heroBanners = computed(() =>
    this.store
      .banners()
      .filter(b => b.location === 'home-hero' && b.active !== false)
      .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
  );
  promoBanners = computed(() =>
    this.store
      .banners()
      .filter(b => b.location === 'home-mid' && b.active !== false)
      .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
  );
  heroIndex = signal(0);
  promoIndex = signal(0);
  currentHeroBanner = computed(() => {
    const banners = this.heroBanners();
    if (!banners.length) return null;
    return banners[this.heroIndex() % banners.length];
  });
  currentPromoBanner = computed(() => {
    const banners = this.promoBanners();
    if (!banners.length) return null;
    return banners[this.promoIndex() % banners.length];
  });

  timeLeft = signal({ hours: 0, minutes: 0, seconds: 0 });
  countdownInterval: any;
  heroRotationInterval: any;
  promoRotationInterval: any;

  constructor() {
    effect(() => {
      const heroCount = this.heroBanners().length;
      if (this.heroIndex() >= heroCount && heroCount > 0) this.heroIndex.set(0);
      clearInterval(this.heroRotationInterval);
      if (heroCount > 1) {
        this.heroRotationInterval = setInterval(() => this.nextBanner('hero'), 7000);
      }
    });

    effect(() => {
      const promoCount = this.promoBanners().length;
      if (this.promoIndex() >= promoCount && promoCount > 0) this.promoIndex.set(0);
      clearInterval(this.promoRotationInterval);
      if (promoCount > 1) {
        this.promoRotationInterval = setInterval(() => this.nextBanner('promo'), 8000);
      }
      if (this.currentPromoBanner()) {
        this.startTimer();
      }
    });
  }

  ngOnInit() {
    this.seo.resetSeo();
    this.startTimer();
  }

  ngOnDestroy() {
    clearInterval(this.countdownInterval);
    clearInterval(this.heroRotationInterval);
    clearInterval(this.promoRotationInterval);
  }

  startTimer() {
    clearInterval(this.countdownInterval);
    
    const banner = this.currentPromoBanner();
    let deadline = new Date();
    
    if (banner?.endDate) {
        deadline = new Date(banner.endDate);
    } else {
        deadline.setHours(deadline.getHours() + 5); 
    }

    const calculate = () => {
      const now = new Date().getTime();
      const t = deadline.getTime() - now;
      if (t >= 0) {
        this.timeLeft.set({
          hours: Math.floor((t % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((t % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((t % (1000 * 60)) / 1000)
        });
      } else {
        this.timeLeft.set({ hours: 0, minutes: 0, seconds: 0 });
        clearInterval(this.countdownInterval);
      }
    };

    calculate();
    this.countdownInterval = setInterval(calculate, 1000);
  }

  nextBanner(type: 'hero' | 'promo') {
    if (type === 'hero') {
      const total = this.heroBanners().length;
      if (!total) return;
      this.heroIndex.update(v => (v + 1) % total);
      return;
    }
    const total = this.promoBanners().length;
    if (!total) return;
    this.promoIndex.update(v => (v + 1) % total);
    this.startTimer();
  }

  prevBanner(type: 'hero' | 'promo') {
    if (type === 'hero') {
      const total = this.heroBanners().length;
      if (!total) return;
      this.heroIndex.update(v => (v - 1 + total) % total);
      return;
    }
    const total = this.promoBanners().length;
    if (!total) return;
    this.promoIndex.update(v => (v - 1 + total) % total);
    this.startTimer();
  }

  goToBanner(type: 'hero' | 'promo', index: number) {
    if (type === 'hero') {
      this.heroIndex.set(index);
      return;
    }
    this.promoIndex.set(index);
    this.startTimer();
  }

  onMediaHoverStart(video: HTMLVideoElement, enableAudio = false) {
    if (!enableAudio) return;
    video.muted = false;
    video.play().catch(() => {});
  }

  onMediaHoverEnd(video: HTMLVideoElement) {
    video.muted = true;
  }

  handleImageError(event: any) {
    event.target.src = 'https://placehold.co/1200x800/FF69B4/FFFFFF?text=YARA+Kids';
  }
}


