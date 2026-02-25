import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService, InstitutionalMedia } from '../../services/store.service';
import { Title } from '@angular/platform-browser';
import { IconComponent } from '../../ui/icons';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="container mx-auto px-4 py-16 max-w-4xl">
      <div class="text-center mb-16 animate-fade-in">
         <span class="text-brand-pink font-bold text-sm uppercase tracking-widest mb-2 block">Nossa História</span>
         <h1 class="text-4xl lg:text-5xl font-black text-brand-dark dark:text-white mb-6">{{ store.institutional().aboutTitle }}</h1>
      </div>
      
      <div class="grid md:grid-cols-2 gap-12 items-center mb-20 animate-slide-up">
        <div class="relative h-[400px] rounded-3xl overflow-hidden shadow-xl group bg-gray-100">
           @if (currentMedia(); as media) {
             @if (media.type === 'video') {
               <video [src]="media.url"
                      class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      autoplay
                      loop
                      muted
                      playsinline
                      (mouseenter)="onMediaHoverStart($any($event.target), media.playAudioOnHover)"
                      (mouseleave)="onMediaHoverEnd($any($event.target))"></video>
             } @else {
               <img [src]="media.url"
                    (error)="handleImageError($event)"
                    class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    alt="Quem Somos">
             }
           } @else {
             <img [src]="store.institutional().aboutImage"
                  (error)="handleImageError($event)"
                  class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  alt="Quem Somos">
           }
           <div class="absolute inset-0 bg-gradient-to-t from-brand-pink/20 to-transparent pointer-events-none"></div>

           @if (aboutMedia().length > 1) {
             <button (click)="prevMedia()" class="absolute left-3 top-1/2 -translate-y-1/2 z-20 text-white/90 hover:text-white transition-colors drop-shadow-[0_2px_6px_rgba(0,0,0,0.65)] p-1">
               <app-icon name="chevron-left" size="20px"></app-icon>
             </button>
             <button (click)="nextMedia()" class="absolute right-3 top-1/2 -translate-y-1/2 z-20 text-white/90 hover:text-white transition-colors drop-shadow-[0_2px_6px_rgba(0,0,0,0.65)] p-1">
               <app-icon name="chevron-right" size="20px"></app-icon>
             </button>
             <div class="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
               @for (item of aboutMedia(); track item.url; let i = $index) {
                 <button (click)="goToMedia(i)" class="w-2 h-2 rounded-full border border-white/70 transition-colors" [ngClass]="i === mediaIndex() ? 'bg-white' : 'bg-white/30'"></button>
               }
             </div>
           }
        </div>

        <div class="space-y-6 text-gray-600 dark:text-gray-200 leading-relaxed text-lg whitespace-pre-line">
           {{ store.institutional().aboutText }}
           
           <div class="grid grid-cols-2 gap-4 mt-6">
             <div class="bg-pink-50 dark:bg-pink-900/20 p-4 rounded-xl border border-pink-100 dark:border-pink-900/40 text-center hover:-translate-y-1 transition-transform">
               <div class="text-2xl mb-2">🚚</div>
               <h3 class="font-bold text-brand-dark dark:text-white text-sm">Entrega Rápida</h3>
             </div>
             <div class="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-900/40 text-center hover:-translate-y-1 transition-transform">
               <div class="text-2xl mb-2">💜</div>
               <h3 class="font-bold text-brand-dark dark:text-white text-sm">Atendimento Humanizado</h3>
             </div>
           </div>
        </div>
      </div>

      <div class="bg-brand-soft dark:bg-brand-darksurface rounded-3xl p-10 text-center border border-brand-pink/10 dark:border-gray-700">
        <h2 class="text-2xl font-black text-brand-dark dark:text-white mb-4">Nossa Missão</h2>
        <p class="text-gray-600 dark:text-gray-200 text-lg max-w-2xl mx-auto">"Proporcionar momentos mágicos através da moda, oferecendo produtos de alta qualidade que respeitam o conforto e a liberdade das crianças."</p>
      </div>
    </div>
  `
})
export class AboutComponent {
  store = inject(StoreService);
  title = inject(Title);
  mediaIndex = signal(0);
  aboutMedia = computed<InstitutionalMedia[]>(() => {
    const institutional = this.store.institutional();
    const list = Array.isArray(institutional.aboutMedia) ? institutional.aboutMedia : [];
    const sanitized = list
      .map(item => ({
        type: item?.type === 'video' ? 'video' as const : 'image' as const,
        url: String(item?.url || '').trim(),
        playAudioOnHover: item?.type === 'video' ? !!item?.playAudioOnHover : false
      }))
      .filter(item => item.url.length > 0);

    if (sanitized.length > 0) return sanitized;
    if (institutional.aboutImage) {
      return [{ type: 'image', url: institutional.aboutImage, playAudioOnHover: false }];
    }
    return [];
  });
  currentMedia = computed<InstitutionalMedia | null>(() => {
    const media = this.aboutMedia();
    if (!media.length) return null;
    return media[this.mediaIndex() % media.length];
  });

  constructor() {
    this.title.setTitle('Quem Somos | YARA Kids');
  }

  nextMedia() {
    const total = this.aboutMedia().length;
    if (!total) return;
    this.mediaIndex.update(v => (v + 1) % total);
  }

  prevMedia() {
    const total = this.aboutMedia().length;
    if (!total) return;
    this.mediaIndex.update(v => (v - 1 + total) % total);
  }

  goToMedia(index: number) {
    this.mediaIndex.set(index);
  }

  onMediaHoverStart(video: HTMLVideoElement, enableAudio = false) {
    if (!enableAudio) return;
    video.muted = false;
    video.play().catch(() => {});
  }

  onMediaHoverEnd(video: HTMLVideoElement) {
    video.muted = true;
  }

  handleImageError(event: any) {
    event.target.src = 'https://placehold.co/800x800/FF69B4/FFFFFF?text=Quem+Somos';
  }
}
