
import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from '../services/store.service';
import { IconComponent } from '../ui/icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <!-- Overlay -->
    @if (store.isCartOpen()) {
      <div class="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm transition-opacity" (click)="store.toggleCart(false)"></div>
    }

    <!-- Drawer Container -->
    <!-- FIXED: Hardcoded bg-slate-900 for dark mode to ensure perfect contrast -->
    <div class="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white dark:bg-slate-900 z-[70] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col border-l border-transparent dark:border-slate-800"
         [class.translate-x-0]="store.isCartOpen()"
         [class.translate-x-full]="!store.isCartOpen()">
      
      <!-- Header -->
      <div class="p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0 transition-colors">
        <div class="flex items-center gap-2">
          <app-icon name="shopping-bag" class="text-brand-pink"></app-icon>
          <h2 class="font-bold text-gray-800 dark:text-white text-lg">Meu Carrinho</h2>
          @if(store.cartCount() > 0) {
            <span class="bg-brand-soft dark:bg-brand-pink/20 text-brand-pink text-xs font-bold px-2 py-0.5 rounded-full">{{ store.cartCount() }}</span>
          }
        </div>
        <button (click)="store.toggleCart(false)" class="p-2 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-full text-gray-500 dark:text-gray-400 transition-colors">
          <app-icon name="x" size="20px"></app-icon>
        </button>
      </div>

      <!-- Free Shipping Bar -->
      @if (store.cart().length > 0) {
        <div class="px-5 pt-4 shrink-0 bg-white dark:bg-slate-900">
          @if (store.cartTotal() >= 150) {
            <div class="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold p-3 rounded-xl flex items-center gap-2 border border-green-100 dark:border-green-800 animate-pulse">
              <app-icon name="truck" size="16px"></app-icon> PARABÉNS! Você ganhou Frete Grátis! 🎉
            </div>
          } @else {
            <div class="bg-gray-50 dark:bg-slate-800 p-3 rounded-xl border border-gray-100 dark:border-slate-700 transition-colors">
              <div class="flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">
                <span>Faltam R$ {{ (150 - store.cartTotal()).toFixed(2) }} para frete grátis</span>
                <span>{{ (store.cartTotal() / 150 * 100).toFixed(0) }}%</span>
              </div>
              <div class="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-1.5 overflow-hidden">
                <div class="bg-brand-pink h-full rounded-full transition-all duration-500" [style.width.%]="(store.cartTotal() / 150 * 100)"></div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Items List -->
      <div class="flex-1 overflow-y-auto p-5 space-y-4 bg-white dark:bg-slate-900 custom-scrollbar">
        @if (store.cart().length === 0) {
          <div class="flex flex-col items-center justify-center h-full text-center opacity-60">
            <app-icon name="shopping-bag" size="64px" class="mb-4 text-gray-300 dark:text-gray-600"></app-icon>
            <p class="font-bold text-gray-800 dark:text-gray-300">Seu carrinho está vazio</p>
            <p class="text-sm text-gray-500 dark:text-gray-500 mt-1">Adicione peças lindas para sua princesa!</p>
            <button (click)="store.toggleCart(false)" class="mt-6 px-6 py-2 bg-brand-pink text-white rounded-full font-bold text-sm hover:bg-pink-600 transition-colors shadow-lg">
              Ver Produtos
            </button>
          </div>
        } @else {
          @for (item of store.cart(); track item.id + item.selectedSize + item.selectedColor) {
            <!-- Item Card: Enforced dark background -->
            <div class="flex gap-3 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 p-3 rounded-2xl shadow-sm hover:shadow-md transition-all group relative">
              <div class="w-20 aspect-square rounded-xl overflow-hidden bg-gray-50 dark:bg-slate-700 flex-shrink-0 border border-gray-100 dark:border-slate-600">
                <img [src]="item.image" class="w-full h-full object-cover">
              </div>
              <div class="flex-1 min-w-0 flex flex-col justify-center">
                <div class="flex justify-between items-start">
                  <h3 class="font-bold text-gray-800 dark:text-white text-sm line-clamp-1 pr-6">{{ item.name }}</h3>
                  <button (click)="store.removeFromCart(item.id, item.selectedSize, item.selectedColor)" class="text-gray-300 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 absolute top-2 right-2 p-1 transition-colors">
                    <app-icon name="trash" size="16px"></app-icon>
                  </button>
                </div>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ item.selectedSize }} • {{ item.selectedColor }}</p>
                <div class="flex justify-between items-center mt-2">
                  <div class="font-black text-brand-dark dark:text-white text-sm">R$ {{ (item.price * item.quantity).toFixed(2) }}</div>
                  
                  <div class="flex items-center gap-2 bg-gray-50 dark:bg-slate-900 rounded-lg px-2 py-1 border border-gray-200 dark:border-slate-700 transition-colors">
                    <button (click)="store.updateQuantity(item.id, item.selectedSize, item.selectedColor, -1)" class="w-5 h-5 flex items-center justify-center font-bold text-gray-400 dark:text-gray-400 hover:text-brand-pink disabled:opacity-30" [disabled]="item.quantity <= 1">-</button>
                    <span class="text-xs font-bold w-4 text-center text-gray-800 dark:text-white">{{ item.quantity }}</span>
                    <button (click)="store.updateQuantity(item.id, item.selectedSize, item.selectedColor, 1)" class="w-5 h-5 flex items-center justify-center font-bold text-gray-400 dark:text-gray-400 hover:text-brand-pink" [disabled]="item.quantity >= item.stock">+</button>
                  </div>
                </div>
              </div>
            </div>
          }
        }
      </div>

      <!-- Footer -->
      @if (store.cart().length > 0) {
        <div class="p-5 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 safe-area-pb shrink-0 transition-colors">
          <div class="flex justify-between items-center mb-4">
            <span class="text-gray-500 dark:text-gray-400 font-medium">Subtotal</span>
            <span class="font-black text-xl text-brand-dark dark:text-white">R$ {{ store.cartTotal().toFixed(2) }}</span>
          </div>
          
          <!-- Coupon Link Shortcut (Styled as prominent secondary button) -->
          <button (click)="goToCartPage()" class="w-full mb-3 py-3 border-2 border-brand-pink/50 dark:border-brand-pink/50 text-brand-pink dark:text-brand-pink font-bold rounded-xl hover:bg-brand-pink hover:text-white hover:border-brand-pink transition-all text-sm flex items-center justify-center gap-2 group">
             <span class="group-hover:animate-bounce-gentle">🎟️</span> Ver Cupons Disponíveis
          </button>

          <button (click)="goToCheckout()" class="w-full bg-brand-pink text-white font-bold py-4 rounded-xl shadow-lg hover:bg-pink-600 transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
            Checkout Rápido <app-icon name="chevron-right" size="16px"></app-icon>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .safe-area-pb {
      padding-bottom: env(safe-area-inset-bottom, 20px);
    }
  `]
})
export class CartDrawerComponent {
  store = inject(StoreService);
  router = inject(Router);

  goToCheckout() {
    this.store.toggleCart(false);
    this.router.navigate(['/checkout']);
  }

  goToCartPage() {
    this.store.toggleCart(false);
    this.router.navigate(['/carrinho']);
  }
}
