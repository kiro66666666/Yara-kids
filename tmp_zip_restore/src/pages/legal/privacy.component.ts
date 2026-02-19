
import { Component, inject } from '@angular/core';
import { StoreService } from '../../services/store.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto px-4 py-12 max-w-3xl">
      <h1 class="text-3xl font-black text-gray-800 dark:text-white mb-8">Política de Privacidade</h1>
      <div class="prose prose-pink prose-lg text-gray-600 dark:text-gray-300 whitespace-pre-line bg-white dark:bg-brand-darksurface p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
        {{ store.institutional().privacyText }}
      </div>
    </div>
  `
})
export class PrivacyComponent {
  store = inject(StoreService);
}
