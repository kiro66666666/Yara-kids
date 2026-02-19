
import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../ui/icons';
import { StoreService } from '../../services/store.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, IconComponent, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-brand-darkbg py-12 transition-colors duration-300">
      <div class="container mx-auto px-4 max-w-3xl">
        <div class="text-center mb-12 animate-fade-in">
          <div class="w-16 h-16 bg-brand-soft dark:bg-brand-pink/20 text-brand-pink rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-inner border border-brand-pink/20">
            <app-icon name="help-circle" size="32px"></app-icon>
          </div>
          <h1 class="text-3xl font-black text-gray-800 dark:text-white mb-4">Perguntas Frequentes</h1>
          <p class="text-gray-500 dark:text-gray-400">Tire suas dúvidas sobre compras, entregas e produtos.</p>
        </div>

        <!-- Search Bar -->
        <div class="mb-10 relative animate-slide-up">
           <input type="text" [(ngModel)]="searchTerm" placeholder="O que você procura?" 
             class="w-full p-4 pl-12 bg-white dark:bg-brand-darksurface border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm focus:ring-2 focus:ring-brand-pink focus:border-transparent outline-none text-gray-700 dark:text-white placeholder-gray-400 transition-all">
           <app-icon name="search" size="20px" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></app-icon>
        </div>

        <div class="space-y-4 animate-slide-up" style="animation-delay: 0.1s;">
          @for (item of filteredFaqs(); track item.id) {
            <details class="group bg-white dark:bg-brand-darksurface rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <summary class="flex justify-between items-center p-6 cursor-pointer list-none font-bold text-gray-800 dark:text-white hover:text-brand-pink transition-colors select-none">
                <span>{{ item.question }}</span>
                <span class="transition-transform group-open:rotate-180 text-gray-400 dark:text-gray-500">
                  <app-icon name="chevron-down" size="20px"></app-icon>
                </span>
              </summary>
              <div class="px-6 pb-6 text-gray-600 dark:text-gray-300 text-sm leading-relaxed border-t border-gray-50 dark:border-gray-700 pt-4 whitespace-pre-wrap">
                {{ item.answer }}
              </div>
            </details>
          }
          @if (filteredFaqs().length === 0) {
             <div class="text-center py-10">
               <p class="text-gray-400">Nenhuma pergunta encontrada para sua busca.</p>
             </div>
          }
        </div>

        <div class="mt-12 text-center bg-white dark:bg-brand-darksurface p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
          <p class="font-bold text-gray-800 dark:text-white mb-2">Não encontrou o que procurava?</p>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">Nossa equipe de atendimento está pronta para te ajudar.</p>
          <a href="https://wa.me/5594991334401" target="_blank" class="inline-flex items-center gap-2 px-8 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-colors shadow-lg shadow-green-200 dark:shadow-none hover:-translate-y-1 transform">
            <app-icon name="whatsapp" size="18px"></app-icon> Falar no WhatsApp
          </a>
        </div>
      </div>
    </div>
  `
})
export class FaqComponent {
  store = inject(StoreService);
  searchTerm = signal('');

  filteredFaqs = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.store.faqs().filter(f => 
      f.question.toLowerCase().includes(term) || 
      f.answer.toLowerCase().includes(term)
    );
  });
}
