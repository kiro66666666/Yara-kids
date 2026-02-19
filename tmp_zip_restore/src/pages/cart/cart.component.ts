
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from '../../services/store.service';
import { IconComponent } from '../../ui/icons';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, IconComponent, RouterLink, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-brand-darkbg py-12 transition-colors duration-300">
      <div class="container mx-auto px-6 max-w-6xl">
        <h1 class="text-3xl font-black text-gray-800 dark:text-white mb-8 flex items-center gap-3">
          <div class="w-2 h-8 bg-brand-pink rounded-full"></div> Seu Carrinho
        </h1>

        @if (store.cart().length > 0) {
          <!-- Added items-start to prevent stretching -->
          <div class="flex flex-col lg:flex-row gap-10 items-start">
            
            <!-- List Items Container -->
            <div class="flex-1 space-y-4 w-full">
               @for (item of store.cart(); track item.id + item.selectedSize) {
                 <div class="flex flex-col sm:flex-row gap-6 p-6 bg-white dark:bg-brand-darksurface rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all items-center">
                   <!-- Image -->
                   <div class="w-full sm:w-28 aspect-square rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-800 flex-shrink-0 border border-gray-100 dark:border-gray-700">
                     <img [src]="item.image" class="w-full h-full object-cover">
                   </div>
                   
                   <!-- Details -->
                   <div class="flex-1 w-full text-center sm:text-left">
                     <div class="flex flex-col sm:flex-row justify-between items-start mb-2">
                        <h3 class="font-bold text-gray-800 dark:text-white text-lg">{{ item.name }}</h3>
                        <div class="text-sm font-medium text-gray-400">Ref: {{ item.id }}</div>
                     </div>
                     
                     <p class="text-sm text-gray-500 dark:text-gray-400 mb-4 flex items-center justify-center sm:justify-start gap-2">
                       <span class="w-4 h-4 rounded-full border border-gray-200 dark:border-gray-600 shadow-sm" [style.background-color]="item.colors[0].hex"></span>
                       {{ item.selectedColor }} • Tamanho: <span class="font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 rounded">{{ item.selectedSize }}</span>
                     </p>
                     
                     <div class="flex items-center justify-between mt-4 sm:mt-auto">
                        <div class="font-black text-xl text-brand-dark dark:text-white">R$ {{ item.price.toFixed(2) }}</div>
                        
                        <!-- Actions -->
                        <div class="flex items-center gap-4">
                          <div class="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-1.5 border border-gray-200 dark:border-gray-700">
                            <button (click)="store.updateQuantity(item.id, item.selectedSize, item.selectedColor, -1)" 
                              class="w-8 h-8 flex items-center justify-center font-bold text-gray-400 dark:text-gray-500 hover:text-brand-pink hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all text-lg leading-none pb-1">-</button>
                            <span class="font-bold text-gray-800 dark:text-white w-4 text-center">{{ item.quantity }}</span>
                            <button (click)="store.updateQuantity(item.id, item.selectedSize, item.selectedColor, 1)" 
                              class="w-8 h-8 flex items-center justify-center font-bold text-gray-400 dark:text-gray-500 hover:text-brand-pink hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all text-lg leading-none pb-1">+</button>
                          </div>
                          
                          <button (click)="store.removeFromCart(item.id, item.selectedSize, item.selectedColor)" 
                            class="w-10 h-10 flex items-center justify-center text-gray-300 dark:text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all" title="Remover">
                            <app-icon name="trash" size="20px"></app-icon>
                          </button>
                        </div>
                     </div>
                   </div>
                 </div>
               }
            </div>

            <!-- Order Summary (Sticky) -->
            <div class="w-full lg:w-[380px] flex-shrink-0 sticky top-24">
              <div class="bg-white dark:bg-brand-darksurface p-8 rounded-3xl shadow-card border border-gray-100 dark:border-gray-700">
                 <h3 class="font-bold text-xl mb-6 text-gray-800 dark:text-white">Resumo do Pedido</h3>
                 
                 <div class="space-y-4 mb-6 text-sm">
                   <div class="flex justify-between text-gray-600 dark:text-gray-400">
                     <span>Subtotal ({{ store.cartCount() }} itens)</span>
                     <span class="font-medium">R$ {{ store.cartTotal().toFixed(2) }}</span>
                   </div>
                   
                   @if (store.discountAmount() > 0) {
                     <div class="flex justify-between text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-900/20 p-2 rounded-lg -mx-2">
                       <span>Cupom: {{ store.appliedCoupon()?.code }}</span>
                       <span>- R$ {{ store.discountAmount().toFixed(2) }}</span>
                     </div>
                   } @else {
                     <div class="flex justify-between text-gray-400">
                       <span>Desconto</span>
                       <span>R$ 0,00</span>
                     </div>
                   }

                   <!-- Gift Option (New) -->
                   <div class="flex justify-between items-center bg-brand-soft/30 dark:bg-brand-pink/10 p-3 rounded-xl border border-brand-pink/20">
                      <div class="flex items-center gap-2">
                        <input type="checkbox" id="gift" [checked]="store.isGiftWrapped()" (change)="store.toggleGiftWrap()" class="w-5 h-5 text-brand-pink rounded border-gray-300 focus:ring-brand-pink cursor-pointer">
                        <label for="gift" class="text-sm font-bold text-brand-dark dark:text-white cursor-pointer select-none">Embalar para Presente 🎁</label>
                      </div>
                      <span class="text-sm font-bold text-brand-pink">+ R$ 5,00</span>
                   </div>

                   <div class="flex justify-between text-gray-600 dark:text-gray-400">
                     <span>Frete</span>
                     <span class="text-xs text-gray-400 italic">Calcular no checkout</span>
                   </div>
                 </div>

                 <!-- Coupon Input Section (Enhanced Visibility) -->
                 <div class="mb-6 relative">
                    <!-- Toggle Coupon List (Always Visible with High Contrast) -->
                    <button (click)="showCoupons = !showCoupons" class="w-full mb-4 py-3 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 border-2"
                      [class.bg-brand-pink]="showCoupons"
                      [class.text-white]="showCoupons"
                      [class.border-brand-pink]="showCoupons"
                      [class.bg-white]="!showCoupons"
                      [class.dark:bg-transparent]="!showCoupons"
                      [class.text-brand-pink]="!showCoupons"
                      [class.border-brand-pink]="!showCoupons"
                      [class.hover:bg-pink-50]="!showCoupons">
                       <span class="text-lg">🎟️</span> {{ showCoupons ? 'Ocultar Cupons' : 'Ver Cupons Disponíveis' }}
                       <app-icon name="chevron-down" size="14px" [class.rotate-180]="showCoupons" class="transition-transform"></app-icon>
                    </button>

                    <!-- Available Coupons List -->
                    @if (showCoupons) {
                      <div class="bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-3 space-y-2 mb-4 animate-fade-in relative z-10 shadow-lg">
                         <div class="text-[10px] uppercase font-bold text-gray-400 mb-2 pl-1">Toque para aplicar</div>
                         @for(coupon of store.coupons(); track coupon.id) {
                           <div (click)="applySpecificCoupon(coupon.code)" class="bg-white dark:bg-brand-darksurface p-3 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:border-brand-pink hover:bg-pink-50 dark:hover:bg-brand-pink/20 transition-colors group flex justify-between items-center shadow-sm">
                              <div>
                                <span class="font-black text-brand-dark dark:text-white text-xs uppercase block">{{ coupon.code }}</span>
                                <span class="text-[10px] text-gray-500 dark:text-gray-400">{{ coupon.description }}</span>
                              </div>
                              <span class="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full font-bold whitespace-nowrap ml-2">
                                {{ coupon.type === 'percent' ? coupon.value + '%' : 'R$ ' + coupon.value }} OFF
                              </span>
                           </div>
                         }
                         @if(store.coupons().length === 0) {
                           <p class="text-xs text-gray-400 italic text-center py-2">Nenhum cupom ativo no momento.</p>
                         }
                      </div>
                    }

                    <!-- Input Field -->
                    <div class="flex flex-col gap-2">
                      <div class="flex gap-2">
                        <input type="text" [(ngModel)]="couponCode" placeholder="Digitar código manualmente" class="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-bold focus:border-brand-pink focus:outline-none uppercase text-gray-700 dark:text-white placeholder-gray-400">
                        <button (click)="applyCoupon()" class="bg-brand-dark dark:bg-white dark:text-brand-dark text-white px-4 rounded-xl font-bold text-xs hover:bg-black dark:hover:bg-gray-200 transition-colors">
                          Aplicar
                        </button>
                      </div>
                    </div>

                    <!-- Applied Status -->
                    @if (store.appliedCoupon()) {
                      <div class="flex items-center justify-between bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30 p-3 rounded-xl mt-3 animate-fade-in">
                        <div class="flex items-center gap-2 text-green-700 dark:text-green-400 font-bold text-sm">
                          <app-icon name="check" size="16px"></app-icon>
                          Cupom {{ store.appliedCoupon()?.code }}
                        </div>
                        <button (click)="store.removeCoupon()" class="text-xs text-red-400 hover:text-red-500 font-bold underline">Remover</button>
                      </div>
                    }
                 </div>

                 <!-- Divider -->
                 <div class="border-t border-dashed border-gray-200 dark:border-gray-700 my-6"></div>

                 <div class="flex justify-between items-end mb-8">
                   <span class="text-gray-500 dark:text-gray-400 font-medium">Total Estimado</span>
                   <span class="text-3xl font-black text-brand-dark dark:text-white">R$ {{ store.finalPrice().toFixed(2) }}</span>
                 </div>
                 
                 <div class="space-y-3">
                   <a routerLink="/checkout" class="block w-full py-4 bg-brand-pink text-white font-bold text-lg text-center rounded-2xl hover:bg-pink-600 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                     Finalizar Compra
                   </a>
                   <a routerLink="/catalogo" class="block w-full py-4 bg-white dark:bg-transparent border-2 border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-bold text-center rounded-2xl hover:border-gray-300 dark:hover:border-gray-500 hover:text-gray-700 dark:hover:text-white transition-all">
                     Continuar Comprando
                   </a>
                 </div>

                 <div class="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400 bg-gray-50 dark:bg-gray-800 py-2 rounded-lg">
                   <app-icon name="check" size="12px"></app-icon> Compra 100% Segura e Garantida
                 </div>
              </div>
            </div>
          </div>
        } @else {
          <!-- Empty State -->
          <div class="flex flex-col items-center justify-center py-24 px-4 text-center">
             <div class="w-48 h-48 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-8 text-gray-300 dark:text-gray-600 shadow-inner relative">
               <app-icon name="shopping-bag" size="80px"></app-icon>
               <div class="absolute top-10 right-10 w-4 h-4 bg-brand-pink rounded-full animate-ping"></div>
             </div>
             <h2 class="text-3xl font-black text-gray-800 dark:text-white mb-4">Seu carrinho está vazio</h2>
             <p class="text-gray-500 dark:text-gray-400 mb-10 max-w-md text-lg">Parece que você ainda não escolheu os looks da sua princesa. Que tal dar uma olhadinha nas novidades?</p>
             <a routerLink="/catalogo" class="px-10 py-4 bg-brand-dark dark:bg-white dark:text-brand-dark text-white font-bold rounded-full hover:bg-brand-pink dark:hover:bg-gray-200 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
               Ver Coleção Nova
             </a>
          </div>
        }
      </div>
    </div>
  `
})
export class CartComponent {
  store = inject(StoreService);
  couponCode = '';
  showCoupons = false;

  applyCoupon() {
    if (this.couponCode) {
      this.store.applyCoupon(this.couponCode);
      this.couponCode = '';
      this.showCoupons = false;
    }
  }

  applySpecificCoupon(code: string) {
    this.store.applyCoupon(code);
    this.showCoupons = false;
  }
}
