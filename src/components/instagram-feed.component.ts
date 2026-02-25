
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../ui/icons';
import { StoreService } from '../services/store.service';

@Component({
  selector: 'app-instagram-feed',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <section class="py-16 bg-white dark:bg-brand-darksurface transition-colors duration-300 pb-32">
      <div class="container mx-auto px-6">
        <div class="text-center mb-10">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-pink-50 dark:bg-pink-900/20 text-brand-pink rounded-full text-[10px] font-black uppercase tracking-widest mb-3 border border-pink-100 dark:border-pink-900/30">
            <span class="text-base">📸</span> Momentos Mágicos
          </div>
          <h2 class="text-3xl font-black text-gray-800 dark:text-white mb-2">
            Siga <span class="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">{{ '@' }}yarakids_moda_infantil</span>
          </h2>
          <p class="text-gray-500 dark:text-gray-400 text-sm font-medium">Inspirações reais de clientes reais. Marque a gente!</p>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4">
           @for (post of store.instagramPosts(); track post.id) {
             <a [href]="store.institutional().instagramUrl" target="_blank" class="group relative aspect-square rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-all duration-300">
               @if (post.media_type === 'video' && post.video_url) {
                 <video #mediaVideo [src]="post.video_url" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" autoplay loop muted playsinline (mouseenter)="enableVideoAudio(mediaVideo, post.play_audio_on_hover)" (mouseleave)="disableVideoAudio(mediaVideo)"></video>
                 @if (post.play_audio_on_hover) {
                   <span class="absolute top-2 left-2 px-2 py-1 rounded-full bg-black/60 text-white text-[10px] font-black uppercase tracking-wide">som</span>
                 }
               } @else {
                 <img [src]="post.image_url" (error)="handleImageError($event)" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
               }
               <!-- Overlay -->
               <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1 backdrop-blur-[2px]">
                 <app-icon name="heart" size="28px" class="fill-white drop-shadow-md"></app-icon>
                 <span class="font-bold text-sm drop-shadow-md">{{ post.likes }}</span>
               </div>
             </a>
           }
        </div>

        <div class="text-center mt-12">
          <a [href]="store.institutional().instagramUrl" target="_blank" class="inline-flex items-center gap-3 px-8 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-white font-bold rounded-full hover:bg-white hover:border-brand-pink hover:text-brand-pink dark:hover:bg-gray-700 transition-all shadow-sm hover:shadow-md text-sm">
            <div class="w-6 h-6 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 rounded-lg text-white flex items-center justify-center">
              <app-icon name="instagram" size="14px"></app-icon>
            </div>
            Ver Perfil Completo
          </a>
        </div>
      </div>
    </section>
  `
})
export class InstagramFeedComponent {
  store = inject(StoreService);

  enableVideoAudio(video: HTMLVideoElement, allowAudio = false) {
    if (!allowAudio) return;
    video.muted = false;
    video.play().catch(() => {});
  }

  disableVideoAudio(video: HTMLVideoElement) {
    video.muted = true;
  }

  handleImageError(event: any) {
    event.target.src = 'https://placehold.co/400x400/FF69B4/FFFFFF?text=Insta+YARA';
  }
}

