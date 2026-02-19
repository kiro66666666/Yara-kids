
import { Component, inject, signal, effect, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, Router, RouterLinkActive } from '@angular/router';
import { StoreService } from '../services/store.service';
import { IconComponent } from '../ui/icons';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, IconComponent, CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Top Bar -->
    <div class="bg-gradient-to-r from-brand-pink to-brand-lilac text-white text-[10px] md:text-[11px] py-2 text-center font-bold tracking-wide shadow-sm relative z-50 pt-[max(0.5rem,env(safe-area-inset-top))]">
      <div class="w-full max-w-[1440px] mx-auto px-4 flex justify-between md:justify-center items-center">
        <span class="hidden md:inline">🎉 FRETE GRÁTIS PARA TODO O BRASIL NAS COMPRAS ACIMA DE R$ 150</span>
        <!-- Mobile: Allow Wrap to prevent overflow -->
        <span class="md:hidden flex flex-wrap justify-center items-center gap-x-2 gap-y-0.5 mx-auto w-full leading-tight">
          <span class="whitespace-nowrap flex items-center gap-1">🚚 Frete Grátis > R$ 150</span>
          <span class="w-1 h-1 bg-white rounded-full hidden sm:inline-block"></span> 
          <span class="whitespace-nowrap flex items-center gap-1">💳 6x Sem Juros</span>
        </span>
      </div>
    </div>

    <!-- Main Header -->
    <header class="sticky top-0 z-40 bg-white/95 dark:bg-brand-darkbg/95 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-gray-800 pb-2 md:pb-0 transition-all duration-300">
      <div class="w-full max-w-[1440px] mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between gap-4">
        
        <!-- Mobile Menu Button -->
        <button (click)="toggleMenu()" aria-label="Abrir Menu" class="lg:hidden p-2 -ml-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full active:scale-95 transition-transform">
          <app-icon name="menu"></app-icon>
        </button>

        <!-- Logo (Updated to Image) -->
        <div class="flex items-center justify-center cursor-pointer group select-none flex-shrink-0" (click)="handleLogoClick()">
          @if (store.institutional().logoUrl) {
            <img [src]="store.institutional().logoUrl" alt="YARA Kids" class="h-10 md:h-16 max-w-[180px] w-auto object-contain transform group-hover:scale-105 transition-transform">
          } @else {
            <div class="flex items-center gap-2">
              <div class="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl flex items-center justify-center text-white shadow-md transform group-hover:rotate-6 transition-transform border-2 border-brand-soft">
                 <app-icon name="rainbow" size="32px"></app-icon>
              </div>
              <div class="flex flex-col">
                <div class="text-xl md:text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-brand-pink to-brand-lilac leading-none">
                  YARA<span class="text-brand-lilac">Kids</span>
                </div>
                <span class="text-[9px] font-bold text-gray-400 tracking-widest uppercase">Moda Infantil</span>
              </div>
            </div>
          }
        </div>

        <!-- Desktop Search Bar -->
        <div class="hidden lg:flex flex-1 max-w-xl mx-auto relative group">
          <input type="text" 
            [(ngModel)]="searchTerm"
            (keyup.enter)="search()"
            placeholder="Buscar vestidos, conjuntos..." 
            class="w-full bg-gray-100 dark:bg-gray-800 border-2 border-transparent focus:bg-white dark:focus:bg-brand-darkbg focus:border-brand-pink rounded-full py-2.5 pl-5 pr-12 outline-none transition-all font-medium text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 group-hover:shadow-sm">
          <button (click)="search()" aria-label="Buscar" class="absolute right-1 top-1 bottom-1 bg-brand-pink text-white rounded-full w-10 flex items-center justify-center hover:bg-pink-600 transition-colors shadow-sm active:scale-90">
            <app-icon name="search" size="18px"></app-icon>
          </button>
        </div>

        <!-- Desktop Actions -->
        <div class="hidden lg:flex items-center gap-3 xl:gap-5 text-sm font-medium text-gray-600 dark:text-gray-300">
          
          <!-- Theme Toggle -->
          <button (click)="store.toggleTheme()" aria-label="Alternar Tema" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-yellow-400">
            @if(store.theme() === 'dark') {
              <app-icon name="sun" size="20px"></app-icon>
            } @else {
              <app-icon name="moon" size="20px"></app-icon>
            }
          </button>

          <a *ngIf="store.user()?.role === 'admin'" routerLink="/admin" class="flex items-center gap-2 text-brand-lilac bg-brand-soft dark:bg-brand-lilac/20 px-3 py-1.5 rounded-full hover:bg-brand-lilac hover:text-white transition-all">
            <span class="text-xs font-bold">Painel Admin</span>
          </a>

          <div class="relative group cursor-pointer py-4">
            <div class="flex items-center gap-2 hover:text-brand-pink transition-colors">
              <app-icon name="user" size="20px"></app-icon>
              <span class="max-w-[100px] truncate">{{ store.user() ? ('Olá, ' + store.user()?.name?.split(' ')?.[0]) : 'Entrar' }}</span>
              <app-icon name="chevron-down" size="12px"></app-icon>
            </div>
            
            <div class="absolute right-0 top-[90%] w-48 bg-white dark:bg-brand-darksurface shadow-xl rounded-xl p-2 hidden group-hover:block border border-gray-100 dark:border-gray-700 animate-fade-in z-50">
              @if (store.user()) {
                <a routerLink="/minha-conta" class="block p-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-200">Minha Conta</a>
                <a routerLink="/minha-conta" class="block p-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-200">Meus Pedidos</a>
                <div class="h-px bg-gray-100 dark:bg-gray-700 my-1"></div>
                <button (click)="logout()" class="w-full text-left p-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-lg font-bold">Sair</button>
              } @else {
                <a routerLink="/login" class="block w-full text-center py-2 bg-brand-pink text-white font-bold rounded-lg hover:bg-pink-600 mb-2">Entrar</a>
                <a routerLink="/login" class="block w-full text-center py-2 text-xs text-gray-500 dark:text-gray-400 hover:text-brand-pink">Criar conta</a>
              }
            </div>
          </div>

          <!-- Desktop Cart Icon with ID -->
          <a routerLink="/carrinho" id="desktop-cart" aria-label="Carrinho de Compras" class="relative hover:text-brand-pink transition-colors p-2 transition-transform duration-300">
            <app-icon name="shopping-bag" size="24px"></app-icon>
            @if (store.cartCount() > 0) {
              <span class="absolute top-0 right-0 bg-brand-pink text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white dark:border-brand-darkbg transform translate-x-1 -translate-y-1">
                {{ store.cartCount() }}
              </span>
            }
          </a>
        </div>

        <!-- Mobile Cart & Theme -->
        <div class="flex lg:hidden items-center gap-2">
           <button (click)="store.toggleTheme()" aria-label="Alternar Tema" class="p-2 text-gray-600 dark:text-yellow-400">
              @if(store.theme() === 'dark') { <app-icon name="sun" size="20px"></app-icon> } 
              @else { <app-icon name="moon" size="20px"></app-icon> }
           </button>
           
           <a routerLink="/carrinho" aria-label="Carrinho" class="relative text-gray-700 dark:text-gray-200 p-2 -mr-2 active:scale-95 transition-transform">
              <app-icon name="shopping-bag" size="24px"></app-icon>
              @if (store.cartCount() > 0) {
                 <span class="absolute top-0 right-0 bg-brand-pink text-white text-[9px] font-bold h-4 w-4 flex items-center justify-center rounded-full border border-white dark:border-brand-darkbg">
                   {{ store.cartCount() }}
                 </span>
               }
           </a>
        </div>
      </div>

      <!-- Mobile Search Bar (Updated px-4 to match other content) -->
      <div class="lg:hidden px-4 pb-4 w-full max-w-[1440px] mx-auto">
        <div class="relative">
          <app-icon name="search" size="18px" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 z-10"></app-icon>
          <!-- Enhanced styles for mobile input contrast -->
          <input type="text" 
                 [(ngModel)]="searchTerm"
                 (keyup.enter)="search()"
                 placeholder="Buscar na YARA Kids..." 
                 aria-label="Campo de Busca"
                 class="w-full bg-gray-100 dark:bg-gray-800 text-sm py-3 pl-10 pr-4 rounded-xl border border-transparent dark:border-gray-700 focus:bg-white dark:focus:bg-black focus:border-brand-pink focus:ring-1 focus:ring-brand-pink outline-none placeholder-gray-500 text-gray-800 dark:text-white shadow-inner transition-all">
        </div>
      </div>
    </header>

    <!-- Mobile Sidebar Menu Overlay -->
    @if (isMenuOpen) {
      <div class="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm lg:hidden" (click)="toggleMenu()"></div>
      <div class="fixed inset-y-0 left-0 z-[70] w-[85%] max-w-[320px] bg-white dark:bg-brand-darksurface shadow-2xl flex flex-col transform transition-transform duration-300"
           [class.translate-x-0]="isMenuOpen" [class.-translate-x-full]="!isMenuOpen">
         
         <div class="p-6 bg-gradient-to-br from-brand-pink to-brand-lilac text-white relative overflow-hidden shrink-0 pt-[max(1.5rem,env(safe-area-inset-top))]">
           <div class="absolute -right-6 -top-6 w-24 h-24 bg-white/20 rounded-full blur-2xl"></div>
           
           <div class="flex justify-between items-center mb-6 relative z-10">
             <span class="font-black text-xl">Menu</span>
             <button (click)="toggleMenu()" class="p-1 bg-white/20 rounded-full hover:bg-white/30 transition-colors"><app-icon name="x"></app-icon></button>
           </div>
           
           @if(store.user()) {
             <div class="flex items-center gap-3 relative z-10">
               <div class="w-12 h-12 bg-white text-brand-pink rounded-full flex items-center justify-center font-bold text-lg shadow-sm border-2 border-white/50 shrink-0">
                 {{ store.user()?.name?.charAt(0) }}
               </div>
               <div class="min-w-0">
                 <p class="font-bold text-lg truncate">Olá, {{ store.user()?.name?.split(' ')?.[0] }}</p>
                 <p class="text-xs opacity-90 font-medium">Bem-vinda de volta!</p>
               </div>
             </div>
           } @else {
             <a routerLink="/login" (click)="toggleMenu()" class="block w-full py-3 bg-white text-brand-pink text-center font-bold rounded-xl shadow-lg relative z-10 hover:shadow-xl transition-all active:scale-[0.98]">
               Entrar ou Cadastrar
             </a>
           }
         </div>
         
         <div class="flex-1 overflow-y-auto p-2 space-y-1 bg-white dark:bg-brand-darksurface text-gray-700 dark:text-gray-200">
           <a routerLink="/" (click)="toggleMenu()" class="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 font-bold transition-colors">
             <span class="w-8 h-8 rounded-full bg-pink-50 dark:bg-pink-900/30 text-brand-pink flex items-center justify-center"><app-icon name="home" size="18px"></app-icon></span> Início
           </a>
           <a routerLink="/catalogo" (click)="toggleMenu()" class="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 font-bold transition-colors">
             <span class="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-900/30 text-brand-lilac flex items-center justify-center"><app-icon name="grid" size="18px"></app-icon></span> Toda a Coleção
           </a>
           
           <div class="h-px bg-gray-100 dark:bg-gray-700 my-2 mx-4"></div>
           
           <p class="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Categorias</p>
           
           <!-- Dynamic Categories in Mobile Menu -->
           @for(cat of store.categories(); track cat.id) {
             <a routerLink="/catalogo" [queryParams]="{cat: cat.slug}" (click)="toggleMenu()" class="flex items-center gap-4 p-3 px-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium transition-colors">
               🎀 {{ cat.name }}
             </a>
           }
           
           @if(store.user()?.role === 'admin') {
             <div class="h-px bg-gray-100 dark:bg-gray-700 my-2 mx-4"></div>
             <a routerLink="/admin" (click)="toggleMenu()" class="flex items-center gap-4 p-4 mx-2 rounded-xl bg-brand-soft dark:bg-brand-lilac/20 text-brand-dark dark:text-white font-bold border border-brand-pink/20">
               🔐 Painel Admin
             </a>
           }
         </div>

         <div class="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 pb-8 shrink-0">
           <button *ngIf="store.user()" (click)="logout(); toggleMenu()" class="flex w-full justify-center items-center gap-2 text-red-500 font-bold text-sm p-3 bg-white dark:bg-brand-darksurface border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shadow-sm">
             <app-icon name="log-out" size="16px"></app-icon> Sair da conta
           </button>
           <div class="flex justify-center gap-4 mt-4 opacity-50 grayscale dark:invert">
             <app-icon name="check" size="16px"></app-icon>
             <app-icon name="dollar-sign" size="16px"></app-icon>
             <app-icon name="truck" size="16px"></app-icon>
           </div>
           <p class="text-center text-[10px] text-gray-400 mt-2">v3.2.0 • YARA Kids</p>
         </div>
      </div>
    }

    <!-- Admin Modal -->
    @if (showAdminModal) {
        <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div class="bg-white dark:bg-brand-darksurface rounded-3xl p-8 w-full max-w-sm shadow-2xl transform scale-100 transition-all border border-gray-100 dark:border-gray-700">
             <div class="text-center mb-6">
               <div class="w-16 h-16 bg-brand-soft dark:bg-brand-lilac/20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl shadow-inner">🔐</div>
               <h3 class="text-xl font-bold text-brand-dark dark:text-white">Acesso Restrito</h3>
               <p class="text-xs text-gray-400 mt-1">Painel Administrativo YARA Kids</p>
             </div>
             
             <input type="password" [(ngModel)]="adminPassword" placeholder="Senha" 
               class="w-full p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl mb-4 focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20 outline-none text-center font-bold tracking-widest transition-all text-gray-800 dark:text-white placeholder-gray-400">
             
             @if (adminError) { 
               <div class="bg-red-50 dark:bg-red-900/20 text-red-500 text-xs text-center mb-4 font-bold py-2 rounded-lg border border-red-100 dark:border-red-800">
                 {{ adminError }}
               </div> 
             }

             <div class="flex flex-col gap-3">
               <button (click)="verifyAdmin()" [disabled]="isLoading" class="w-full py-3 bg-brand-dark dark:bg-black text-white font-bold rounded-xl hover:bg-black dark:hover:bg-gray-800 transition-transform hover:scale-[1.02] shadow-lg disabled:opacity-70 disabled:cursor-not-allowed">
                 {{ isLoading ? 'Verificando...' : 'Entrar' }}
               </button>
               <button (click)="showAdminModal = false; adminPassword = ''" class="w-full py-3 text-gray-400 font-medium text-sm hover:text-gray-600 dark:hover:text-gray-200">Cancelar</button>
             </div>
          </div>
        </div>
    }
  `,
  styles: [`
    @keyframes bump {
       0% { transform: scale(1); }
       50% { transform: scale(1.2); }
       100% { transform: scale(1); }
    }
    .animate-bump {
       animation: bump 0.3s ease-out;
    }
  `]
})
export class HeaderComponent {
  store = inject(StoreService);
  router = inject(Router);
  
  isMenuOpen = false;
  clicks = 0;
  clickTimer: any;
  showAdminModal = false;
  adminPassword = '';
  adminError = '';
  isLoading = false;
  searchTerm = '';

  toggleMenu() { this.isMenuOpen = !this.isMenuOpen; }

  search() {
    if (this.searchTerm.trim()) {
      this.router.navigate(['/catalogo'], { queryParams: { search: this.searchTerm } });
      this.isMenuOpen = false; // Close menu on mobile if open
    }
  }

  handleLogoClick() {
    this.clicks++;
    clearTimeout(this.clickTimer);
    this.clickTimer = setTimeout(() => this.clicks = 0, 2000);
    if (this.clicks === 5) {
      this.clicks = 0;
      this.store.user()?.role === 'admin' ? this.router.navigate(['/admin']) : this.showAdminModal = true;
    } else {
      // Navigate home on single click if not trying to access admin
      if(this.clicks === 1) this.router.navigate(['/']); 
    }
  }

  async verifyAdmin() {
    this.isLoading = true;
    this.adminError = '';
    
    try {
      const isValid = await this.store.verifyAdminPassword(this.adminPassword);
      
      if (isValid) {
        const adminUser = { id: 'admin-1', name: 'Administradora', email: 'admin@yarakids.com.br', role: 'admin' as const };
        this.store.user.set(adminUser);
        localStorage.setItem('yarakids_user', JSON.stringify(adminUser));
        this.showAdminModal = false;
        this.adminPassword = '';
        this.router.navigate(['/admin']);
      } else {
        this.adminError = 'Senha incorreta';
      }
    } catch (e) {
      this.adminError = 'Erro ao verificar senha';
    } finally {
      this.isLoading = false;
    }
  }

  logout() {
    this.store.logout();
    this.router.navigate(['/']);
  }
}
