
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from '../services/store.service';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../ui/icons';

@Component({
  selector: 'app-consent-modal',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  template: `
    @if (!store.termsAccepted()) {
      
      @if (isMinimized()) {
        <!-- Minimized State: Floating Shield Icon -->
        <button (click)="maximize()" 
          class="fixed bottom-24 left-4 lg:bottom-8 lg:left-8 z-[90] bg-white dark:bg-brand-darksurface w-12 h-12 rounded-full shadow-floating border-2 border-brand-pink/20 flex items-center justify-center hover:scale-110 transition-transform group animate-fade-in"
          title="Termos e Privacidade">
          <span class="text-xl">🛡️</span>
          <!-- Tooltip on Hover -->
          <span class="absolute left-full ml-3 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Privacidade & Termos
          </span>
          <!-- Pulse to remind user -->
          <span class="absolute -inset-1 rounded-full bg-brand-pink opacity-20 animate-ping pointer-events-none"></span>
        </button>
      } @else {
        <!-- Full Modal State -->
        <div class="fixed inset-0 z-[110] flex items-end justify-center pointer-events-none p-4">
          <!-- Backdrop: Click to minimize (Non-blocking visual, allows interaction with backdrop to close) -->
          <div class="fixed inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-auto transition-opacity" (click)="minimize()"></div>

          <div class="bg-white dark:bg-brand-darksurface w-full max-w-4xl p-6 md:p-8 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-gray-700 pointer-events-auto relative animate-slide-up mb-4 md:mb-8 flex flex-col md:flex-row items-center gap-6">
             
             <!-- Close/Minimize Icon Button -->
             <button (click)="minimize()" class="absolute top-4 right-4 text-gray-400 hover:text-brand-pink p-2 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
               <app-icon name="chevron-down" size="20px"></app-icon>
             </button>

             <div class="flex-1 text-center md:text-left">
               <h3 class="text-xl font-black text-brand-dark dark:text-white mb-2">{{ store.institutional().consentTitle || 'Sua Privacidade é Importante 🔒' }}</h3>
               <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                 {{ store.institutional().consentText || 'Para continuar comprando, precisamos que você aceite nossos termos.' }}
               </p>
               
               <!-- Terms Links: Clicking them minimizes modal so user can read page -->
               <p class="text-xs text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700 inline-block md:block">
                 Leia antes de aceitar: 
                 <a (click)="minimize()" routerLink="/privacidade" class="text-brand-pink font-bold hover:underline cursor-pointer">Política de Privacidade</a>, 
                 <a (click)="minimize()" routerLink="/termos" class="text-brand-pink font-bold hover:underline cursor-pointer">Termos de Uso</a> e 
                 <a (click)="minimize()" routerLink="/politica-de-trocas" class="text-brand-pink font-bold hover:underline cursor-pointer">Regras de Troca</a>.
               </p>
             </div>

             <div class="flex flex-col gap-3 min-w-[200px] w-full md:w-auto">
               <button (click)="store.acceptTerms()" class="w-full py-3.5 bg-brand-pink text-white font-bold rounded-xl shadow-lg hover:bg-pink-600 transition-transform active:scale-95 text-sm uppercase tracking-wide">
                 Concordar e Continuar
               </button>
               <button (click)="minimize()" class="text-xs font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                 Continuar sem aceitar (Minimizar)
               </button>
             </div>

          </div>
        </div>
      }
    }
  `
})
export class ConsentModalComponent {
  store = inject(StoreService);
  isMinimized = signal(false);

  minimize() {
    this.isMinimized.set(true);
  }

  maximize() {
    this.isMinimized.set(false);
  }
}
