
import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PwaService } from '../services/pwa.service';
import { IconComponent } from '../ui/icons';

@Component({
  selector: 'app-install-prompt',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    @if (shouldShow()) {
      <!-- Fixed Position Adjusted: bottom-[70px] on mobile to clear BottomNav, bottom-4 on desktop -->
      <div class="fixed bottom-[70px] lg:bottom-4 left-0 right-0 z-[80] p-4 animate-slide-up pb-safe flex justify-center pointer-events-none">
        <div class="bg-white dark:bg-brand-darksurface rounded-3xl shadow-floating border-2 border-brand-pink/20 dark:border-gray-700 p-5 flex flex-col gap-4 relative overflow-hidden w-full max-w-sm pointer-events-auto">
          
          <!-- Close -->
          <button (click)="pwa.dismissPrompt()" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" aria-label="Fechar">
            <app-icon name="x" size="20px"></app-icon>
          </button>

          <div class="flex items-center gap-4">
            <div class="w-14 h-14 bg-brand-pink text-white rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3">
              <app-icon name="rainbow" size="32px"></app-icon>
            </div>
            <div class="flex-1">
              <h3 class="font-bold text-brand-dark dark:text-white text-lg leading-tight">Instale o App YARA Kids</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Acesso rápido e ofertas exclusivas.</p>
            </div>
          </div>

          @if (pwa.isIOS()) {
            <!-- iOS Instructions -->
            <div class="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl text-sm text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700">
              <p class="flex items-center gap-2 mb-2 text-xs">1. Toque em <strong>Compartilhar</strong> <span class="bg-gray-200 dark:bg-gray-700 p-1 rounded"><app-icon name="share" size="12px"></app-icon></span></p>
              <p class="flex items-center gap-2 text-xs">2. Selecione <strong>"Adicionar à Tela de Início"</strong>.</p>
            </div>
          } @else {
            <!-- Android/Chrome Button -->
            <button (click)="pwa.installPwa()" class="w-full py-3.5 bg-brand-dark dark:bg-brand-pink text-white font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
              Instalar Agora <app-icon name="check" size="18px"></app-icon>
            </button>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .pb-safe {
      padding-bottom: max(0rem, env(safe-area-inset-bottom));
    }
  `]
})
export class InstallPromptComponent implements OnInit {
  pwa = inject(PwaService);
  
  // Logic to delay showing the prompt so it doesn't annoy the user immediately
  canShow = signal(false);

  shouldShow = computed(() => {
    // Show if service says so AND we are ready to show (timer passed)
    // For iOS, specifically check if not standalone
    if (this.pwa.isIOS() && !this.pwa.isStandalone()) {
        return this.canShow();
    }
    return this.pwa.showInstallPromotion() && this.canShow();
  });

  ngOnInit() {
    // Wait 5 seconds before showing prompt
    setTimeout(() => {
      this.canShow.set(true);
    }, 5000);
  }
}
