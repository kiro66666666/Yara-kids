
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from '../services/store.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-welcome-popup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (store.showWelcomePopup()) {
      <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" style="overscroll-behavior: contain;">
        <div class="bg-white rounded-3xl overflow-hidden w-full max-w-sm shadow-2xl relative animate-slide-up flex flex-col max-h-[85vh]">
          
          <!-- Close Button -->
          <button (click)="store.closeWelcomePopup()" class="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors cursor-pointer backdrop-blur-md">
            ✕
          </button>

          <!-- Header (Fixed Height) -->
          <div class="bg-gradient-to-br from-brand-pink via-purple-500 to-brand-lilac p-6 md:p-8 text-center text-white relative overflow-hidden shrink-0">
            <div class="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <div class="text-4xl md:text-5xl mb-2 animate-bounce-gentle">🎁</div>
            <h2 class="text-xl md:text-2xl font-black mb-1 leading-tight">Bem-vinda à<br>YARA Kids!</h2>
            <p class="text-pink-100 text-xs md:text-sm font-medium">Sua loja favorita de moda infantil</p>
          </div>

          <!-- Content (Scrollable) -->
          <div class="p-6 text-center overflow-y-auto overscroll-contain">
            <p class="text-gray-500 text-sm mb-4">Ganhe <strong class="text-brand-pink">10% OFF</strong> na sua primeira compra agora mesmo!</p>
            
            <div class="bg-brand-soft border-2 border-dashed border-brand-pink/30 rounded-xl p-4 mb-6 relative group cursor-pointer" (click)="copyCoupon()">
              <p class="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Seu Cupom Exclusivo</p>
              <div class="text-xl md:text-2xl font-black text-brand-dark font-mono tracking-widest select-all">{{ couponCode }}</div>
              
              <!-- Tooltip -->
              <div class="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-3 rounded shadow-lg opacity-0 transition-opacity" [class.opacity-100]="copied()">
                Copiado!
              </div>
            </div>

            <!-- Email Capture (Mock) -->
            <div class="space-y-3">
              <input type="email" placeholder="Seu melhor e-mail" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20 outline-none transition-all">
              <button (click)="store.closeWelcomePopup()" class="w-full py-3 bg-brand-pink text-white font-bold rounded-xl shadow-lg hover:bg-pink-600 hover:-translate-y-0.5 transition-all">
                PEGAR MEU DESCONTO
              </button>
            </div>
            
            <button (click)="store.closeWelcomePopup()" class="mt-4 text-xs font-bold text-gray-400 hover:text-gray-600 underline">
              Não, obrigado. Quero pagar o preço total.
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class WelcomePopupComponent {
  store = inject(StoreService);
  couponCode = 'BEMVINDA10';
  copied = signal(false);

  copyCoupon() {
    navigator.clipboard.writeText(this.couponCode);
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }
}

