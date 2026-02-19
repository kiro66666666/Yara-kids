
import { Component, input, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { Product, StoreService } from '../services/store.service';
import { IconComponent } from '../ui/icons';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  template: `
    <div class="group relative bg-white dark:bg-brand-darksurface rounded-2xl transition-all duration-300 hover:shadow-soft hover:-translate-y-1 h-full flex flex-col border border-gray-100 dark:border-gray-700 overflow-hidden">
      
      <!-- Badges Layer -->
      <div class="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
        @if (product().isNew) {
          <span class="px-2.5 py-1 text-[10px] font-black text-white uppercase tracking-wider rounded-md shadow-sm bg-brand-pink">
            NOVO
          </span>
        }
        @if (product().discount > 0) {
          <span class="px-2.5 py-1 text-[10px] font-black text-white uppercase tracking-wider rounded-md shadow-sm bg-red-500">
            -{{ product().discount }}%
          </span>
        }
        @if (product().stock === 0) {
          <span class="px-2.5 py-1 text-[10px] font-black text-white uppercase tracking-wider rounded-md shadow-sm bg-gray-400">
            ESGOTADO
          </span>
        }
      </div>

      <!-- Share Button (Left of Heart) -->
      <button (click)="openShare($event)" class="absolute top-3 right-14 z-20 w-9 h-9 bg-white dark:bg-brand-darkbg text-gray-400 rounded-full flex items-center justify-center hover:text-brand-pink hover:scale-110 transition-all shadow-sm active:scale-90 border border-transparent hover:border-brand-pink/20">
        <app-icon name="share" size="16px"></app-icon>
      </button>

      <!-- Favorite Button -->
      <button (click)="toggleFavorite($event)" class="absolute top-3 right-3 z-10 w-9 h-9 bg-white dark:bg-brand-darkbg rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-sm active:scale-90"
        [class.text-red-500]="isFav()" [class.text-gray-300]="!isFav()">
        <app-icon name="heart" size="18px" [class.fill-current]="isFav()"></app-icon>
      </button>

      <!-- Image Area (Lazy Loaded with Skeleton) -->
      <a [routerLink]="['/produto', product().id]" class="block aspect-[4/5] overflow-hidden relative bg-gray-50 dark:bg-gray-800">
        
        <!-- Skeleton Loader (Visible while loading) -->
        <div class="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse z-0" *ngIf="isLoading()"></div>

        @if (!imageError()) {
          <img [src]="product().image" 
               [alt]="product().name" 
               loading="lazy" 
               decoding="async"
               (load)="onImageLoad()"
               (error)="handleImageError()"
               class="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 z-10 relative"
               [class.opacity-0]="isLoading()"
               [class.opacity-100]="!isLoading()">
        } @else {
          <div class="w-full h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 z-10 relative">
            <app-icon name="image-off" size="32px"></app-icon>
            <span class="text-[10px] font-bold uppercase mt-2 opacity-50">Sem Imagem</span>
          </div>
        }
        
        <!-- Overlay on Hover (Desktop) -->
        <div class="hidden lg:block absolute inset-0 bg-black/5 dark:bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"></div>

        <!-- Desktop Quick View Button -->
        <div class="hidden lg:flex absolute bottom-4 left-0 right-0 justify-center opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 px-4 z-30">
           <button class="w-full bg-white/95 dark:bg-brand-darkbg/95 backdrop-blur text-brand-dark dark:text-white font-bold py-3 rounded-xl shadow-lg hover:bg-brand-dark hover:text-white dark:hover:bg-white dark:hover:text-brand-dark transition-colors text-xs uppercase tracking-wide flex items-center justify-center gap-2">
             <app-icon name="shopping-bag" size="16px"></app-icon> Ver Detalhes
           </button>
        </div>

        <!-- Mobile Action Button (Visible Always) -->
        <button [routerLink]="['/produto', product().id]" class="lg:hidden absolute bottom-2 right-2 w-11 h-11 bg-white/90 backdrop-blur text-brand-pink rounded-full shadow-md flex items-center justify-center z-20 border border-brand-pink/20 active:scale-90 transition-transform">
           <app-icon name="shopping-bag" size="20px"></app-icon>
        </button>
      </a>

      <!-- Product Info -->
      <div class="p-4 flex flex-col flex-1">
        <!-- Rating -->
        <div class="flex items-center gap-1 mb-2">
          <div class="flex text-brand-yellow text-[10px]">
             @for(i of [1,2,3,4,5]; track i) {
               <app-icon name="star" size="10px" [class.fill-current]="i <= product().rating" [class.text-gray-200]="i > product().rating"></app-icon>
             }
          </div>
          <span class="text-[10px] text-gray-400 font-medium ml-1">({{ product().reviews }})</span>
        </div>

        <!-- Title -->
        <h3 class="font-bold text-brand-dark dark:text-white text-sm mb-1 leading-tight line-clamp-2 min-h-[2.5em] group-hover:text-brand-pink transition-colors">
          <a [routerLink]="['/produto', product().id]">{{ product().name }}</a>
        </h3>
        
        <!-- Category -->
        <p class="text-[10px] text-gray-400 dark:text-gray-500 mb-3 capitalize truncate">{{ product().categoryName || 'Geral' }}</p>

        <!-- Price & Colors -->
        <div class="mt-auto flex items-end justify-between border-t border-gray-50 dark:border-gray-700 pt-3">
          <div class="flex flex-col">
            @if (product().discount > 0) {
              <span class="text-[10px] text-gray-400 line-through mb-0.5">R$ {{ product().originalPrice.toFixed(2) }}</span>
            }
            <span class="text-base font-black text-brand-dark dark:text-white">R$ {{ product().price.toFixed(2) }}</span>
          </div>
          
          <div class="flex -space-x-1.5 pl-2">
            @for (color of product().colors.slice(0, 3); track color.name) {
              <div class="w-4 h-4 rounded-full border border-white dark:border-gray-700 shadow-sm ring-1 ring-gray-100 dark:ring-gray-600" [style.background-color]="color.hex" [title]="color.name"></div>
            }
            @if(product().colors.length > 3) {
              <div class="w-4 h-4 rounded-full border border-white dark:border-gray-700 bg-gray-100 dark:bg-gray-600 flex items-center justify-center text-[8px] text-gray-500 font-bold">+{{product().colors.length - 3}}</div>
            }
          </div>
        </div>
      </div>

      <!-- Share Modal -->
      @if (showShareModal()) {
        <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" (click)="closeShare()">
          <div class="bg-white dark:bg-brand-darksurface rounded-2xl w-full max-w-xs shadow-2xl p-6 relative animate-slide-up border border-gray-100 dark:border-gray-700" (click)="$event.stopPropagation()">
            
            <button (click)="closeShare()" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white">
              <app-icon name="x" size="20px"></app-icon>
            </button>

            <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-4 text-center">Compartilhar</h3>
            
            <div class="flex flex-col gap-3">
              <button (click)="shareWhatsApp()" class="flex items-center gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors font-bold text-sm">
                <app-icon name="whatsapp" size="20px"></app-icon>
                <span>Enviar no WhatsApp</span>
              </button>
              
              <button (click)="copyLink()" class="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-bold text-sm relative">
                <app-icon name="link" size="20px"></app-icon>
                <span>{{ linkCopied() ? 'Link Copiado!' : 'Copiar Link' }}</span>
                @if(linkCopied()) {
                  <span class="absolute right-3 text-green-500"><app-icon name="check" size="16px"></app-icon></span>
                }
              </button>
            </div>
          </div>
        </div>
      }

    </div>
  `
})
export class ProductCardComponent {
  product = input.required<Product>();
  
