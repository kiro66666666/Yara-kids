
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../ui/icons';
import { StoreService } from '../../services/store.service';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, IconComponent, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-brand-darkbg py-12 transition-colors duration-300">
      <div class="container mx-auto px-4 max-w-6xl">
        
        <div class="text-center mb-16 animate-fade-in">
          <span class="text-brand-pink font-bold text-sm uppercase tracking-widest mb-2 block">Fale Conosco</span>
          <h1 class="text-4xl lg:text-5xl font-black text-gray-800 dark:text-white mb-4">Estamos aqui por você</h1>
          <p class="text-gray-500 dark:text-gray-400 text-lg">Dúvidas, sugestões ou apenas um oi. Nossa equipe ama ouvir você.</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
           
           <!-- Info Cards -->
           <div class="space-y-6 animate-slide-up">
              <div class="bg-white dark:bg-brand-darksurface p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-start gap-6 hover:-translate-y-1 transition-transform duration-300">
                 <div class="w-14 h-14 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
                    <app-icon name="whatsapp" size="28px"></app-icon>
                 </div>
                 <div>
                    <h3 class="font-bold text-xl text-gray-800 dark:text-white mb-2">WhatsApp</h3>
                    <p class="text-gray-500 dark:text-gray-400 mb-4 text-sm">Resposta rápida em horário comercial.</p>
                    <a [href]="whatsappLink" target="_blank" class="text-green-600 dark:text-green-400 font-bold hover:underline">Iniciar Conversa &rarr;</a>
                 </div>
              </div>

              <div class="bg-white dark:bg-brand-darksurface p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-start gap-6 hover:-translate-y-1 transition-transform duration-300">
                 <div class="w-14 h-14 bg-brand-soft dark:bg-brand-pink/20 text-brand-pink rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
                    <app-icon name="mail" size="28px"></app-icon>
                 </div>
                 <div>
                    <h3 class="font-bold text-xl text-gray-800 dark:text-white mb-2">E-mail</h3>
                    <p class="text-gray-500 dark:text-gray-400 mb-4 text-sm">Para assuntos mais detalhados.</p>
                    <a href="mailto:contato@yarakids.com.br" class="text-brand-pink font-bold hover:underline">contato&#64;yarakids.com.br</a>
                 </div>
              </div>

              <div class="bg-white dark:bg-brand-darksurface p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-start gap-6 hover:-translate-y-1 transition-transform duration-300">
                 <div class="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
                    <app-icon name="map-pin" size="28px"></app-icon>
                 </div>
                 <div>
                    <h3 class="font-bold text-xl text-gray-800 dark:text-white mb-2">Loja Física</h3>
                    <p class="text-gray-500 dark:text-gray-400 text-sm">Av. Brasil, 120 - Centro<br>Redenção, PA - CEP 68550-000</p>
                 </div>
              </div>
           </div>

           <!-- Form -->
           <div class="bg-white dark:bg-brand-darksurface p-8 lg:p-10 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 animate-slide-up" style="animation-delay: 0.1s;">
              <h3 class="font-bold text-2xl text-gray-800 dark:text-white mb-6">Envie uma mensagem</h3>
              
              <form (submit)="sendMessage()" class="space-y-4">
                 <div class="grid grid-cols-2 gap-4">
                   <div class="group">
                      <label class="block text-xs font-bold text-gray-400 uppercase mb-2">Seu Nome</label>
                      <input type="text" [(ngModel)]="name" name="name" class="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl focus:border-brand-pink outline-none font-bold text-gray-700 dark:text-white transition-all" placeholder="Nome" required>
                   </div>
                   <div class="group">
                      <label class="block text-xs font-bold text-gray-400 uppercase mb-2">Seu E-mail</label>
                      <input type="email" [(ngModel)]="email" name="email" class="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl focus:border-brand-pink outline-none font-bold text-gray-700 dark:text-white transition-all" placeholder="E-mail" required>
                   </div>
                 </div>
                 
                 <div class="group">
                    <label class="block text-xs font-bold text-gray-400 uppercase mb-2">Assunto</label>
                    <input type="text" [(ngModel)]="subject" name="subject" class="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl focus:border-brand-pink outline-none font-bold text-gray-700 dark:text-white transition-all" placeholder="Ex: Dúvida sobre pedido" required>
                 </div>

                 <div class="group">
                    <label class="block text-xs font-bold text-gray-400 uppercase mb-2">Mensagem</label>
                    <textarea [(ngModel)]="message" name="message" rows="5" class="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl focus:border-brand-pink outline-none font-medium text-gray-700 dark:text-white transition-all resize-none" placeholder="Como podemos ajudar?" required></textarea>
                 </div>

                 <button type="submit" [disabled]="loading" class="w-full py-4 bg-brand-dark dark:bg-brand-pink text-white font-black rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 uppercase tracking-wide disabled:opacity-70 disabled:cursor-not-allowed">
                    @if(loading) {
                      <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Enviando...
                    } @else {
                      Enviar Mensagem
                    }
                 </button>
              </form>
           </div>

        </div>
      </div>
    </div>
  `
})
export class ContactComponent {
  store = inject(StoreService);
  title = inject(Title);
  
  name = '';
  email = '';
  subject = '';
  message = '';
  loading = false;

  get whatsappLink(): string {
    const raw = this.store.institutional().whatsapp || '(94) 99133-4401';
    const digits = raw.replace(/\D/g, '');
    const normalized = digits ? (digits.startsWith('55') ? digits : `55${digits}`) : '5594991334401';
    return `https://wa.me/${normalized}`;
  }

  constructor() {
    this.title.setTitle('Fale Conosco | YARA Kids');
  }

  async sendMessage() {
    if (this.name && this.email && this.message) {
       this.loading = true;
       // Simulate delay
       await new Promise(resolve => setTimeout(resolve, 1500));
       
       this.store.sendContactMessage({
         name: this.name,
         email: this.email,
         subject: this.subject,
         message: this.message
       });
       
       this.name = '';
       this.email = '';
       this.subject = '';
       this.message = '';
       this.loading = false;
    } else {
       this.store.showToast('Preencha todos os campos obrigatórios.', 'error');
    }
  }
}

