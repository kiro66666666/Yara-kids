import { Component, inject, OnInit, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { StoreService } from '../../services/store.service';
import { IconComponent } from '../../ui/icons';
import { Title } from '@angular/platform-browser';

type AuthMode = 'login' | 'register' | 'forgot-password';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IconComponent],
  template: `
    <div class="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      <div class="absolute inset-0 z-0">
        @if (authBanner(); as banner) {
          @if (banner.mediaType === 'video' && banner.videoUrl) {
            <video
              [src]="banner.videoUrl"
              class="w-full h-full object-cover"
              autoplay
              loop
              muted
              playsinline
            ></video>
          } @else {
            <img
              [src]="banner.image || fallbackAuthBackground"
              class="w-full h-full object-cover animate-pulse-slow scale-105"
              style="animation: zoomEffect 20s infinite alternate;"
            >
          }
        } @else {
          <img
            [src]="fallbackAuthBackground"
            class="w-full h-full object-cover animate-pulse-slow scale-105"
            style="animation: zoomEffect 20s infinite alternate;"
          >
        }
        <div class="absolute inset-0 bg-gradient-to-br from-brand-pink/90 via-purple-900/80 to-black/80 mix-blend-multiply"></div>
        <div class="absolute inset-0 bg-black/20"></div>
      </div>

      <div class="relative z-10 w-full max-w-4xl bg-white/95 dark:bg-black/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden flex flex-col md:flex-row animate-slide-up">
        <div class="hidden md:flex w-1/2 bg-gradient-to-br from-brand-pink/10 to-brand-lilac/10 flex-col items-center justify-center p-10 relative">
          <div class="text-center relative z-10 flex flex-col items-center">
            @if (store.institutional().logoUrl) {
              <img [src]="store.institutional().logoUrl" class="w-48 h-auto object-contain mb-6 drop-shadow-xl hover:scale-105 transition-transform duration-500">
            } @else {
              <div class="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-xl mx-auto mb-6 transform rotate-3 border-4 border-brand-soft/50">
                <app-icon name="rainbow" size="64px"></app-icon>
              </div>
              <h2 class="text-3xl font-black text-brand-dark dark:text-white mb-2 tracking-tight">YARA Kids</h2>
            }
            <p class="text-gray-500 dark:text-gray-300 font-medium">Onde a moda encontra a magia.</p>
          </div>

          <div class="mt-10 space-y-4 w-full max-w-xs">
            <div class="flex items-center gap-3 bg-white/50 dark:bg-gray-800/50 p-3 rounded-xl backdrop-blur-sm border border-white/40 dark:border-gray-700">
              <div class="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                <app-icon name="check" size="14px"></app-icon>
              </div>
              <span class="text-sm font-bold text-gray-700 dark:text-gray-200">Frete Grátis &gt; R$ 150</span>
            </div>
            <div class="flex items-center gap-3 bg-white/50 dark:bg-gray-800/50 p-3 rounded-xl backdrop-blur-sm border border-white/40 dark:border-gray-700">
              <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <app-icon name="truck" size="14px"></app-icon>
              </div>
              <span class="text-sm font-bold text-gray-700 dark:text-gray-200">Envio em até 2 dias</span>
            </div>
          </div>

          <div class="absolute top-0 left-0 w-32 h-32 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div class="absolute bottom-0 right-0 w-32 h-32 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        </div>

        <div class="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative">
          @if (viewMode !== 'login') {
            <button (click)="viewMode = 'login'" class="absolute top-6 left-6 text-gray-400 hover:text-brand-pink transition-colors flex items-center gap-1 text-sm font-bold">
              <app-icon name="chevron-down" class="rotate-90" size="16px"></app-icon> Voltar
            </button>
          }

          <div class="md:hidden text-center mb-6">
            <h1 class="text-2xl font-black text-brand-pink">YARA Kids</h1>
          </div>

          @if (viewMode === 'login' || viewMode === 'register') {
            <div class="flex justify-center mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl w-fit mx-auto md:mx-0">
              <button (click)="viewMode = 'login'"
                class="px-6 py-2 rounded-xl text-sm font-bold transition-all duration-300"
                [class.bg-white]="viewMode === 'login'" [class.text-brand-dark]="viewMode === 'login'" [class.shadow-md]="viewMode === 'login'"
                [class.text-gray-400]="viewMode !== 'login'" [class.dark:bg-gray-700]="viewMode === 'login'" [class.dark:text-white]="viewMode === 'login'">
                Entrar
              </button>
              <button (click)="viewMode = 'register'"
                class="px-6 py-2 rounded-xl text-sm font-bold transition-all duration-300"
                [class.bg-white]="viewMode === 'register'" [class.text-brand-dark]="viewMode === 'register'" [class.shadow-md]="viewMode === 'register'"
                [class.text-gray-400]="viewMode !== 'register'" [class.dark:bg-gray-700]="viewMode === 'register'" [class.dark:text-white]="viewMode === 'register'">
                Criar Conta
              </button>
            </div>
          }

          <h3 class="text-2xl font-black text-gray-800 dark:text-white mb-2">
            @switch (viewMode) {
              @case ('login') { Bem-vinda de volta! }
              @case ('register') { Vamos começar? }
              @case ('forgot-password') { Recuperar Senha }
            }
          </h3>
          <p class="text-gray-400 text-sm mb-6">
            @switch (viewMode) {
              @case ('login') { Acesse com seu e-mail e senha. }
              @case ('register') { Crie sua conta e ganhe 10% OFF na primeira compra. }
              @case ('forgot-password') { Enviaremos um link para seu e-mail. }
            }
          </p>

          @if (viewMode === 'forgot-password') {
             <div class="space-y-4 animate-fade-in">
               <div class="group">
                 <input type="email" [(ngModel)]="email" placeholder="Seu E-mail cadastrado" class="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-brand-pink rounded-xl outline-none font-bold text-sm text-gray-700 dark:text-white transition-all placeholder-gray-400">
               </div>
               <button (click)="handleForgotPassword()" [disabled]="loading || !email" class="w-full py-4 bg-brand-dark dark:bg-brand-pink text-white font-black rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl text-sm uppercase tracking-wider disabled:opacity-70 disabled:cursor-not-allowed">
                 {{ loading ? 'Enviando...' : 'Recuperar Senha' }}
               </button>
             </div>
          }

          @else {
            <button (click)="handleGoogleLogin()" [disabled]="isGoogleLoading"
                    class="w-full py-3 bg-white dark:bg-white border border-gray-300 dark:border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all shadow-sm flex items-center justify-center gap-3 mb-6 relative overflow-hidden group">
               @if (isGoogleLoading) {
                 <div class="w-5 h-5 border-2 border-gray-300 border-t-brand-pink rounded-full animate-spin"></div>
                 <span class="text-sm">Conectando...</span>
               } @else {
                 <app-icon name="google" size="20px" class="text-red-500"></app-icon>
                 <span class="text-sm">Continuar com Google</span>
               }
            </button>

            <div class="relative flex py-2 items-center mb-6">
              <div class="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
              <span class="flex-shrink-0 mx-4 text-gray-400 text-xs font-bold uppercase">Ou use E-mail</span>
              <div class="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
            </div>

            <form (submit)="viewMode === 'login' ? handleLogin() : handleRegister()" class="space-y-4">
              @if (viewMode === 'register') {
                <div class="group animate-slide-up">
                  <input type="text" [(ngModel)]="name" name="name" placeholder="Nome Completo" class="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-brand-pink rounded-xl outline-none font-bold text-sm text-gray-700 dark:text-white transition-all placeholder-gray-400" required>
                </div>
              }

              <div class="group">
                <input type="email" [(ngModel)]="email" name="email" placeholder="Seu E-mail" class="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-brand-pink rounded-xl outline-none font-bold text-sm text-gray-700 dark:text-white transition-all placeholder-gray-400" required>
              </div>
              <div class="group">
                <input type="password" [(ngModel)]="password" name="password" placeholder="Sua Senha" class="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-brand-pink rounded-xl outline-none font-bold text-sm text-gray-700 dark:text-white transition-all placeholder-gray-400" required>
              </div>

              @if (!store.termsAccepted()) {
                <div class="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 p-3 rounded-xl text-xs text-red-500 font-bold flex items-center gap-2">
                  <span class="text-lg">!</span>
                  <span>Você precisa aceitar os <a routerLink="/termos" class="underline">Termos de Uso</a> para continuar.</span>
                </div>
              }

              <button type="submit"
                      [disabled]="!store.termsAccepted() || loading"
                      class="w-full py-4 bg-brand-dark dark:bg-brand-pink text-white font-black rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl text-sm uppercase tracking-wider flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed disabled:grayscale">
                @if(loading) {
                  <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                } @else {
                  {{ viewMode === 'login' ? 'Acessar Minha Conta' : 'Cadastrar Agora' }}
                  <app-icon name="chevron-right" size="16px"></app-icon>
                }
              </button>
            </form>

            @if (viewMode === 'login') {
              <div class="mt-4 text-center">
                 <button (click)="viewMode = 'forgot-password'" class="text-xs font-bold text-brand-pink hover:underline">Esqueci minha senha</button>
              </div>
            }
          }

          <div class="mt-6 text-center">
             <a routerLink="/" class="text-xs font-bold text-gray-400 hover:text-brand-pink transition-colors">Voltar para a loja</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes zoomEffect {
      0% { transform: scale(1); }
      100% { transform: scale(1.1); }
    }
  `]
})
export class LoginComponent implements OnInit {
  store = inject(StoreService);
  router = inject(Router);
  title = inject(Title);
  fallbackAuthBackground = 'https://images.unsplash.com/photo-1621452773781-0f992ee03591?w=1920&q=80';
  authBanner = computed(() => {
    const banners = this.store
      .banners()
      .filter(b => b.location === 'auth-hero' && b.active !== false)
      .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
    return banners[0] || null;
  });

