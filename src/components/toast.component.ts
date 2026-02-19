
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from '../services/store.service';
import { IconComponent } from '../ui/icons';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
      @for (toast of store.toasts(); track toast.id) {
        <!-- Added !bg-opacity-100, shadow-2xl, and border colors for distinct visibility -->
        <div class="pointer-events-auto min-w-[320px] p-4 rounded-xl shadow-2xl flex items-center gap-3 transform transition-all duration-300 animate-slide-left border border-gray-100 dark:border-gray-700 bg-white dark:bg-brand-darksurface"
             [ngClass]="{
               'border-l-4 border-l-green-500': toast.type === 'success',
               'border-l-4 border-l-red-500': toast.type === 'error',
               'border-l-4 border-l-blue-500': toast.type === 'info'
             }">
           
           @if (toast.type === 'success') {
             <div class="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center flex-shrink-0"><app-icon name="check" size="16px"></app-icon></div>
           }
           @if (toast.type === 'error') {
             <div class="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center flex-shrink-0 font-bold text-lg">!</div>
           }
           @if (toast.type === 'info') {
             <div class="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 font-bold text-lg">i</div>
           }

           <div class="flex-1">
             <p class="font-bold text-sm text-gray-800 dark:text-white leading-tight">{{ toast.message }}</p>
           </div>
           
           <!-- Close hint -->
           <div class="text-gray-300 dark:text-gray-600 text-xs">✕</div>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(20px); }
      to { opacity: 1; transform: translateX(0); }
    }
    .animate-slide-left {
      animation: slideIn 0.3s ease-out forwards;
    }
  `]
})
export class ToastComponent {
  store = inject(StoreService);
}

