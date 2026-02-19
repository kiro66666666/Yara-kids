
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from '../../services/store.service';
import { IconComponent } from '../../ui/icons';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [CommonModule, IconComponent, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-brand-darkbg py-12 transition-colors duration-300">
      <div class="container mx-auto px-4 max-w-2xl">
        <div class="text-center mb-12 animate-fade-in">
          <div class="w-20 h-20 bg-brand-soft dark:bg-pink-900/20 text-brand-pink rounded-full flex items-center justify-center mx-auto mb-4 text-4xl shadow-lg border-4 border-white dark:border-brand-darksurface transform -rotate-6">
            🎉
          </div>
          <h1 class="text-3xl font-black text-gray-800 dark:text-white mb-2">Sua Opinião Importa!</h1>
          <p class="text-gray-500 dark:text-gray-400">Ajude a YARA Kids a melhorar cada vez mais para você.</p>
        </div>

        <div class="bg-white dark:bg-brand-darksurface p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 animate-slide-up">
           
           @if (submitted()) {
             <div class="text-center py-10">
               <div class="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-gentle">
                 <app-icon name="check" size="32px"></app-icon>
               </div>
               <h3 class="text-2xl font-black text-gray-800 dark:text-white mb-2">Obrigado!</h3>
               <p class="text-gray-500 dark:text-gray-400">Sua avaliação foi enviada com sucesso.</p>
               <button (click)="goHome()" class="mt-8 px-8 py-3 bg-brand-pink text-white font-bold rounded-xl hover:bg-pink-600 shadow-lg transition-transform hover:-translate-y-1">
                 Voltar para a Loja
               </button>
             </div>
           } @else {
             <div class="space-y-6">
               <!-- Rating Stars -->
               <div class="text-center mb-8">
                 <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Toque para avaliar</p>
                 <div class="flex justify-center gap-2">
                   @for (i of [1,2,3,4,5]; track i) {
                     <button (click)="rating.set(i)" 
                       class="text-4xl transition-transform hover:scale-125 focus:outline-none"
                       [class.text-yellow-400]="i <= rating()"
                       [class.text-gray-200]="i > rating()"
                       [class.dark:text-gray-700]="i > rating()">
                       ★
                     </button>
                   }
                 </div>
                 <p class="mt-2 text-sm font-bold text-brand-pink h-5">
                   {{ getRatingText() }}
                 </p>
               </div>

               <div class="space-y-4">
                 <div>
                   <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Seu Nome (Opcional)</label>
                   <input type="text" [(ngModel)]="name" class="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl focus:border-brand-pink focus:ring-1 focus:ring-brand-pink outline-none font-bold text-gray-800 dark:text-white transition-all placeholder-gray-400" placeholder="Como podemos te chamar?">
                 </div>
                 
                 <div>
                   <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Sua Mensagem</label>
                   <textarea [(ngModel)]="message" rows="4" class="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl focus:border-brand-pink focus:ring-1 focus:ring-brand-pink outline-none font-medium text-gray-800 dark:text-white transition-all placeholder-gray-400 resize-none" placeholder="Conte o que achou dos produtos, entrega ou atendimento..."></textarea>
                 </div>
               </div>

               <button (click)="submit()" [disabled]="!message.trim() || rating() === 0" 
                 class="w-full py-4 bg-brand-dark dark:bg-brand-pink text-white font-black rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl text-sm uppercase tracking-wider flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed">
                 Enviar Avaliação <app-icon name="chevron-right" size="16px"></app-icon>
               </button>
             </div>
           }
        </div>
      </div>
    </div>
  `
})
export class FeedbackComponent {
  store = inject(StoreService);
  title = inject(Title);
  router = inject(Router);

  rating = signal(0);
  name = '';
  message = '';
  submitted = signal(false);

  constructor() {
    this.title.setTitle('Avalie sua Experiência | YARA Kids');
    // Auto-fill name if user logged in
    const user = this.store.user();
    if (user) {
      this.name = user.name;
    }
  }

  getRatingText() {
    const r = this.rating();
    if (r === 5) return 'Excelente! 😍';
    if (r === 4) return 'Muito Bom! 😄';
    if (r === 3) return 'Bom 🙂';
    if (r === 2) return 'Pode Melhorar 😐';
    if (r === 1) return 'Ruim 😞';
    return '';
  }

  async submit() {
    if (this.rating() === 0) {
      this.store.showToast('Por favor, selecione uma nota.', 'info');
      return;
    }
    if (!this.message.trim()) {
      this.store.showToast('Escreva uma mensagem.', 'info');
      return;
    }

    await this.store.sendFeedback({
      name: this.name || 'Anônimo',
      rating: this.rating(),
      message: this.message,
    });

    this.submitted.set(true);
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
