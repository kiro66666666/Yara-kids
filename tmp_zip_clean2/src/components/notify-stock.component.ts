
import { Component, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from '../services/store.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-notify-stock',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (sent()) {
      <div class="bg-green-50 border border-green-200 rounded-2xl p-6 text-center animate-fade-in">
        <div class="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3 text-xl">✅</div>
        <p class="text-green-800 font-bold text-lg mb-1">Tudo certo!</p>
        <p class="text-green-700 text-sm">Enviaremos um email para <b>{{ email }}</b> assim que o produto voltar ao estoque.</p>
      </div>
    } @else {
      <div class="bg-orange-50 border border-orange-200 rounded-2xl p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="text-2xl">😔</div>
          <div>
            <p class="font-bold text-gray-800">Produto Indisponível</p>
            <p class="text-xs text-gray-500">Deixe seu email e avisaremos quando chegar!</p>
          </div>
        </div>
        
        <div class="flex gap-2">
          <input type="email" [(ngModel)]="email" placeholder="seu@email.com" 
            class="flex-1 px-4 py-3 bg-white border border-orange-200 rounded-xl text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100">
          <button (click)="register()" [disabled]="loading() || !email" 
            class="bg-orange-500 text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md">
            {{ loading() ? '...' : 'Avise-me' }}
          </button>
        </div>
      </div>
    }
  `
})
export class NotifyStockComponent {
  productName = input.required<string>();
  store = inject(StoreService);
  
  email = '';
  loading = signal(false);
  sent = signal(false);

  async register() {
    if (!this.email.includes('@')) {
      this.store.showToast('Digite um email válido', 'error');
      return;
    }
    
    this.loading.set(true);
    await this.store.createStockAlert({ productName: this.productName(), email: this.email });
    this.loading.set(false);
    this.sent.set(true);
  }
}
