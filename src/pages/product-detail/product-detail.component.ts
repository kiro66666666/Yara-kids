
import { Component, inject, computed, signal, OnInit, ViewChild, ElementRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { StoreService } from '../../services/store.service';
import { CartAnimationService } from '../../services/cart-animation.service';
import { SeoService } from '../../services/seo.service'; 
import { TrackingService } from '../../services/tracking.service'; 
import { IconComponent } from '../../ui/icons';
import { NotifyStockComponent } from '../../components/notify-stock.component';
import { SizeGuideComponent } from '../../components/size-guide.component';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ProductCardComponent } from '../../components/product-card.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, IconComponent, FormsModule, RouterLink, NotifyStockComponent, SizeGuideComponent, ProductCardComponent],
  template: `
    @if (product()) {
      <div class="bg-white dark:bg-brand-darkbg min-h-screen pb-40 lg:pb-24 transition-colors duration-300">
        <div class="w-full max-w-[1280px] mx-auto px-4 lg:px-6 py-4 lg:py-10">
          
          <!-- Breadcrumb -->
          <nav class="hidden md:flex text-xs font-medium text-gray-400 mb-8 overflow-x-auto whitespace-nowrap">
            <a routerLink="/" class="hover:text-brand-pink transition-colors">Início</a>
            <span class="mx-2">/</span>
            <a routerLink="/catalogo" class="hover:text-brand-pink transition-colors">Produtos</a>
            <span class="mx-2">/</span>
            <span class="text-brand-dark dark:text-gray-200">{{ product()!.name }}</span>
          </nav>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 xl:gap-24 mb-16 items-start">
            
            <!-- Gallery Section (Sticky on Desktop) -->
            <div class="flex flex-col gap-4 lg:sticky lg:top-24">
              
              <!-- Main Image Container -->
              <div class="aspect-[3/4] rounded-3xl overflow-hidden bg-gray-50 dark:bg-gray-800 shadow-sm relative group w-full border border-gray-100 dark:border-gray-700 cursor-zoom-in"
                   (mousemove)="onMouseMove($event)"
                   (mouseleave)="onMouseLeave()"
                   (touchstart)="onTouchStart($event)"
                   (touchend)="onTouchEnd($event)">
                
                @if (showVideo() && videoUrlSafe()) {
                   <iframe [src]="videoUrlSafe()" class="w-full h-full" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                } @else {
                   <img #productImage 
                        [src]="currentImage() || product()!.image" 
                        [alt]="product()!.name" 
                        (error)="handleImageError($event)" 
                        class="w-full h-full object-cover transition-transform duration-200"
                        [style.transform-origin]="zoomOrigin"
                        [style.transform]="zoomTransform">
                }

                <div class="absolute top-4 left-4 pointer-events-none">
                  @if (product()!.discount > 0) {
                    <span class="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-sm">
                      -{{ product()!.discount }}%
                    </span>
                  }
                </div>

                <!-- Mobile Swipe Hint -->
                <div class="lg:hidden absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1 pointer-events-none">
                   @for(img of getAllImages(); track $index) {
                     <div class="w-1.5 h-1.5 rounded-full transition-colors" [class.bg-white]="currentImage() === img" [ngClass]="{'bg-white/40': currentImage() !== img}"></div>
                   }
                </div>
              </div>
              
              <!-- Thumbnails -->
              <div class="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                <!-- 1. Main Image Thumb -->
                <div (click)="setMainImage(product()!.image)" class="w-20 h-20 rounded-xl overflow-hidden cursor-pointer border-2 hover:border-brand-pink transition-all flex-shrink-0 relative" [class.border-brand-pink]="currentImage() === product()!.image && !showVideo()" [class.border-transparent]="currentImage() !== product()!.image">
                   <img [src]="product()!.image" (error)="handleImageError($event)" class="w-full h-full object-cover">
                </div>

                <!-- 2. Video Thumb (If exists) -->
                @if (product()!.video) {
                   <div (click)="playVideo()" class="w-20 h-20 rounded-xl overflow-hidden cursor-pointer border-2 hover:border-brand-pink transition-all flex-shrink-0 bg-black flex items-center justify-center relative" [class.border-brand-pink]="showVideo()" [class.border-transparent]="!showVideo()">
                     <div class="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center backdrop-blur-sm">
                       <div class="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1"></div>
                     </div>
                     <span class="absolute bottom-1 text-[8px] text-white font-bold uppercase tracking-wider">Vídeo</span>
                   </div>
                }
                
                <!-- 3. Gallery Thumbs -->
                @for (img of product()!.gallery; track img) {
                   @if(img !== product()!.image) {
                     <div (click)="setMainImage(img)" class="w-20 h-20 rounded-xl overflow-hidden cursor-pointer border-2 hover:border-brand-pink transition-all flex-shrink-0" [class.border-brand-pink]="currentImage() === img && !showVideo()" [class.border-transparent]="currentImage() !== img">
                       <img [src]="img" (error)="handleImageError($event)" class="w-full h-full object-cover">
                     </div>
                   }
                }
              </div>
            </div>

            <!-- Product Info Section -->
            <div class="flex flex-col">
              <div class="flex justify-between items-start gap-3">
                <h1 class="text-2xl lg:text-4xl font-black text-brand-dark dark:text-white mb-2 leading-tight">{{ product()!.name }}</h1>
                <div class="flex items-center gap-2">
                  <button (click)="openShare()" class="p-3 rounded-full bg-gray-50 dark:bg-gray-800 hover:bg-brand-soft dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700" aria-label="Compartilhar produto">
                    <app-icon name="share" size="22px"></app-icon>
                  </button>
                  <button (click)="toggleFavorite()" class="p-3 rounded-full bg-gray-50 dark:bg-gray-800 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors border border-gray-100 dark:border-gray-700" [class.text-brand-pink]="store.isFavorite(product()!.id)" [class.text-gray-600]="!store.isFavorite(product()!.id)" [class.dark:text-gray-300]="!store.isFavorite(product()!.id)" aria-label="Favoritar produto">
                    <app-icon name="heart" size="24px" [class.fill-current]="store.isFavorite(product()!.id)"></app-icon>
                  </button>
                </div>
              </div>
              
              <div class="flex items-center gap-3 mb-6">
                <div class="flex text-brand-yellow">
                   @for(i of [1,2,3,4,5]; track i) {
                     <app-icon name="star" size="16px" [class.fill-current]="i <= product()!.rating" [class.text-gray-200]="i > product()!.rating"></app-icon>
                   }
                </div>
                <span class="text-xs font-medium text-gray-500 dark:text-gray-400 underline decoration-gray-300 dark:decoration-gray-600 underline-offset-4 cursor-pointer hover:text-brand-pink">{{ product()!.reviews }} Avaliações</span>
              </div>

              <!-- Price -->
              <div class="mb-8 bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-700">
                 <div class="flex items-baseline gap-3 mb-1">
                   @if (product()!.discount > 0) {
                     <span class="text-sm text-gray-400 line-through">R$ {{ product()!.originalPrice.toFixed(2) }}</span>
                   }
                   <span class="text-4xl font-black text-brand-dark dark:text-white">R$ {{ product()!.price.toFixed(2) }}</span>
                 </div>
                 <p class="text-sm text-green-600 dark:text-green-400 font-bold flex items-center gap-2">
                   <app-icon name="check" size="14px"></app-icon> 5% de desconto no PIX
                 </p>
                 <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                   ou em até <span class="font-bold">6x de R$ {{ (product()!.price / 6).toFixed(2) }}</span> sem juros no cartão
                 </p>
                 
                 <!-- Variant Stock Display -->
                 <div class="mt-4 text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    Estoque: 
                    @if(currentStock() > 5) {
                      <span class="text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded">{{ currentStock() }} unidades disponíveis</span>
                    } @else if (currentStock() > 0) {
                      <span class="text-orange-500 bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 rounded animate-pulse">🔥 Corra! Restam apenas {{ currentStock() }}</span>
                    } @else {
                      <span class="text-red-500 bg-red-100 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded">
                        {{ (selectedSize() && selectedColor()) ? 'Combinação Esgotada' : 'Esgotado' }}
                      </span>
                    }
                 </div>
              </div>

              <!-- Selectors (Only if global stock > 0) -->
              @if (product()!.stock > 0) {
                <div class="space-y-8 mb-10">
                  <!-- Colors -->
                  <div>
                    <label class="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-3 block">Cor: <span class="text-brand-pink">{{ selectedColor() || 'Selecione' }}</span></label>
                    <div class="flex gap-3">
                      @for (color of product()!.colors; track color.name) {
                        <button (click)="selectedColor.set(color.name)"
                          class="group relative w-12 h-12 rounded-full focus:outline-none transition-transform active:scale-95 ring-2 ring-offset-2 dark:ring-offset-brand-darkbg"
                          [class.ring-brand-pink]="selectedColor() === color.name"
                          [class.ring-transparent]="selectedColor() !== color.name">
                          <div class="w-full h-full rounded-full border border-black/10 dark:border-white/10 shadow-sm" [style.background-color]="color.hex"></div>
                        </button>
                      }
                    </div>
                  </div>

                  <!-- Sizes -->
                  <div>
                    <div class="flex justify-between items-center mb-3">
                      <label class="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">Tamanho: <span class="text-brand-pink">{{ selectedSize() || 'Selecione' }}</span></label>
                      <button (click)="showSizeGuide.set(true)" class="text-xs font-bold text-gray-400 dark:text-gray-500 underline decoration-dotted hover:text-brand-dark dark:hover:text-white">Tabela de Medidas</button>
                    </div>
                    <div class="flex flex-wrap gap-3">
                      @for (size of product()!.sizes; track size) {
                        <!-- Check stock for this specific size if color is selected -->
                        @let isAvailable = checkAvailability(size);
                        <button (click)="isAvailable ? selectedSize.set(size) : null" 
                          [disabled]="!isAvailable"
                          [class.bg-brand-dark]="selectedSize() === size"
                          [class.text-white]="selectedSize() === size"
                          [class.border-brand-dark]="selectedSize() === size"
                          [class.bg-white]="selectedSize() !== size && isAvailable"
                          [class.text-gray-700]="selectedSize() !== size && isAvailable"
                          [class.dark:bg-gray-800]="selectedSize() !== size && isAvailable"
                          [class.dark:text-gray-200]="selectedSize() !== size && isAvailable"
                          [class.dark:border-gray-600]="selectedSize() !== size && isAvailable"
                          [class.opacity-40]="!isAvailable"
                          [class.cursor-not-allowed]="!isAvailable"
                          [class.line-through]="!isAvailable"
                          class="w-14 h-12 rounded-xl border border-gray-200 flex items-center justify-center font-bold text-sm hover:border-brand-dark hover:text-brand-dark dark:hover:border-white dark:hover:text-white transition-all shadow-sm">
                          {{ size }}
                        </button>
                      }
                    </div>
                  </div>
                </div>

                <!-- Desktop Actions -->
                <div class="hidden lg:flex gap-4">
                  <button (click)="addToCart()" 
                    [disabled]="!selectedSize() || !selectedColor() || currentStock() === 0"
                    class="flex-1 bg-white dark:bg-transparent border-2 border-brand-pink text-brand-pink font-bold py-4 rounded-2xl hover:bg-brand-soft dark:hover:bg-brand-pink/10 transition-all shadow-md flex items-center justify-center gap-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed">
                    <app-icon name="shopping-bag" size="22px"></app-icon>
                    <span>Adicionar à Sacola</span>
                  </button>
                  <button (click)="buyNow()" 
                    [disabled]="!selectedSize() || !selectedColor() || currentStock() === 0"
                    class="flex-1 bg-brand-pink text-white font-bold py-4 rounded-2xl hover:bg-pink-600 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg">
                    <app-icon name="check" size="22px"></app-icon>
                    <span>Comprar Agora</span>
                  </button>
                </div>
              } @else {
                <app-notify-stock [productName]="product()!.name"></app-notify-stock>
              }
              
              <!-- Share Actions -->
              <div class="mt-8 flex justify-center lg:justify-start gap-3">
                <button (click)="shareWhatsApp()" class="text-green-600 font-bold text-sm flex items-center gap-2 hover:underline bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-full border border-green-100 dark:border-green-900/30">
                  <app-icon name="whatsapp" size="18px"></app-icon> Compartilhar no WhatsApp
                </button>
                <button (click)="copyLink()" class="text-gray-700 dark:text-gray-300 font-bold text-sm flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <app-icon name="link" size="18px"></app-icon> {{ linkCopied() ? 'Link copiado' : 'Copiar link' }}
                </button>
              </div>

              <!-- Description -->
              <div class="mt-10 pt-8 border-t border-gray-100 dark:border-gray-700">
                <h3 class="font-bold text-brand-dark dark:text-white mb-4 text-lg">Detalhes do Produto</h3>
                <p class="text-gray-600 dark:text-gray-300 leading-relaxed text-sm bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-700">{{ product()!.description }}</p>
              </div>

            </div>
          </div>

          <!-- Reviews Section -->
          <div class="border-t border-gray-100 dark:border-gray-700 pt-16 max-w-4xl mb-16" id="reviews">
            <h2 class="text-3xl font-black text-gray-800 dark:text-white mb-8 flex items-center gap-3">
              <span class="w-2 h-8 bg-brand-yellow rounded-full"></span> Avaliações
            </h2>

            <!-- Add Review Form (Conditional) -->
             @if (canReview()) {
               <div class="bg-brand-soft/50 dark:bg-gray-800/50 p-6 rounded-3xl border border-brand-pink/20 mb-8 animate-fade-in">
                 <h3 class="font-bold text-brand-dark dark:text-white mb-4">Deixe sua avaliação</h3>
                 
                 <div class="mb-4">
                   <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Nota</label>
                   <div class="flex gap-2">
                     @for(i of [1,2,3,4,5]; track i) {
                       <button (click)="newRating.set(i)" class="text-2xl transition-transform hover:scale-110">
                         <app-icon name="star" size="24px" [class.fill-brand-yellow]="i <= newRating()" [class.text-brand-yellow]="i <= newRating()" [class.text-gray-300]="i > newRating()"></app-icon>
                       </button>
                     }
                   </div>
                 </div>

                 <div class="mb-4">
                    <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Comentário</label>
                    <textarea [(ngModel)]="newComment" rows="3" class="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-brand-pink focus:ring-1 focus:ring-brand-pink outline-none resize-none" placeholder="O que você achou do produto?"></textarea>
                 </div>

                 <button (click)="submitReview()" [disabled]="!newComment.trim()" class="px-6 py-2 bg-brand-pink text-white font-bold rounded-xl hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg">
                   Enviar Avaliação
                 </button>
               </div>
             } @else if (!store.user()) {
               <div class="bg-gray-50 dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 mb-8 text-center">
                 <p class="text-gray-500 dark:text-gray-400 text-sm mb-2">Para avaliar este produto, você precisa estar logado e ter comprado o item.</p>
                 <a routerLink="/login" class="text-brand-pink font-bold hover:underline text-sm">Fazer Login</a>
               </div>
             }

            <!-- Review List -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              @for (review of reviews(); track review.id) {
                <div class="bg-white dark:bg-brand-darksurface p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                  <div class="flex items-center gap-4 mb-4">
                     <div class="w-12 h-12 bg-gradient-to-br from-brand-pink to-brand-lilac text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md uppercase">
                       {{ review.user.charAt(0) }}
                     </div>
                     <div>
                       <p class="font-bold text-gray-800 dark:text-gray-200">{{ review.user }}</p>
                       <div class="flex items-center gap-2">
                         <div class="flex text-brand-yellow">
                           @for(i of [1,2,3,4,5]; track i) {
                             <app-icon name="star" size="12px" [class.fill-current]="i <= review.rating" [class.text-gray-200]="i > review.rating"></app-icon>
                           }
                         </div>
                         <p class="text-xs text-gray-400">{{ review.date }}</p>
                       </div>
                     </div>
                  </div>
                  <p class="text-gray-600 dark:text-gray-300 text-sm mb-4 italic">"{{ review.comment }}"</p>
                  @if (review.image) {
                    <div class="w-24 h-24 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 cursor-pointer">
                      <img [src]="review.image" (error)="handleImageError($event)" class="w-full h-full object-cover hover:scale-110 transition-transform duration-500">
                    </div>
                  }
                </div>
              }
              @if (reviews().length === 0) {
                 <p class="text-gray-400 italic">Nenhuma avaliação ainda. Seja o primeiro a avaliar!</p>
              }
            </div>
          </div>

          <!-- Recently Viewed Section (NEW) -->
          @if (relatedProducts().length > 0) {
            <div class="border-t border-gray-100 dark:border-gray-700 pt-12 animate-slide-up">
               <h2 class="text-2xl font-black text-gray-800 dark:text-white mb-8">Vistos Recentemente</h2>
               <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                 @for (prod of relatedProducts(); track prod.id) {
                   <app-product-card [product]="prod"></app-product-card>
                 }
               </div>
            </div>
          }

        </div>
      </div>

      <!-- Mobile Sticky Footer with Safe Area -->
      <div class="lg:hidden fixed bottom-[60px] left-0 right-0 bg-white/95 dark:bg-brand-darksurface/95 backdrop-blur border-t border-gray-200 dark:border-gray-800 p-4 z-40 pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.1)] transition-colors">
        @if (product()!.stock > 0) {
          <div class="flex gap-4 items-center">
             <div class="flex flex-col">
               <span class="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase">Total</span>
               <span class="text-2xl font-black text-brand-dark dark:text-white">R$ {{ product()!.price.toFixed(2) }}</span>
             </div>
             <button (click)="buyNow()" 
                [disabled]="!selectedSize() || !selectedColor() || currentStock() === 0"
                class="flex-1 bg-brand-pink text-white font-bold py-3.5 rounded-2xl hover:bg-pink-600 transition-all shadow-lg shadow-pink-200/50 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 text-sm">
                COMPRAR AGORA
             </button>
          </div>
        } @else {
          <div class="text-center text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
            Produto Indisponível
          </div>
        }
      </div>

      <!-- Size Guide Modal -->
      <app-size-guide [isOpen]="showSizeGuide()" (close)="showSizeGuide.set(false)"></app-size-guide>

      @if (showShareModal()) {
        <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" (click)="closeShare()">
          <div class="bg-white dark:bg-brand-darksurface rounded-2xl w-full max-w-xs shadow-2xl p-6 relative animate-slide-up border border-gray-100 dark:border-gray-700" (click)="$event.stopPropagation()">
            <button type="button" (click)="closeShare()" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white">
              <app-icon name="x" size="20px"></app-icon>
            </button>

            <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-4 text-center">Compartilhar</h3>

            <div class="flex flex-col gap-3">
              <button type="button" (click)="shareWhatsApp()" class="flex items-center gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors font-bold text-sm">
                <app-icon name="whatsapp" size="20px"></app-icon>
                <span>Enviar no WhatsApp</span>
              </button>

              <button type="button" (click)="copyLink()" class="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-bold text-sm relative">
                <app-icon name="link" size="20px"></app-icon>
                <span>{{ linkCopied() ? 'Link Copiado!' : 'Copiar Link' }}</span>
                @if(linkCopied()) {
                  <span class="absolute right-3 text-green-500"><app-icon name="check" size="16px"></app-icon></span>
                }
              </button>
            </div>
          </div>
        </div>
      }

    } @else {
      <div class="min-h-screen flex flex-col items-center justify-center bg-brand-light dark:bg-brand-darkbg">
        <div class="w-16 h-16 border-4 border-brand-pink border-t-transparent rounded-full animate-spin mb-4"></div>
        <p class="text-gray-500 dark:text-gray-400 font-bold">Carregando produto...</p>
      </div>
    }
  `,
  styles: [`
    .pb-safe {
      padding-bottom: max(0.5rem, env(safe-area-inset-bottom, 10px));
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  route = inject(ActivatedRoute);
  store = inject(StoreService);
  router = inject(Router);
  cartAnimation = inject(CartAnimationService);
  sanitizer = inject(DomSanitizer);
  seo = inject(SeoService); // Added SEO
  tracking = inject(TrackingService); // Added Tracking
  
  @ViewChild('productImage') productImage!: ElementRef;
  
  productId = signal<string>('');
  product = computed(() => this.store.products().find(p => p.id === this.productId()));
  reviews = computed(() => this.store.getReviews(this.productId()));
  
  // Review Logic
  canReview = computed(() => this.store.canReview(this.productId()));
  newRating = signal(5);
  newComment = '';

  selectedSize = signal<string>('');
  selectedColor = signal<string>('');
  currentImage = signal<string | null>(null);
  showVideo = signal(false);
  showSizeGuide = signal<boolean>(false);
  showShareModal = signal<boolean>(false);
  linkCopied = signal<boolean>(false);

  // Zoom Logic
  zoomOrigin = '50% 50%';
  zoomTransform = 'scale(1)';

  // Touch Logic
  touchStartX = 0;
  touchEndX = 0;

  // Computed Stock based on Variant Selection
  currentStock = computed(() => {
    const p = this.product();
    if (!p) return 0;
    
    // If no selection, return sum of all variants or global stock
    if (!this.selectedSize() || !this.selectedColor()) {
       return p.stock;
    }

    // Return specific variant stock
    return this.store.getVariantStock(p, this.selectedSize(), this.selectedColor());
  });

  videoUrlSafe = computed(() => {
    const vid = this.product()?.video;
    if (!vid) return null;
    return this.sanitizer.bypassSecurityTrustResourceUrl(vid);
  });

  // Recent Products Logic: Show history BUT exclude current product to avoid redundancy
  relatedProducts = computed(() => {
      const currentId = this.productId();
      return this.store.recentProducts().filter(p => p.id !== currentId);
  });

  constructor() {
      // Effect to track history and SEO when product loads
      effect(() => {
          const p = this.product();
          if (p) {
              // Add to history (wrapped in timeout to avoid change detection errors during render)
              setTimeout(() => {
                this.store.addToRecent(p);
                this.seo.setProductSeo(p); // Update SEO
                this.tracking.logViewItem(p); // Track View
              }, 0);
          }
      });

      // NEW EFFECT: Update Main Image when Color Changes
      effect(() => {
          const color = this.selectedColor();
          const prod = this.product();
          if (color && prod && prod.colorImages) {
              const matchedImage = prod.colorImages.find(ci => ci.color === color);
              if (matchedImage) {
                  this.setMainImage(matchedImage.image);
              }
          }
      }, { allowSignalWrites: true });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.productId.set(params['id']);
      this.selectedSize.set('');
      this.selectedColor.set('');
      this.currentImage.set(null);
      this.showVideo.set(false);
      this.newComment = ''; // Reset review
      
      // Scroll to top when navigating between products
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // --- Zoom Logic ---
  onMouseMove(e: MouseEvent) {
    // Only desktop
    if(window.innerWidth < 1024) return; 

    const target = e.currentTarget as HTMLElement;
    const { left, top, width, height } = target.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    
    this.zoomOrigin = `${x}% ${y}%`;
    this.zoomTransform = 'scale(2)'; // 2x Zoom
  }

  onMouseLeave() {
    this.zoomTransform = 'scale(1)';
    setTimeout(() => {
        this.zoomOrigin = '50% 50%'; // Reset smoothly
    }, 200);
  }

  // --- Swipe Logic (Mobile) ---
  onTouchStart(e: TouchEvent) {
    this.touchStartX = e.changedTouches[0].screenX;
  }

  onTouchEnd(e: TouchEvent) {
    this.touchEndX = e.changedTouches[0].screenX;
    this.handleSwipe();
  }

  handleSwipe() {
    const threshold = 50; // min distance
    if (this.touchEndX < this.touchStartX - threshold) {
      this.nextImage(); // Swipe Left
    }
    if (this.touchEndX > this.touchStartX + threshold) {
      this.prevImage(); // Swipe Right
    }
  }

  getAllImages() {
    const p = this.product();
    if (!p) return [];
    return [p.image, ...(p.gallery || [])].filter((v, i, a) => a.indexOf(v) === i); // Unique
  }

  nextImage() {
    const images = this.getAllImages();
    const current = this.currentImage() || this.product()?.image;
    if(!current) return;
    const index = images.indexOf(current);
    if (index < images.length - 1) {
      this.setMainImage(images[index + 1]);
    } else {
      this.setMainImage(images[0]); // Loop back
    }
  }

  prevImage() {
    const images = this.getAllImages();
    const current = this.currentImage() || this.product()?.image;
    if(!current) return;
    const index = images.indexOf(current);
    if (index > 0) {
      this.setMainImage(images[index - 1]);
    } else {
      this.setMainImage(images[images.length - 1]); // Loop to end
    }
  }

  setMainImage(img: string) {
    this.currentImage.set(img);
    this.showVideo.set(false);
  }

  playVideo() {
    this.showVideo.set(true);
  }

  // Helper to visually disable sizes if not available in current color (if selected)
  checkAvailability(size: string): boolean {
    const p = this.product();
    if (!p) return false;
    
    // If we have strict variants and a color is selected, check if this Size+Color exists
    if (p.variants && p.variants.length > 0 && this.selectedColor()) {
        const variant = p.variants.find(v => v.size === size && v.color === this.selectedColor());
        return variant ? variant.stock > 0 : false;
    }
    
    // If no color selected yet, check if this size exists in ANY variant with stock
    if (p.variants && p.variants.length > 0) {
        return p.variants.some(v => v.size === size && v.stock > 0);
    }

    // Fallback simple stock
    return p.stock > 0;
  }

  submitReview() {
    if(this.newComment.trim()) {
        this.store.addReview(this.productId(), this.newRating(), this.newComment);
        this.newComment = '';
    }
  }

  // Helper for auth check
  private checkAuth(): boolean {
    if (!this.store.user()) {
      this.store.showToast('Faça login para continuar', 'info');
      this.router.navigate(['/login']);
      return false;
    }
    if (!this.store.termsAccepted()) {
      this.store.showToast('Aceite os termos de privacidade para continuar', 'error');
      // The modal is already visible globally, no redirect needed, just block
      return false;
    }
    return true;
  }

  toggleFavorite() {
    if (this.checkAuth()) {
      this.store.toggleFavorite(this.product()!.id);
    }
  }

  addToCart() {
    if (!this.checkAuth()) return;

    const p = this.product();
    if (p && this.selectedSize() && this.selectedColor()) {
      // Trigger Animation
      if (this.productImage) {
        this.cartAnimation.animate(this.productImage.nativeElement);
      }
      
      this.store.addToCart(p, this.selectedSize(), this.selectedColor());
      this.tracking.logAddToCart(p, this.selectedSize(), this.selectedColor()); // Track Add To Cart
    }
  }

  buyNow() {
    if (!this.checkAuth()) return;

    const p = this.product();
    if (p && this.selectedSize() && this.selectedColor()) {
      this.store.addToCart(p, this.selectedSize(), this.selectedColor());
      this.tracking.logAddToCart(p, this.selectedSize(), this.selectedColor()); // Track Add To Cart
      this.router.navigate(['/checkout']);
    }
  }

  openShare() {
    this.showShareModal.set(true);
  }

  closeShare() {
    this.showShareModal.set(false);
    this.linkCopied.set(false);
  }

  getProductUrl() {
    return `${window.location.origin}/#/produto/${this.productId()}`;
  }

  shareWhatsApp() {
    const p = this.product();
    if(!p) return;
    const msg = `Olha que lindo da YARA Kids!\n\n${p.name}\nPor apenas R$ ${p.price.toFixed(2)}\n\nCompre agora: ${this.getProductUrl()}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    this.closeShare();
  }

  copyLink() {
    const url = this.getProductUrl();
    navigator.clipboard.writeText(url).then(() => {
      this.linkCopied.set(true);
      setTimeout(() => this.closeShare(), 1200);
    });
  }

  handleImageError(event: any) {
    event.target.src = 'https://placehold.co/1200x800/FF69B4/FFFFFF?text=YARA+Kids';
  }
}

