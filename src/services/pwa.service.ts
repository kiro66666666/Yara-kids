import { Injectable, signal } from '@angular/core';

export type InstallTarget = 'desktop' | 'android' | 'ios';

@Injectable({
  providedIn: 'root'
})
export class PwaService {
  deferredPrompt: any = null;
  showInstallPromotion = signal(false);
  isIOS = signal(false);
  isAndroid = signal(false);
  isStandalone = signal(false);
  installSource = signal<'prompt' | 'manual'>('prompt');

  constructor() {
    this.checkPlatform();
    this.initPwa();
  }

  private checkPlatform() {
    const userAgent = window.navigator.userAgent.toLowerCase();
    this.isIOS.set(/iphone|ipad|ipod/.test(userAgent));
    this.isAndroid.set(/android/.test(userAgent));

    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone;
    this.isStandalone.set(standalone);
  }

  private initPwa() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.installSource.set('prompt');
      if (!this.isStandalone()) {
        this.showInstallPromotion.set(true);
      }
    });

    window.addEventListener('appinstalled', () => {
      this.showInstallPromotion.set(false);
      this.deferredPrompt = null;
      console.log('PWA was installed');
    });
  }

  async installPwa(): Promise<boolean> {
    this.showInstallPromotion.set(false);

    if (this.deferredPrompt) {
      await this.deferredPrompt.prompt();
      const choiceResult = await this.deferredPrompt.userChoice;
      this.deferredPrompt = null;
      return choiceResult.outcome === 'accepted';
    }

    this.installSource.set('manual');
    return false;
  }

  getRecommendedTarget(): InstallTarget {
    if (this.isIOS()) return 'ios';
    if (this.isAndroid()) return 'android';
    return 'desktop';
  }

  getManualInstallHint(target: InstallTarget = this.getRecommendedTarget()) {
    if (target === 'ios') {
      return 'No iPhone/iPad: Compartilhar -> Adicionar a Tela de Inicio.';
    }
    if (target === 'android') {
      return 'No Android: menu do navegador -> Instalar aplicativo / Adicionar a tela inicial.';
    }
    return 'No PC: menu do navegador -> Instalar aplicativo / Criar atalho.';
  }

  downloadDesktopShortcut() {
    try {
      const url = `${window.location.origin}/#/`;
      const content = `[InternetShortcut]\nURL=${url}\n`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const href = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = href;
      link.download = 'YARA Kids.url';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(href);
      return true;
    } catch {
      return false;
    }
  }

  dismissPrompt() {
    this.showInstallPromotion.set(false);
  }
}
