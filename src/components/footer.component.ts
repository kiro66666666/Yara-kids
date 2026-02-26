
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../ui/icons';
import { StoreService } from '../services/store.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, IconComponent, FormsModule, CommonModule],
  template: `
    <footer class="relative font-sans pt-12">
      
      <!-- Newsletter Banner (Positioned Relative to sit on top of footer boundary) -->
      <div class="relative z-30 -mb-24 px-4">
        <div class="container mx-auto max-w-6xl">
          <!-- Gradient updated to match screenshot (Pink/Purple) -->
          <!-- Layout: Stacked on Mobile/Tablet (flex-col), Side-by-side ONLY on Desktop LG+ (lg:flex-row) -->
          <div class="bg-gradient-to-r from-[#FF69B4] to-[#9B7EDE] rounded-[2.5rem] p-8 md:p-12 shadow-floating relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 ring-8 ring-white dark:ring-brand-darkbg transition-all duration-300">
            
            <!-- Decorative Elements -->
            <div class="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <div class="absolute -top-10 -right-10 w-48 h-48 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
            
            <div class="relative z-10 text-white text-center lg:text-left max-w-xl">
              <h2 class="text-2xl md:text-4xl font-black mb-3 flex flex-col lg:flex-row items-center gap-3 drop-shadow-md justify-center lg:justify-start">
                <span class="text-4xl md:text-5xl">🎁</span> 
                <span>Ganhe <span class="text-brand-dark bg-brand-yellow px-3 py-1 rounded-xl transform rotate-2 inline-block shadow-sm">10% OFF</span></span>
              </h2>
              <p class="text-white/90 font-medium text-sm md:text-lg leading-relaxed">
                Cadastre-se na newsletter e receba ofertas secretas e mimos da YARA Kids.
              </p>
            </div>

            <div class="relative z-10 w-full lg:w-auto flex-1 max-w-lg">
              <!-- Form: Stacked on Small Mobile, Side-by-side on larger screens -->
              <div class="flex flex-col sm:flex-row gap-3 bg-white p-2 rounded-2xl shadow-lg w-full transition-all border border-gray-200">
                <!-- Input: Full width, min-width 0 to prevent flex overflow -->
                <input type="email" [(ngModel)]="email" placeholder="Digite seu melhor e-mail" 
                  class="flex-1 w-full px-6 py-4 rounded-xl text-gray-800 font-bold focus:outline-none bg-transparent placeholder-gray-500 border-none h-14 text-sm md:text-base min-w-0">
                
                <!-- Button: Full width on mobile, Auto on larger screens -->
                <button (click)="subscribe()" [disabled]="isSubscribing || isSubscribed" class="w-full sm:w-auto bg-[#FFD700] text-brand-dark font-black px-8 py-4 rounded-xl hover:bg-yellow-300 transition-all shadow-md hover:shadow-lg whitespace-nowrap text-sm md:text-base h-14 flex items-center justify-center uppercase tracking-wide shrink-0 disabled:opacity-50 disabled:cursor-not-allowed">
                  {{ isSubscribing ? 'Enviando...' : (isSubscribed ? 'Cadastrado!' : 'QUERO!') }}
                </button>
              </div>
              <p class="text-white/80 text-[10px] md:text-xs mt-3 text-center lg:text-left pl-2 font-medium flex items-center justify-center lg:justify-start gap-1">
                <app-icon name="check" size="12px"></app-icon> Prometemos não enviar spam.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Footer Content -->
      <div class="bg-white dark:bg-brand-darksurface border-t border-gray-100 dark:border-gray-800 pt-32 pb-24 md:pb-12 mt-4 relative z-20 transition-colors duration-300">
        <div class="container mx-auto px-6">
          
          <div class="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <!-- Brand -->
            <div class="space-y-5">
              <div class="flex items-center">
                @if(store.institutional().logoUrl) {
                  <img [src]="store.institutional().logoUrl" alt="YARA Kids" class="h-16 w-auto object-contain">
                } @else {
                  <div class="text-3xl font-black text-brand-pink flex items-center gap-3">
                    <div class="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg transform -rotate-3 border border-brand-soft">
                      <app-icon name="rainbow" size="36px"></app-icon>
                    </div>
                    <span>YARA<span class="text-brand-lilac">Kids</span></span>
                  </div>
                }
              </div>
              <p class="text-gray-500 dark:text-gray-400 text-sm leading-relaxed font-medium">
                A loja favorita das mamães! Moda infantil com conforto, qualidade e muito estilo para príncipes e princesas.
              </p>
              <div class="flex gap-3">
                <a href="https://instagram.com/yarakids_moda_infantil" target="_blank" class="w-10 h-10 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-md" aria-label="Instagram">
                  <app-icon name="instagram" size="18px"></app-icon>
                </a>
                <a [href]="whatsappLink" target="_blank" class="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-md" aria-label="WhatsApp">
                  <app-icon name="whatsapp" size="18px"></app-icon>
                </a>
              </div>
            </div>
            
            <!-- Links -->
            <div>
              <h4 class="font-bold text-brand-dark dark:text-white mb-5 text-sm uppercase tracking-wider">Institucional</h4>
              <ul class="space-y-3 text-sm text-gray-500 dark:text-gray-400 font-medium">
                <li><a routerLink="/sobre" class="hover:text-brand-pink transition-colors flex items-center gap-2">Quem Somos</a></li>
                <li><a routerLink="/privacidade" class="hover:text-brand-pink transition-colors flex items-center gap-2">Política de Privacidade</a></li>
                <li><a routerLink="/termos" class="hover:text-brand-pink transition-colors flex items-center gap-2">Termos de Uso</a></li>
                <li><a routerLink="/catalogo" class="hover:text-brand-pink transition-colors flex items-center gap-2">Nossos Produtos</a></li>
              </ul>
            </div>

            <div>
              <h4 class="font-bold text-brand-dark dark:text-white mb-5 text-sm uppercase tracking-wider">Ajuda</h4>
              <ul class="space-y-3 text-sm text-gray-500 dark:text-gray-400 font-medium">
                <li><a [href]="whatsappLink" target="_blank" class="hover:text-brand-pink transition-colors">Central de Atendimento</a></li>
                <li><a routerLink="/feedback" class="hover:text-brand-pink transition-colors">Enviar Feedback</a></li>
                <li><a routerLink="/politica-de-trocas" class="hover:text-brand-pink transition-colors">Política de Trocas</a></li>
                <li><a routerLink="/minha-conta" class="hover:text-brand-pink transition-colors">Acompanhar Pedido</a></li>
                <li><a routerLink="/faq" class="hover:text-brand-pink transition-colors">Frete e Entregas</a></li>
              </ul>
            </div>

            <!-- Contact/Payment -->
            <div>
               <div class="bg-brand-soft dark:bg-pink-900/10 p-5 rounded-2xl border border-brand-pink/10 dark:border-pink-900/30 mb-6 group hover:border-brand-pink/30 transition-colors">
                 <p class="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Dúvidas?</p>
                 <a [href]="whatsappLink" target="_blank" class="text-lg font-black text-brand-dark dark:text-white hover:text-brand-pink transition-colors flex items-center gap-2">
                   <app-icon name="whatsapp" size="18px" class="text-green-500"></app-icon> {{ whatsappDisplay }}
                 </a>
                 <p class="text-[10px] text-gray-400 mt-2 font-medium">Seg a Sex: 09h às 18h</p>
               </div>
               
               <div class="flex gap-2 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all">
                  <div class="h-8 w-12 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center text-[8px] font-bold text-gray-400 dark:text-gray-300 border border-gray-200 dark:border-gray-600">VISA</div>
                  <div class="h-8 w-12 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center text-[8px] font-bold text-gray-400 dark:text-gray-300 border border-gray-200 dark:border-gray-600">MASTER</div>
                  <div class="h-8 w-12 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center text-[8px] font-bold text-gray-400 dark:text-gray-300 border border-gray-200 dark:border-gray-600">PIX</div>
                  <div class="h-8 w-12 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center text-[8px] font-bold text-gray-400 dark:text-gray-300 border border-gray-200 dark:border-gray-600">ELO</div>
               </div>
            </div>
          </div>
          
          <div class="border-t border-gray-100 dark:border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-wide">
            <p>© 2026 YARA Kids. Todos os direitos reservados.</p>
            <div class="flex gap-6">
               <span>Redenção/PA — Brasil</span>
               <span>CNPJ: 00.000.000/0001-00</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {
  store = inject(StoreService);
  email = '';
  isSubscribed = false;
  isSubscribing = false;

  get whatsappDisplay(): string {
    return this.store.institutional().whatsapp?.trim() || 'WhatsApp';
  }

  get whatsappLink(): string {
    return this.buildWhatsappLink(this.whatsappDisplay);
  }

  private buildWhatsappLink(rawPhone: string): string {
    const digits = String(rawPhone || '').replace(/\D/g, '');
    if (!digits) return '#';
    const normalized = digits.startsWith('55') ? digits : `55${digits}`;
    return `https://wa.me/${normalized}`;
  }

  async subscribe() {
    if (!this.store.termsAccepted()) {
      this.store.showToast('Aceite os termos e privacidade para ativar a newsletter.', 'error');
      return;
    }

    if (!this.email?.trim()) {
      this.store.showToast('Digite um e-mail válido', 'error');
      return;
    }

    this.isSubscribing = true;
    const result = await this.store.subscribeNewsletter(this.email);
    this.isSubscribing = false;

    if (result.ok) {
      this.isSubscribed = true;
      this.email = '';
      const toastType = (result.status === 'already_exists' || result.status === 'queued') ? 'info' : 'success';
      this.store.showToast(result.message, toastType);
      return;
    }

    if (result.status === 'already_exists') {
      this.isSubscribed = true;
      this.email = '';
      this.store.showToast(result.message, 'info');
      return;
    }

    if (result.status === 'invalid_email') {
      this.store.showToast('Digite um e-mail válido', 'error');
      return;
    }

    if (result.status === 'mail_failed') {
      this.isSubscribed = true;
      this.email = '';
      this.store.showToast(result.message, 'info');
      return;
    }

    this.store.showToast(result.message, 'error');
  }
}


