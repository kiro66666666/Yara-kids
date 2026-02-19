
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { StoreService } from '../services/store.service';
import { IconComponent } from '../ui/icons';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, IconComponent],
  template: `
    <nav class="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-brand-darksurface/95 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 z-50 pb-safe shadow-[0_-5px_15px_rgba(0,0,0,0.03)] transition-all duration-300">
      <div class="grid grid-cols-5 h-[60px] items-center relative">

        <!-- Home -->
        <a routerLink="/" routerLinkActive="text-brand-pink" [routerLinkActiveOptions]="{exact: true}" 
           class="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 gap-1 active:scale-90 transition-transform group touch-manipulation">
          <app-icon name="home" size="20px" class="group-[.text-brand-pink]:stroke-[2.5px] mb-0.5 transition-all"></app-icon>
          <span class="text-[9px] font-bold tracking-wide">Início</span>
        </a>

        <!-- Catalog -->
        <a routerLink="/catalogo" routerLinkActive="text-brand-pink" 
           class="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 gap-1 active:scale-90 transition-transform group touch-manipulation">
          <app-icon name="grid" size="20px" class="group-[.text-brand-pink]:stroke-[2.5px] mb-0.5 transition-all"></app-icon>
          <span class="text-[9px] font-bold tracking-wide">Produtos</span>
        </a>

        <!-- Cart (Floating Center) with ID for Animation -->
        <div class="relative flex justify-center items-end h-full">
           <!-- The button floats ABOVE the nav container via negative margin -->
           <button (click)="openCart()" id="mobile-cart"
              class="absolute -top-6 w-14 h-14 bg-brand-dark dark:bg-brand-pink text-white rounded-full flex items-center justify-center shadow-floating active:scale-95 transition-all border-4 border-white dark:border-brand-darkbg group z-50 transition-transform duration-300">
             <app-icon name="shopping-bag" size="22px"></app-icon>
             
             @if (store.cartCount() > 0) {
               <span class="absolute -top-1 -right-1 bg-brand-pink dark:bg-white dark:text-brand-pink text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white dark:border-brand-pink animate-bounce-gentle">
                 {{ store.cartCount() }}
               </span>
             }
           </button>
           <span class="absolute bottom-1 text-[9px] font-bold text-gray-500 dark:text-gray-400 tracking-wide">Sacola</span>
        </div>

        <!-- Favorites -->
        <a (click)="goToFavorites()"
           class="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 gap-1 active:scale-90 transition-transform group touch-manipulation cursor-pointer"
           [class.text-brand-pink]="isFavoritesActive()">
          <div class="relative">
            <app-icon name="heart" size="20px" class="group-[.text-brand-pink]:stroke-[2.5px] group-[.text-brand-pink]:fill-current mb-0.5 transition-all"></app-icon>
            @if (store.favorites().length > 0) {
              <span class="absolute -top-1 -right-1 w-2 h-2 bg-brand-pink rounded-full border border-white dark:border-brand-darksurface"></span>
            }
          </div>
          <span class="text-[9px] font-bold tracking-wide">Favoritos</span>
        </a>

        <!-- Account -->
        <a routerLink="/minha-conta" routerLinkActive="text-brand-pink" 
           class="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 gap-1 active:scale-90 transition-transform group touch-manipulation">
          <app-icon name="user" size="20px" class="group-[.text-brand-pink]:stroke-[2.5px] mb-0.5 transition-all"></app-icon>
          <span class="text-[9px] font-bold tracking-wide">Conta</span>
        </a>

      </div>
    </nav>
  `,
  styles: [`
    .pb-safe {
      padding-bottom: env(safe-area-inset-bottom, 0px);
    }
    @keyframes bump {
       0% { transform: scale(1); }
       50% { transform: scale(1.2); }
       100% { transform: scale(1); }
    }
    .animate-bump {
       animation: bump 0.3s ease-out;
    }
  `]
})
export class BottomNavComponent {
  store = inject(StoreService);
  router = inject(Router);

  isFavoritesActive() {
    return this.router.url.includes('minha-conta') && !this.router.url.includes('login');
  }

  goToFavorites() {
    if (this.store.user()) {
      this.router.navigate(['/minha-conta']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  openCart() {
    if (this.store.user()) {
      this.store.toggleCart(true);
    } else {
      this.store.showToast('Faça login para ver sua sacola', 'info');
      this.router.navigate(['/login']);
    }
  }
}
