
import { Component, OnInit, signal, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header.component';
import { FooterComponent } from './components/footer.component';
import { ToastComponent } from './components/toast.component';
import { CartDrawerComponent } from './components/cart-drawer.component';
import { BottomNavComponent } from './components/bottom-nav.component';
import { WelcomePopupComponent } from './components/welcome-popup.component';
import { AiAssistantComponent } from './components/ai-assistant.component';
import { ConsentModalComponent } from './components/consent-modal.component';
import { InstallPromptComponent } from './components/install-prompt.component';
import { CommonModule } from '@angular/common'; // Added CommonModule for the banner

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    HeaderComponent, 
    FooterComponent, 
    ToastComponent, 
    CartDrawerComponent, 
    BottomNavComponent,
    WelcomePopupComponent,
    AiAssistantComponent,
    ConsentModalComponent,
    InstallPromptComponent,
    CommonModule
  ],
  template: `
    <!-- Offline Banner -->
    @if (!isOnline()) {
      <div class="bg-red-500 text-white text-center py-2 text-xs font-bold fixed top-0 left-0 right-0 z-[100] animate-slide-up">
        Voce esta offline. Verifique sua conexao.
      </div>
    }

    <!-- CRITICAL FIX: Added bg-white and dark:bg-brand-darkbg to wrapper to prevent white bleed -->
    <div class="flex flex-col min-h-[100dvh] font-sans text-gray-900 bg-white dark:bg-brand-darkbg dark:text-gray-100 pb-20 lg:pb-0 relative w-full max-w-full overflow-x-hidden transition-colors duration-300"
         [class.pt-8]="!isOnline()"> <!-- Push content down if offline banner shows -->
      
      <app-toast></app-toast>
      <app-welcome-popup></app-welcome-popup>
      <app-consent-modal></app-consent-modal>
      
      <app-header></app-header>
      
      <main class="flex-grow">
        <router-outlet></router-outlet>
      </main>
      
      <app-footer></app-footer>
      
      <!-- Overlays -->
      <app-cart-drawer></app-cart-drawer>
      <app-bottom-nav></app-bottom-nav>
      <app-ai-assistant></app-ai-assistant>
      <app-install-prompt></app-install-prompt>
    </div>
  `
})
export class AppComponent implements OnInit, OnDestroy {
  isOnline = signal(navigator.onLine);

  ngOnInit() {
    window.addEventListener('online', this.updateOnlineStatus.bind(this));
    window.addEventListener('offline', this.updateOnlineStatus.bind(this));
  }

  ngOnDestroy() {
    window.removeEventListener('online', this.updateOnlineStatus.bind(this));
    window.removeEventListener('offline', this.updateOnlineStatus.bind(this));
  }

  updateOnlineStatus() {
    this.isOnline.set(navigator.onLine);
  }
}
