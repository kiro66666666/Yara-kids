
import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PwaService {
  deferredPrompt: any = null;
  showInstallPromotion = signal(false);
  isIOS = signal(false);
  isStandalone = signal(false);

  constructor() {
    this.checkPlatform();
    this.initPwa();
  }

  private checkPlatform() {
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    this.isIOS.set(/iphone|ipad|ipod/.test(userAgent));

    // Detect if already installed (Standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    this.isStandalone.set(isStandalone);
  }

  private initPwa() {
    // Listen for the 'beforeinstallprompt' event (Android/Chrome)
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault(); // Prevent the mini-infobar from appearing on mobile
      this.deferredPrompt = e;
      // Update UI notify the user they can install the PWA
      if (!this.isStandalone()) {
        this.showInstallPromotion.set(true);
      }
    });

    // Handle App Installed event
    window.addEventListener('appinstalled', () => {
      this.showInstallPromotion.set(false);
      this.deferredPrompt = null;
      console.log('PWA was installed');
    });
  }

  installPwa() {
    // Hide the promotion UI
    this.showInstallPromotion.set(false);
    
    if (this.deferredPrompt) {
      // Show the install prompt
      this.deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      this.deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        this.deferredPrompt = null;
      });
    }
  }

  dismissPrompt() {
    this.showInstallPromotion.set(false);
    // Logic to save preference/cookie could go here
  }
}
