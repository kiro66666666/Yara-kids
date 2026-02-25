
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from '../../services/store.service';
import { PwaService } from '../../services/pwa.service'; 
import { NotificationService } from '../../services/notification.service';
import { Router } from '@angular/router';
import { IconComponent } from '../../ui/icons';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-brand-darkbg py-12 transition-colors duration-300">
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
                 @if (!pwa.isStandalone() && !pwa.isIOS()) {
                   <button (click)="installApp()" class="w-full py-3 bg-brand-dark text-white font-bold rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-lg">
                     <app-icon name="check" size="18px"></app-icon> Instalar App
                   </button>
                 }

                 <button (click)="enableNotifications()" class="w-full py-3 bg-brand-pink text-white font-bold rounded-xl hover:bg-pink-600 transition-colors flex items-center justify-center gap-2 shadow-lg">
                   <app-icon name="mail" size="18px"></app-icon>
                   {{ notifications.permission() === 'granted' ? 'Notificações ativas' : 'Ativar notificações' }}
                 </button>

                 <button (click)="logout()" class="w-full py-3 border-2 border-red-100 dark:border-red-900/30 text-red-500 font-bold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2">
                   <app-icon name="log-out" size="18px"></app-icon> Sair
                 </button>
               </div>
            </div>
          </div>

          <!-- Orders List -->
          <div class="md:col-span-2 space-y-6">
             <h3 class="font-bold text-xl text-gray-800 dark:text-white mb-4">Meus Pedidos</h3>
             
             @if (myOrders().length > 0) {
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
             } @else {
               <div class="text-center py-12 bg-white dark:bg-brand-darksurface rounded-3xl border border-gray-100 dark:border-gray-700 border-dashed">
                 <div class="text-4xl mb-4 grayscale opacity-50">📦</div>
                 <p class="font-bold text-gray-400">Você ainda não fez nenhum pedido.</p>
                 <button routerLink="/catalogo" class="mt-4 text-brand-pink font-bold hover:underline">Ir para a Loja</button>
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
  title = inject(Title);

  myOrders = this.store.orders; 
  avatarUploading = signal(false);

  constructor() {
    this.title.setTitle('Minha Conta | YARA Kids');
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
    const installed = await this.pwa.installPwa();
    if (!installed) {
      this.store.showToast(this.pwa.getManualInstallHint(), 'info');
    }
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
}

