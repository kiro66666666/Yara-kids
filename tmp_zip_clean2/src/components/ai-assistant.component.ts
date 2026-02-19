
import { Component, inject, signal, ViewChild, ElementRef, AfterViewChecked, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../ui/icons';
import { AiService } from '../services/ai.service';
import { StoreService } from '../services/store.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, RouterLink],
  template: `
    <!-- Floating Button -->
    <button (click)="toggleChat()" 
      class="fixed bottom-20 right-4 lg:bottom-8 lg:right-8 z-40 w-14 h-14 bg-gradient-to-tr from-brand-pink to-purple-500 text-white rounded-full shadow-floating flex items-center justify-center hover:scale-110 transition-transform duration-300 group border-2 border-white dark:border-brand-darksurface">
      @if (!isOpen()) {
        <span class="text-2xl group-hover:animate-bounce-gentle">✨</span>
      } @else {
        <app-icon name="chevron-down" size="24px"></app-icon>
      }
      <!-- Pulse Effect -->
      @if (!isOpen()) {
        <span class="absolute -inset-1 rounded-full bg-brand-pink opacity-30 animate-ping"></span>
      }
    </button>

    <!-- Chat Window -->
    @if (isOpen()) {
      <div class="fixed bottom-36 right-4 lg:bottom-24 lg:right-8 z-40 w-[90vw] max-w-[350px] bg-white dark:bg-brand-darksurface rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden animate-slide-up h-[500px] max-h-[70vh]">
        
        <!-- Header -->
        <div class="bg-gradient-to-r from-brand-pink to-purple-500 p-4 flex items-center gap-3 text-white shrink-0">
          <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            🤖
          </div>
          <div>
            <h3 class="font-bold text-sm">Assistente YARA</h3>
            <p class="text-[10px] opacity-90 flex items-center gap-1"><span class="w-1.5 h-1.5 bg-green-400 rounded-full"></span> Online com Estoque</p>
          </div>
          <button (click)="toggleChat()" class="ml-auto text-white/80 hover:text-white"><app-icon name="x" size="18px"></app-icon></button>
        </div>

        <!-- Messages Area -->
        <div class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800/50 scroll-smooth" #scrollContainer>
          @for (msg of aiService.messages(); track $index) {
            <div class="flex flex-col gap-2" [class.items-end]="msg.role === 'user'">
              
              <div class="flex gap-2 max-w-[85%]" [class.flex-row-reverse]="msg.role === 'user'">
                @if (msg.role === 'model') {
                  <div class="w-8 h-8 rounded-full bg-brand-soft flex items-center justify-center text-sm shrink-0 border border-brand-pink/20">🤖</div>
                }

                <div class="p-3 rounded-2xl text-sm leading-relaxed shadow-sm break-words"
                     [ngClass]="{
                       'bg-brand-pink text-white rounded-tr-none': msg.role === 'user',
                       'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-gray-600': msg.role === 'model'
                     }">
                  <!-- Renderiza texto progressivamente -->
                  <span [innerHTML]="formatText(msg.text)"></span>
                  @if (msg.role === 'model' && msg.text === '' && aiService.isLoading()) {
                     <span class="animate-pulse">...</span>
                  }
                </div>
              </div>

              <!-- Product Recommendation Card (Parsed from Tag) -->
              @if (msg.role === 'model' && extractProductId(msg.text); as recId) {
                @if (getProduct(recId); as product) {
                  <div class="bg-white dark:bg-gray-800 p-3 rounded-2xl border border-brand-pink/30 shadow-md max-w-[200px] ml-10 animate-fade-in group hover:border-brand-pink transition-colors">
                     <div class="relative aspect-square rounded-lg overflow-hidden mb-2 bg-gray-100">
                       <img [src]="product.image" class="w-full h-full object-cover">
                       <div class="absolute bottom-1 right-1 bg-white/90 dark:bg-black/70 px-1.5 py-0.5 rounded text-[10px] font-bold">R$ {{ product.price.toFixed(2) }}</div>
                     </div>
                     <h4 class="font-bold text-xs text-gray-800 dark:text-white line-clamp-1 mb-1">{{ product.name }}</h4>
                     <a [routerLink]="['/produto', product.id]" (click)="toggleChat()" class="block w-full text-center bg-brand-pink text-white text-[10px] font-bold py-1.5 rounded-lg hover:bg-pink-600 transition-colors">
                       Ver Detalhes
                     </a>
                  </div>
                }
              }

            </div>
          }
        </div>

        <!-- Input Area -->
        <div class="p-3 bg-white dark:bg-brand-darksurface border-t border-gray-100 dark:border-gray-700 shrink-0">
          <form (submit)="sendMessage()" class="flex gap-2">
            <input type="text" [(ngModel)]="currentMessage" name="message" 
                   placeholder="Pergunte sobre a loja..." 
                   class="flex-1 bg-gray-100 dark:bg-gray-800 border-0 rounded-full px-4 py-3 text-sm focus:ring-2 focus:ring-brand-pink/50 outline-none dark:text-white"
                   [disabled]="aiService.isLoading()">
            <button type="submit" [disabled]="!currentMessage.trim() || aiService.isLoading()" 
                    class="w-10 h-10 bg-brand-pink text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-pink-600 transition-colors shadow-md">
              <app-icon name="chevron-right" size="20px"></app-icon>
            </button>
          </form>
          <p class="text-[9px] text-center text-gray-400 mt-2">IA com acesso ao catálogo em tempo real.</p>
        </div>

      </div>
    }
  `
})
export class AiAssistantComponent implements AfterViewChecked {
  aiService = inject(AiService);
  store = inject(StoreService);
  isOpen = signal(false);
  currentMessage = '';

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  constructor() {
    // Effect para forçar scroll sempre que a mensagem mudar (streaming)
    effect(() => {
        this.aiService.messages();
        setTimeout(() => this.scrollToBottom(), 50); // Pequeno delay para renderização
    });
  }

  toggleChat() {
    this.isOpen.update(v => !v);
    if(this.isOpen()) setTimeout(() => this.scrollToBottom(), 100);
  }

  sendMessage() {
    if (!this.currentMessage.trim()) return;
    const msg = this.currentMessage;
    this.currentMessage = '';
    this.aiService.sendMessage(msg);
  }

  ngAfterViewChecked() {
    // Mantém o scroll manual se necessário, mas o effect cuida do streaming
  }

  scrollToBottom(): void {
    if (this.scrollContainer) {
      try {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      } catch(err) { }
    }
  }

  formatText(text: string): string {
    const cleanedText = text.replace(/\[REC:[^\]]+\]/g, '');
    return cleanedText.replace(/\n/g, '<br>').replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="underline font-bold text-brand-pink">Ver Link</a>');
  }

  extractProductId(text: string): string | null {
    const match = text.match(/\[REC:([^\]]+)\]/);
    return match ? match[1] : null;
  }

  getProduct(id: string) {
    return this.store.products().find(p => p.id === id);
  }
}