  store = inject(StoreService); // Inject Store
  router = inject(Router);

  imageError = signal(false);
  isLoading = signal(true); 
  
  showShareModal = signal(false);
  linkCopied = signal(false);

  // Helper to check if favorited
  isFav() {
    return this.store.isFavorite(this.product().id);
  }

  toggleFavorite(event: Event) {
    event.preventDefault();
    event.stopPropagation();

    // AUTH CHECK
    if (!this.store.user()) {
        this.store.showToast('Faça login para favoritar', 'info');
        this.router.navigate(['/login']);
        return;
    }
    // Terms Check (Strict mode)
    if (!this.store.termsAccepted()) {
       // The global modal will show, just notify
       this.store.showToast('Aceite os termos para continuar', 'info');
       return;
    }

    this.store.toggleFavorite(this.product().id);
  }

  onImageLoad() {
    this.isLoading.set(false);
  }

  handleImageError() {
    this.imageError.set(true);
    this.isLoading.set(false); // Stop loading if error
  }

  openShare(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.showShareModal.set(true);
  }

  closeShare() {
    this.showShareModal.set(false);
    this.linkCopied.set(false);
  }

  getProductUrl() {
    // Assuming Hash Routing based on index.tsx configuration
    return `${window.location.origin}/#/produto/${this.product().id}`;
  }

  shareWhatsApp() {
    const p = this.product();
    const url = this.getProductUrl();
    const msg = `Olha que lindo da YARA Kids! 🎀\n\n${p.name}\nPor R$ ${p.price.toFixed(2)}\n\nConfira aqui: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    this.closeShare();
  }

  copyLink() {
    const url = this.getProductUrl();
    navigator.clipboard.writeText(url).then(() => {
      this.linkCopied.set(true);
      setTimeout(() => {
        this.closeShare();
      }, 1500);
    });
  }
}