  viewMode: AuthMode = 'login';

  name = '';
  email = '';
  password = '';

  isGoogleLoading = false;
  loading = false;
  private redirectedBySession = false;

  constructor() {
    this.title.setTitle('Login | YARA Kids');

    // OAuth callback can restore the session after this screen is already mounted.
    effect(() => {
      const currentUser = this.store.user();
      if (!currentUser || this.redirectedBySession) return;
      this.redirectedBySession = true;
      queueMicrotask(() => this.router.navigate(['/']));
    });
  }

  ngOnInit() {
    if (this.store.user()) {
      this.redirectedBySession = true;
      queueMicrotask(() => this.router.navigate(['/']));
    }
  }

  async handleLogin() {
    if (!this.store.termsAccepted()) {
      this.store.showToast('Aceite os termos de privacidade para continuar.', 'error');
      return;
    }

    if (this.email && this.password) {
      this.loading = true;
      const success = await this.store.login(this.email, this.password);
      this.loading = false;
      if (success) this.router.navigate(['/']);
    } else {
      this.store.showToast('Preencha email e senha', 'error');
    }
  }

  async handleRegister() {
    if (!this.store.termsAccepted()) {
      this.store.showToast('Aceite os termos de privacidade.', 'error');
      return;
    }

    if (this.email && this.password && this.name) {
      this.loading = true;
      const success = await this.store.register(this.email, this.password, this.name);
      this.loading = false;
      if (success) {
        this.viewMode = 'login';
      }
    } else {
      this.store.showToast('Preencha todos os campos', 'error');
    }
  }

  async handleGoogleLogin() {
    if (!this.store.termsAccepted()) {
      this.store.showToast('Aceite os termos para continuar.', 'error');
      return;
    }

    this.isGoogleLoading = true;
    try {
      await this.store.loginWithGoogle();
    } catch (e) {
      console.error(e);
      this.store.showToast('Erro ao conectar com Google. Tente usar E-mail e Senha.', 'error');
    } finally {
      setTimeout(() => this.isGoogleLoading = false, 1000);
    }
  }

  async handleForgotPassword() {
    if (!this.email) {
      this.store.showToast('Digite seu e-mail acima para recuperar.', 'info');
      return;
    }
    this.loading = true;
    await this.store.recoverPassword(this.email);
    this.loading = false;
    this.viewMode = 'login';
  }
}



