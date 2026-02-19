
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
      @if (heroBanner(); as banner) {
        <div class="absolute inset-0">
          <img [src]="banner.image" 
               [alt]="banner.title || 'Nova Coleção'" 
               (error)="handleImageError($event)"
               class="w-full h-full object-cover object-center lg:object-[center_30%] transition-transform duration-[20s] group-hover:scale-105"
               fetchpriority="high"> <!-- Priority Load -->
          
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
                   <img [src]="cat.image" [alt]="cat.name" (error)="handleImageError($event)" class="w-full h-full object-cover hover:opacity-90 transition-opacity">
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
    @if (promoBanner(); as banner) {
      @defer (on viewport) {
        <section class="py-16 bg-gradient-to-r from-brand-soft to-white dark:from-brand-darkbg dark:to-brand-darksurface relative overflow-hidden">
           <div class="w-full max-w-[1440px] mx-auto px-4 md:px-6 relative z-10 flex flex-col md:flex-row items-center gap-12">
             <div class="w-full md:w-1/2">
                <div class="relative rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white dark:border-brand-darksurface rotate-1 hover:rotate-0 transition-transform duration-500">
                   <img [src]="banner.image" (error)="handleImageError($event)" class="w-full object-cover h-[400px]">
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
  heroBanner = computed(() => this.store.banners().find(b => b.location === 'home-hero'));
  promoBanner = computed(() => this.store.banners().find(b => b.location === 'home-mid'));

  timeLeft = signal({ hours: 0, minutes: 0, seconds: 0 });
  interval: any;

  constructor() {
    effect(() => {
        if (this.promoBanner()) {
            this.startTimer();
        }
    });
  }

  ngOnInit() {
    this.seo.resetSeo();
    this.startTimer();
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }

  startTimer() {
    clearInterval(this.interval);
    
    const banner = this.promoBanner();
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
        clearInterval(this.interval);
      }
    };

    calculate();
    this.interval = setInterval(calculate, 1000);
  }

  handleImageError(event: any) {
    event.target.src = 'https://placehold.co/1200x800/FF69B4/FFFFFF?text=YARA+Kids';
  }
}
