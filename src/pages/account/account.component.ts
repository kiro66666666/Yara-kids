
import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from '../../services/store.service';
import { PwaService } from '../../services/pwa.service'; 
import { NotificationService } from '../../services/notification.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IconComponent } from '../../ui/icons';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, IconComponent, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-brand-darkbg py-12 transition-colors duration-300">
      @if (showInstallChooser()) {
        <div class="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="w-full max-w-xl bg-white dark:bg-brand-darksurface rounded-3xl border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden">
            <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h3 class="font-black text-lg text-gray-800 dark:text-white">Instalar YARA Kids</h3>
              <button (click)="showInstallChooser.set(false)" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-300">
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
                <p class="text-xs text-gray-500 dark:text-gray-300">Instalar app / adicionar à tela inicial.</p>
              </button>
              <button (click)="installByTarget('ios')" class="p-4 rounded-2xl border border-gray-200 dark:border-gray-700 text-left hover:border-brand-pink/40 hover:bg-brand-soft/40 dark:hover:bg-brand-lilac/10 transition-colors">
                <p class="font-bold text-gray-800 dark:text-white mb-1">iOS</p>
                <p class="text-xs text-gray-500 dark:text-gray-300">Compartilhar e adicionar à tela inicial.</p>
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

      <div class="container mx-auto px-6 max-w-5xl">
        <h1 class="text-3xl font-black text-gray-800 dark:text-white mb-8 flex items-center gap-3">
          <div class="w-2 h-8 bg-brand-pink rounded-full"></div> Minha Conta
        </h1>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <!-- Profile Card -->
          <div class="md:col-span-1">
            <div class="bg-white dark:bg-brand-darksurface p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 text-center sticky top-24">
               <div class="relative w-24 h-24 mx-auto mb-4">
                 @if(store.user()?.avatarUrl) {
                   <img [src]="store.user()?.avatarUrl" alt="Avatar" class="w-24 h-24 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-lg">
                 } @else {
                   <div class="w-24 h-24 bg-brand-soft dark:bg-brand-pink/20 rounded-full flex items-center justify-center text-3xl text-brand-pink shadow-inner">
                     {{ store.user()?.name?.charAt(0) || 'U' }}
                   </div>
                 }
                 <label class="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-brand-pink text-white flex items-center justify-center cursor-pointer shadow-md hover:bg-pink-600 transition-colors" title="Alterar foto">
                   <input type="file" accept="image/*" hidden (change)="onAvatarSelected($event)">
                   <app-icon name="edit" size="14px"></app-icon>
                 </label>
               </div>
               <h2 class="text-xl font-bold text-gray-800 dark:text-white">{{ store.user()?.name }}</h2>
               <p class="text-gray-500 dark:text-gray-400 text-sm mb-6">{{ store.user()?.email || store.user()?.phone }}</p>
               @if (avatarUploading()) {
                 <p class="text-xs text-brand-pink font-bold mb-4">Atualizando foto...</p>
               }
               
               <div class="space-y-3">
                 <!-- Settings Toggle -->
                 <div class="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-600 flex items-center justify-between">
                    <div class="text-left">
                       <span class="text-xs font-bold text-gray-700 dark:text-white block">Animações</span>
                       <span class="text-[10px] text-gray-400">Modo Performance</span>
                    </div>
                    <button (click)="store.toggleAnimations()" class="w-10 h-6 rounded-full p-1 transition-colors duration-300"
                        [class.bg-brand-pink]="store.animationsEnabled()"
                        [class.bg-gray-300]="!store.animationsEnabled()">
                        <div class="w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300"
                             [class.translate-x-4]="store.animationsEnabled()"></div>
                    </button>
                 </div>

                 <!-- PWA Install Button (Only if installable) -->
                  @if (!pwa.isStandalone()) {
                    <button (click)="installApp()" class="w-full py-3 bg-brand-dark text-white font-bold rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-lg">
                      <app-icon name="check" size="18px"></app-icon> Instalar App
                    </button>
                  }
                  @if (pwa.isIOS() && !pwa.isStandalone()) {
                    <p class="text-[11px] text-gray-500 dark:text-gray-400 text-left px-1">
                      iPhone/iPad: toque em compartilhar e escolha "Adicionar à Tela de Início".
                    </p>
                  }

                  <button (click)="enableNotifications()" class="w-full py-3 px-4 bg-brand-pink text-white font-bold rounded-xl hover:bg-pink-600 transition-colors flex items-center justify-between gap-3 shadow-lg">
                    <span class="flex items-center gap-2 min-w-0">
                      <app-icon name="mail" size="18px" class="shrink-0"></app-icon>
                      <span class="truncate text-left">{{ notifications.permission() === 'granted' ? 'Notificações ativas' : 'Ativar notificações' }}</span>
                    </span>
                    <span class="shrink-0 text-[10px] px-2 py-1 rounded-full bg-white/20 border border-white/20">i</span>
                  </button>

                 <button (click)="logout()" class="w-full py-3 border-2 border-red-100 dark:border-red-900/30 text-red-500 font-bold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2">
                   <app-icon name="log-out" size="18px"></app-icon> Sair
                 </button>
               </div>
            </div>
          </div>

          <!-- Orders List -->
          <div class="md:col-span-2 space-y-6">
             <div class="flex items-center justify-between gap-3">
               <h3 class="font-bold text-xl text-gray-800 dark:text-white">Minha Área</h3>
               <div class="inline-flex p-1 rounded-xl bg-white dark:bg-brand-darksurface border border-gray-200 dark:border-gray-700">
                 <button type="button" (click)="showOrdersSection()" class="px-4 py-2 text-xs font-bold rounded-lg transition-colors" [ngClass]="activeSection() === 'orders' ? 'bg-brand-pink text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'">Pedidos</button>
                 <button type="button" (click)="showFavoritesSection()" class="px-4 py-2 text-xs font-bold rounded-lg transition-colors" [ngClass]="activeSection() === 'favorites' ? 'bg-brand-pink text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'">Favoritos</button>
               </div>
             </div>
              
             @if (activeSection() === 'orders' && myOrders().length > 0) {
                 @for (order of myOrders(); track order.id) {
                   <div class="bg-white dark:bg-brand-darksurface p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                    <div class="flex justify-between items-start mb-4 pb-4 border-b border-gray-50 dark:border-gray-600">
                       <div>
                         <p class="text-xs font-bold text-gray-400 uppercase">Pedido #{{ order.id }}</p>
                         <p class="text-sm font-medium text-gray-600 dark:text-gray-300">{{ order.date }}</p>
                       </div>
                       <div class="px-3 py-1 rounded-full text-xs font-bold uppercase"
                            [ngClass]="{
                              'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400': order.status === 'paid' || order.status === 'delivered',
                              'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400': order.status === 'pending',
                              'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400': order.status === 'shipped',
                              'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400': order.status === 'cancelled'
                            }">
                         {{ getStatusLabel(order.status) }}
                       </div>
                    </div>
                    
                    <div class="space-y-3 mb-4">
                      @for (item of order.items; track item.id) {
                        <div class="flex items-center gap-4">
                          <img [src]="item.image" class="w-12 h-12 rounded-lg object-cover bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-600">
                          <div class="flex-1">
                            <p class="text-sm font-bold text-gray-800 dark:text-white line-clamp-1">{{ item.name }}</p>
                            <p class="text-xs text-gray-500 dark:text-gray-400">{{ item.quantity }}x • {{ item.selectedSize }}</p>
                          </div>
                          <span class="text-sm font-bold text-gray-700 dark:text-gray-300">R$ {{ (item.price * item.quantity).toFixed(2) }}</span>
                        </div>
                      }
                    </div>
                    
                    <div class="flex justify-between items-center pt-2">
                      <span class="text-sm font-bold text-gray-500 dark:text-gray-400">Total</span>
                      <span class="text-xl font-black text-brand-dark dark:text-white">R$ {{ order.total.toFixed(2) }}</span>
                    </div>
                   </div>
                 }
             } @else if (activeSection() === 'orders') {
               <div class="text-center py-12 bg-white dark:bg-brand-darksurface rounded-3xl border border-gray-100 dark:border-gray-700 border-dashed">
                 <div class="text-4xl mb-4 grayscale opacity-50">📦</div>
                 <p class="font-bold text-gray-400">Você ainda não fez nenhum pedido.</p>
                  <button routerLink="/catalogo" class="mt-4 text-brand-pink font-bold hover:underline">Ir para a Loja</button>
                </div>
              }

             @if (activeSection() === 'favorites' && favoriteProducts().length > 0) {
               <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 @for (fav of favoriteProducts(); track fav.id) {
                   <div class="bg-white dark:bg-brand-darksurface rounded-2xl border border-gray-100 dark:border-gray-700 p-4 flex gap-3">
                     <img [src]="fav.image" [alt]="fav.name" class="w-20 h-20 rounded-xl object-cover border border-gray-100 dark:border-gray-700">
                     <div class="flex-1 min-w-0">
                       <p class="font-bold text-gray-800 dark:text-white line-clamp-2">{{ fav.name }}</p>
                       <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ fav.categoryName || 'Geral' }}</p>
                       <p class="text-sm font-black text-brand-dark dark:text-white mt-2">R$ {{ fav.price.toFixed(2) }}</p>
                       <div class="mt-3 flex flex-wrap gap-2">
                         <button type="button" (click)="openProduct(fav.id)" class="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-bold">Ver produto</button>
                         <button type="button" (click)="addFavoriteToCart(fav.id)" class="px-3 py-2 rounded-lg bg-brand-pink text-white text-xs font-bold">Adicionar à sacola</button>
                         <button type="button" (click)="removeFavorite(fav.id)" class="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 text-xs font-bold">Remover</button>
                       </div>
                     </div>
                   </div>
                 }
               </div>
             } @else if (activeSection() === 'favorites') {
               <div class="text-center py-12 bg-white dark:bg-brand-darksurface rounded-3xl border border-gray-100 dark:border-gray-700 border-dashed">
                 <div class="text-4xl mb-4 grayscale opacity-50">💖</div>
                 <p class="font-bold text-gray-400">Você ainda não adicionou favoritos.</p>
                 <button routerLink="/catalogo" class="mt-4 text-brand-pink font-bold hover:underline">Explorar produtos</button>
               </div>
             }
          </div>

        </div>
      </div>
    </div>
  `
})
export class AccountComponent {
  store = inject(StoreService);
  pwa = inject(PwaService);
  notifications = inject(NotificationService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  title = inject(Title);

  myOrders = this.store.orders; 
  activeSection = signal<'orders' | 'favorites'>('orders');
  favoriteProducts = computed(() =>
    this.store.products().filter(product => this.store.favorites().includes(product.id))
  );
  avatarUploading = signal(false);
  showInstallChooser = signal(false);
  installHint = signal('');

  constructor() {
    this.title.setTitle('Minha Conta | YARA Kids');
    this.route.queryParamMap.subscribe(params => {
      this.activeSection.set(params.get('section') === 'favoritos' ? 'favorites' : 'orders');
    });
  }

  logout() {
    this.store.logout();
    this.router.navigate(['/']);
  }

  async enableNotifications() {
    const user = this.store.user();
    if (!user?.id) {
      this.store.showToast('Faça login para ativar notificações', 'info');
      return;
    }
    const ok = await this.notifications.requestPermissionAndSubscribe(user.id, user.email);
    this.store.showToast(ok ? 'Notificações ativadas' : 'Não foi possível ativar notificações', ok ? 'success' : 'error');
  }

  async installApp() {
    const result = await this.pwa.attemptInstall();

    if (result.status === 'installed') {
      this.store.showToast('Aplicativo instalado com sucesso!', 'success');
      return;
    }

    if (result.status === 'dismissed') {
      this.store.showToast(result.message, 'info');
      return;
    }

    this.store.showToast(result.message, 'info');
    this.installHint.set(this.pwa.getManualInstallHint(this.pwa.getRecommendedTarget()));
    this.showInstallChooser.set(true);
  }

  async installByTarget(target: 'desktop' | 'android' | 'ios') {
    if (target === 'ios') {
      const hint = this.pwa.getManualInstallHint('ios');
      this.installHint.set(hint);
      this.store.showToast(hint, 'info');
      return;
    }

    const result = await this.pwa.attemptInstall();
    if (result.status === 'installed') {
      this.store.showToast('Aplicativo instalado com sucesso!', 'success');
      this.showInstallChooser.set(false);
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

  onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      this.store.showToast('Imagem de perfil deve ter no máximo 2MB.', 'error');
      return;
    }

    this.avatarUploading.set(true);
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      this.store.updateUserAvatar(result).finally(() => this.avatarUploading.set(false));
    };
    reader.onerror = () => {
      this.avatarUploading.set(false);
      this.store.showToast('Falha ao carregar imagem de perfil.', 'error');
    };
    reader.readAsDataURL(file);
  }

  getStatusLabel(status: string) {
    const map: any = {
      'pending': 'Aguardando Pagamento',
      'paid': 'Pago',
      'shipped': 'Enviado',
      'delivered': 'Entregue',
      'cancelled': 'Cancelado'
    };
    return map[status] || status;
  }

  showOrdersSection() {
    this.activeSection.set('orders');
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { section: null },
      queryParamsHandling: 'merge'
    });
  }

  showFavoritesSection() {
    this.activeSection.set('favorites');
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { section: 'favoritos' },
      queryParamsHandling: 'merge'
    });
  }

  openProduct(productId: string) {
    this.router.navigate(['/produto', productId]);
  }

  removeFavorite(productId: string) {
    this.store.toggleFavorite(productId);
  }

  addFavoriteToCart(productId: string) {
    const product = this.store.products().find(p => p.id === productId);
    if (!product) {
      this.store.showToast('Produto não encontrado.', 'error');
      return;
    }

    const size = product.sizes?.[0] || 'U';
    const color = product.colors?.[0]?.name || 'Padrão';
    this.store.addToCart(product, size, color);
  }
}

