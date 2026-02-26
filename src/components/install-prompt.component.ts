import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PwaService } from '../services/pwa.service';
import { StoreService } from '../services/store.service';
import { IconComponent } from '../ui/icons';

@Component({
  selector: 'app-install-prompt',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    @if (shouldShow()) {
      <div class="fixed bottom-[70px] lg:bottom-4 left-0 right-0 z-[80] p-4 animate-slide-up pb-safe flex justify-center pointer-events-none">
        <div class="bg-white dark:bg-brand-darksurface rounded-3xl shadow-floating border-2 border-brand-pink/20 dark:border-gray-700 p-5 flex flex-col gap-4 relative overflow-hidden w-full max-w-sm pointer-events-auto">
          <button (click)="pwa.dismissPrompt()" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" aria-label="Fechar">
            <app-icon name="x" size="20px"></app-icon>
          </button>

          <div class="flex items-center gap-4">
            <div class="w-14 h-14 bg-brand-pink text-white rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3">
              <app-icon name="rainbow" size="32px"></app-icon>
            </div>
            <div class="flex-1">
              <h3 class="font-bold text-brand-dark dark:text-white text-lg leading-tight">Instale o App YARA Kids</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Acesso rapido e ofertas exclusivas.</p>
            </div>
          </div>

          <button (click)="startInstall()" class="w-full py-3.5 bg-brand-dark dark:bg-brand-pink text-white font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
            Instalar Agora <app-icon name="check" size="18px"></app-icon>
          </button>
          <button (click)="showChooser.set(true)" class="w-full py-2.5 text-xs font-bold rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Escolher dispositivo (PC / Android / iOS)
          </button>
        </div>
      </div>
    }

    @if (showChooser()) {
      <div class="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="w-full max-w-xl bg-white dark:bg-brand-darksurface rounded-3xl border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden">
          <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h3 class="font-black text-lg text-gray-800 dark:text-white">Instalar YARA Kids</h3>
            <button (click)="showChooser.set(false)" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-300">
              <app-icon name="x" size="18px"></app-icon>
            </button>
          </div>
          <div class="p-5 grid grid-cols-1 md:grid-cols-3 gap-3">
            <button (click)="installByTarget('desktop')" class="p-4 rounded-2xl border border-gray-200 dark:border-gray-700 text-left hover:border-brand-pink/40 hover:bg-brand-soft/40 dark:hover:bg-brand-lilac/10 transition-colors">
              <p class="font-bold text-gray-800 dark:text-white mb-1">PC</p>
              <p class="text-xs text-gray-500 dark:text-gray-300">Instala app no navegador ou baixa atalho.</p>
            </button>
            <button (click)="installByTarget('android')" class="p-4 rounded-2xl border border-gray-200 dark:border-gray-700 text-left hover:border-brand-pink/40 hover:bg-brand-soft/40 dark:hover:bg-brand-lilac/10 transition-colors">
              <p class="font-bold text-gray-800 dark:text-white mb-1">Android</p>
              <p class="text-xs text-gray-500 dark:text-gray-300">Instalar app / adicionar a tela inicial.</p>
            </button>
            <button (click)="installByTarget('ios')" class="p-4 rounded-2xl border border-gray-200 dark:border-gray-700 text-left hover:border-brand-pink/40 hover:bg-brand-soft/40 dark:hover:bg-brand-lilac/10 transition-colors">
              <p class="font-bold text-gray-800 dark:text-white mb-1">iOS</p>
              <p class="text-xs text-gray-500 dark:text-gray-300">Compartilhar e adicionar a tela inicial.</p>
            </button>
          </div>
          @if (installHint()) {
            <div class="px-5 pb-5">
              <p class="text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3">
                {{ installHint() }}
              </p>
            </div>
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
  store = inject(StoreService);
  canShow = signal(false);
  showChooser = signal(false);
  installHint = signal('');

  shouldShow = computed(() => {
    if (this.pwa.isIOS() && !this.pwa.isStandalone()) {
      return this.canShow();
    }
    return this.pwa.showInstallPromotion() && this.canShow();
  });

  ngOnInit() {
    setTimeout(() => {
      this.canShow.set(true);
    }, 5000);
  }

  async startInstall() {
    const result = await this.pwa.attemptInstall();
    if (result.status === 'installed') {
      this.store.showToast(result.message, 'success');
      return;
    }
    if (result.status === 'dismissed') {
      this.store.showToast(result.message, 'info');
      return;
    }

    this.store.showToast(result.message, 'info');
    this.installHint.set(this.pwa.getManualInstallHint(this.pwa.getRecommendedTarget()));
    this.showChooser.set(true);
  }

  async installByTarget(target: 'desktop' | 'android' | 'ios') {
    if (target === 'ios') {
      this.installHint.set(this.pwa.getManualInstallHint('ios'));
      this.store.showToast(this.pwa.getManualInstallHint('ios'), 'info');
      return;
    }

    const result = await this.pwa.attemptInstall();
    if (result.status === 'installed') {
      this.store.showToast(result.message, 'success');
      this.showChooser.set(false);
      this.installHint.set('');
      return;
    }

    if (result.status === 'dismissed') {
      this.store.showToast(result.message, 'info');
      return;
    }

    if (target === 'desktop') {
      const shortcut = this.pwa.downloadDesktopShortcut();
      if (shortcut) {
        this.store.showToast('Atalho do site baixado para o PC.', 'success');
      } else {
        this.store.showToast(this.pwa.getManualInstallHint('desktop'), 'info');
      }
      this.installHint.set(this.pwa.getManualInstallHint('desktop'));
      return;
    }

    this.installHint.set(this.pwa.getManualInstallHint('android'));
    this.store.showToast(this.pwa.getManualInstallHint('android'), 'info');
  }
}
