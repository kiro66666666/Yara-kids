
import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from '../../services/store.service';
import { ProductCardComponent } from '../../components/product-card.component';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../ui/icons';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { SeoService } from '../../services/seo.service'; // Added
import { Title } from '@angular/platform-browser'; // Added

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, ProductCardComponent, FormsModule, IconComponent, RouterLink],
  template: `
    <div class="bg-gray-50 dark:bg-brand-darkbg min-h-screen pt-4 pb-24 lg:pb-12 transition-colors duration-300">
      <div class="w-full max-w-[1440px] mx-auto px-4 lg:px-6">
        
        <!-- Dynamic Top Banner -->
        @if(catalogBanner(); as banner) {
          <div class="relative w-full h-40 md:h-64 rounded-3xl overflow-hidden mb-8 lg:mb-12 shadow-lg group animate-fade-in">
            <img [src]="banner.image" [alt]="banner.title" (error)="handleImageError($event)" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">
            <div class="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex flex-col justify-center px-8 md:px-16 text-white">
               <span class="text-[10px] md:text-sm font-bold uppercase tracking-widest text-brand-yellow mb-2">{{ banner.subtitle }}</span>
               <h2 class="text-2xl md:text-5xl font-black mb-4 leading-tight max-w-xl">{{ banner.title }}</h2>
               <a [routerLink]="banner.link" class="inline-flex items-center gap-2 bg-white text-brand-dark px-6 py-2.5 rounded-full font-bold text-xs md:text-sm hover:bg-brand-pink hover:text-white transition-all shadow-md self-start">
                 Conferir <app-icon name="chevron-right" size="16px"></app-icon>
               </a>
            </div>
          </div>
        }

        <!-- Page Header -->
        <div class="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 animate-fade-in">
          <div class="text-center md:text-left w-full md:w-auto">
            <h1 class="text-2xl md:text-3xl font-black text-gray-800 dark:text-white mb-1 tracking-tight">Catálogo</h1>
            <p class="text-gray-500 dark:text-gray-400 font-medium text-xs md:text-sm">
              @if(searchQuery()) {
                Resultados para "<span class="text-brand-pink">{{ searchQuery() }}</span>" • 
              }
              {{ filteredProducts().length }} produtos encontrados
            </p>
          </div>
          
          <div class="flex items-center gap-3 w-full md:w-auto">
             <!-- Mobile Filter Trigger -->
             <button (click)="showMobileFilters.set(true)" class="lg:hidden flex-1 flex items-center justify-center gap-2 bg-white dark:bg-brand-darksurface p-2.5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-sm font-bold text-gray-700 dark:text-white">
                <span class="text-xl">🎚️</span> Filtrar
             </button>

             <div class="flex items-center gap-3 bg-white dark:bg-brand-darksurface p-1 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex-1 md:flex-none justify-between md:justify-start">
               <span class="text-xs font-bold text-gray-400 uppercase tracking-wider ml-3">Ordenar:</span>
               <div class="relative">
                 <select [ngModel]="sort()" (ngModelChange)="sort.set($event)" class="appearance-none pl-3 pr-8 py-2 rounded-lg bg-transparent text-sm font-bold text-brand-dark dark:text-gray-200 focus:outline-none cursor-pointer">
                   <option value="featured" class="dark:bg-brand-darksurface">✨ Destaques</option>
                   <option value="price_asc" class="dark:bg-brand-darksurface">💲 Menor Preço</option>
                   <option value="price_desc" class="dark:bg-brand-darksurface">💰 Maior Preço</option>
                   <option value="newest" class="dark:bg-brand-darksurface">🆕 Lançamentos</option>
                 </select>
                 <div class="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                   <app-icon name="chevron-down" size="14px"></app-icon>
                 </div>
               </div>
             </div>
          </div>
        </div>

        <div class="flex flex-col lg:flex-row gap-8 lg:gap-12 relative">
          
          <!-- Mobile Filter Overlay -->
          @if (showMobileFilters()) {
            <div class="fixed inset-0 bg-black/60 z-[60] lg:hidden backdrop-blur-sm transition-opacity" (click)="showMobileFilters.set(false)"></div>
          }

          <!-- Filters Sidebar (Redesigned for Mobile Scrolling) -->
          <aside class="fixed inset-y-0 left-0 z-[70] w-[85%] max-w-[320px] bg-white dark:bg-brand-darksurface shadow-2xl transform transition-transform duration-300 h-[100dvh] flex flex-col lg:block lg:static lg:w-64 lg:shadow-none lg:bg-transparent lg:translate-x-0 lg:h-auto lg:overflow-visible"
                 [class.translate-x-0]="showMobileFilters()"
                 [class.-translate-x-full]="!showMobileFilters()">
             
             <!-- Mobile Header (Fixed at top) -->
             <div class="flex items-center justify-between p-6 lg:hidden border-b border-gray-100 dark:border-gray-700 shrink-0">
               <span class="font-black text-xl text-gray-800 dark:text-white">Filtros</span>
               <button (click)="showMobileFilters.set(false)" class="p-2 bg-gray-100 dark:bg-gray-800 rounded-full"><app-icon name="x" size="20px"></app-icon></button>
             </div>

             <!-- Scrollable Content Area -->
             <div class="flex-1 overflow-y-auto p-6 lg:p-6 lg:rounded-3xl lg:bg-white lg:dark:bg-brand-darksurface lg:shadow-sm lg:border lg:border-gray-100 lg:dark:border-gray-700 lg:sticky lg:top-24 transition-colors custom-scrollbar pb-24 lg:pb-6">
              
              <!-- Filter Title & Clear (Desktop) -->
              <div class="flex items-center justify-between mb-6 pb-4 border-b border-gray-50 dark:border-gray-700">
                <div class="flex items-center gap-2">
                  <span class="text-xl">🎚️</span>
                  <h3 class="font-bold text-lg text-gray-800 dark:text-white">Filtrar Por</h3>
                </div>
                <button (click)="resetFilters()" class="text-xs font-bold text-brand-pink hover:underline">Limpar</button>
              </div>
              
              <!-- Price Filter -->
              <div class="mb-8">
                 <h4 class="font-bold text-xs text-gray-400 mb-4 uppercase tracking-wider">Faixa de Preço</h4>
                 <div class="flex items-center gap-2">
                   <div class="relative flex-1 group">
                     <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">R$</span>
                     <input type="number" 
                            [ngModel]="minPrice()" 
                            (ngModelChange)="minPrice.set($event)"
                            [ngModelOptions]="{updateOn: 'blur'}"
                            placeholder="0" 
                            class="w-full pl-8 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-200 focus:bg-white dark:focus:bg-gray-700 focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20 outline-none transition-all">
                   </div>
                   <span class="text-gray-300 font-bold">-</span>
                   <div class="relative flex-1 group">
                     <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">R$</span>
                     <input type="number" 
                            [ngModel]="maxPrice()" 
                            (ngModelChange)="maxPrice.set($event)" 
                            [ngModelOptions]="{updateOn: 'blur'}"
                            placeholder="Max" 
                            class="w-full pl-8 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-200 focus:bg-white dark:focus:bg-gray-700 focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20 outline-none transition-all">
                   </div>
                 </div>
              </div>

              <!-- Gender Filter -->
              <div class="mb-8">
                 <h4 class="font-bold text-xs text-gray-400 mb-4 uppercase tracking-wider">Gênero</h4>
                 <div class="space-y-2">
                    <label class="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors -mx-2">
                       <input type="checkbox" [ngModel]="filterGirl()" (ngModelChange)="filterGirl.set($event)" class="w-5 h-5 rounded border-gray-300 text-brand-pink focus:ring-brand-pink bg-gray-100 dark:bg-gray-700 dark:border-gray-600">
                       <span class="text-gray-600 dark:text-gray-300 font-medium group-hover:text-brand-dark dark:group-hover:text-white">Menina</span>
                    </label>
                    <label class="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors -mx-2">
                       <input type="checkbox" [ngModel]="filterBoy()" (ngModelChange)="filterBoy.set($event)" class="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500 bg-gray-100 dark:bg-gray-700 dark:border-gray-600">
                       <span class="text-gray-600 dark:text-gray-300 font-medium group-hover:text-brand-dark dark:group-hover:text-white">Menino</span>
                    </label>
                 </div>
              </div>

              <!-- Dynamic Category Filter -->
              <div class="mb-8">
                <h4 class="font-bold text-xs text-gray-400 mb-4 uppercase tracking-wider">Categorias</h4>
                <div class="space-y-2">
                  @for(cat of store.categories(); track cat.id) {
                    <label class="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors -mx-2">
                      <input type="checkbox" 
                             [checked]="selectedCategories().includes(cat.id)"
                             (change)="toggleCategory(cat.id)"
                             class="w-5 h-5 rounded border-gray-300 text-brand-pink focus:ring-brand-pink bg-gray-100 dark:bg-gray-700 dark:border-gray-600">
                      <span class="text-gray-600 dark:text-gray-300 font-medium group-hover:text-brand-dark dark:group-hover:text-white">{{ cat.name }}</span>
                    </label>
                  }
                  @if(store.categories().length === 0) {
                    <p class="text-xs text-gray-400">Nenhuma categoria encontrada.</p>
                  }
                </div>
              </div>

              <!-- Sidebar Promo Banner (Desktop Only) -->
              @if(sidebarBanner(); as banner) {
                <a [routerLink]="banner.link" class="hidden lg:block mt-8 rounded-2xl overflow-hidden relative group cursor-pointer shadow-lg aspect-[3/4]">
                   <img [src]="banner.image" (error)="handleImageError($event)" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
                   <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
                      <p class="font-bold text-xl mb-1 leading-tight">{{ banner.title }}</p>
                      <span class="text-xs font-bold bg-white/20 backdrop-blur-md px-3 py-1 rounded-full self-start border border-white/30">Ver Oferta</span>
                   </div>
                </a>
              }
            </div>

            <!-- Mobile Apply Button (Fixed at Bottom) -->
            <div class="lg:hidden absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-brand-darksurface z-10">
               <button (click)="showMobileFilters.set(false)" class="w-full py-3 bg-brand-dark text-white font-bold rounded-xl shadow-lg active:scale-[0.98] transition-transform">
                 Ver {{ filteredProducts().length }} Produtos
               </button>
            </div>
          </aside>

          <!-- Product Grid -->
          <div class="flex-1">
            <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 animate-fade-in">
              @for (product of filteredProducts(); track product.id) {
                <app-product-card [product]="product"></app-product-card>
              }
            </div>
            
            @if (filteredProducts().length === 0) {
               <div class="flex flex-col items-center justify-center py-32 text-center bg-white dark:bg-brand-darksurface rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm animate-fade-in">
                 <div class="text-6xl mb-4 grayscale opacity-50">🧸</div>
                 <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-2">Nenhum produto encontrado</h3>
                 <p class="text-gray-500 text-sm">Tente ajustar os filtros ou a busca.</p>
                 <button (click)="resetFilters()" class="mt-6 px-6 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 text-sm transition-colors">Limpar Filtros</button>
               </div>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class CatalogComponent {
  store = inject(StoreService);
  route = inject(ActivatedRoute);
  titleService = inject(Title); // Inject Title service

  // --- Reactive State (Signals) ---
  sort = signal('featured');
  filterGirl = signal(true);
  filterBoy = signal(true);
  minPrice = signal<number | null>(null);
  maxPrice = signal<number | null>(null);
  selectedCategories = signal<string[]>([]);
  searchQuery = signal<string>('');
  
  // UI State
  showMobileFilters = signal(false);

  // Computed Banners
  catalogBanner = computed(() => this.store.banners().find(b => b.location === 'catalog-top'));
  sidebarBanner = computed(() => this.store.banners().find(b => b.location === 'catalog-sidebar'));

  constructor() {
    // Dynamic SEO Title based on search or category
    effect(() => {
        const search = this.searchQuery();
        const cats = this.selectedCategories();
        
        let title = 'Catálogo Completo | YARA Kids';
        
        if (search) {
            title = `Busca por: ${search} | YARA Kids`;
        } else if (cats.length === 1) {
            const catName = this.store.categories().find(c => c.id === cats[0])?.name;
            if (catName) title = `${catName} | YARA Kids`;
        }
        
        this.titleService.setTitle(title);
    });

    // Initial query params handler
    this.route.queryParams.subscribe(params => {
      if (params['cat']) {
        const cat = this.store.categories().find(c => c.slug === params['cat']);
        if (cat) this.selectedCategories.set([cat.id]);
      }
      if (params['sort']) {
        this.sort.set(params['sort']);
      }
      if (params['search']) {
        this.searchQuery.set(params['search']);
      } else {
        this.searchQuery.set('');
      }
    });
  }

  // --- Computed Filter Logic ---
  filteredProducts = computed(() => {
    let prods = this.store.products();
    const s = this.sort();
    const g = this.filterGirl();
    const b = this.filterBoy();
    const min = this.minPrice();
    const max = this.maxPrice();
    const cats = this.selectedCategories();
    const search = this.searchQuery().toLowerCase();

    // 0. Search Filter
    if (search) {
      prods = prods.filter(p => 
        p.name.toLowerCase().includes(search) || 
        p.description?.toLowerCase().includes(search)
      );
    }

    // 1. Gender Filter
    if (g && !b) prods = prods.filter(p => p.gender === 'girl' || p.gender === 'unisex');
    else if (!g && b) prods = prods.filter(p => p.gender === 'boy' || p.gender === 'unisex');
    else if (!g && !b) prods = []; // No gender selected

    // 2. Price Filter
    if (min !== null) prods = prods.filter(p => p.price >= min);
    if (max !== null) prods = prods.filter(p => p.price <= max);

    // 3. Category Filter
    if (cats.length > 0) {
      prods = prods.filter(p => cats.includes(p.categoryId));
    }

    // 4. Sort
    return [...prods].sort((a, b) => { // Create a copy to sort
      switch (s) {
        case 'price_asc': return a.price - b.price;
        case 'price_desc': return b.price - a.price;
        case 'newest': return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
        default: return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0); // featured
      }
    });
  });

  toggleCategory(id: string) {
    this.selectedCategories.update(ids => {
      if (ids.includes(id)) return ids.filter(x => x !== id);
      return [...ids, id];
    });
  }

  resetFilters() {
    this.filterGirl.set(true);
    this.filterBoy.set(true);
    this.minPrice.set(null);
    this.maxPrice.set(null);
    this.selectedCategories.set([]);
    this.searchQuery.set('');
    this.sort.set('featured');
  }

  handleImageError(event: any) {
    event.target.src = 'https://placehold.co/1200x800/FF69B4/FFFFFF?text=YARA+Kids';
  }
}
