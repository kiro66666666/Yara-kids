
import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { Product } from './store.service';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private title = inject(Title);
  private meta = inject(Meta);

  /**
   * Define as meta tags para a página inicial ou páginas genéricas
   */
  resetSeo() {
    this.title.setTitle('YARA Kids - Moda Infantil com Amor 🎀');
    this.updateTags({
      title: 'YARA Kids - Moda Infantil',
      description: 'Encontre vestidos, conjuntos e acessórios infantis com conforto e estilo. Frete Grátis e Parcelamento sem juros.',
      image: 'https://images.unsplash.com/photo-1621452773781-0f992ee03591?w=1200&q=80', // Banner Padrão
      url: window.location.origin
    });
  }

  /**
   * Define as meta tags específicas de um produto (Crucial para compartilhamento no WhatsApp/Insta)
   */
  setProductSeo(product: Product) {
    const pageTitle = `${product.name} | YARA Kids`;
    this.title.setTitle(pageTitle);

    this.updateTags({
      title: pageTitle,
      description: product.description || `Compre ${product.name} por R$ ${product.price.toFixed(2)}. Parcele em até 6x sem juros na YARA Kids.`,
      image: product.image,
      url: `${window.location.origin}/#/produto/${product.id}`,
      type: 'product',
      price: product.price.toString(),
      currency: 'BRL'
    });
  }

  private updateTags(config: { title: string, description: string, image: string, url: string, type?: string, price?: string, currency?: string }) {
    // Meta Description (Google)
    this.meta.updateTag({ name: 'description', content: config.description });

    // Open Graph (Facebook/WhatsApp/Instagram)
    this.meta.updateTag({ property: 'og:title', content: config.title });
    this.meta.updateTag({ property: 'og:description', content: config.description });
    this.meta.updateTag({ property: 'og:image', content: config.image });
    this.meta.updateTag({ property: 'og:url', content: config.url });
    this.meta.updateTag({ property: 'og:type', content: config.type || 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: 'YARA Kids' });

    // Product Specific Data (Rich Snippets)
    if (config.price) {
      this.meta.updateTag({ property: 'product:price:amount', content: config.price });
      this.meta.updateTag({ property: 'product:price:currency', content: config.currency || 'BRL' });
    }

    // Twitter Card
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: config.title });
    this.meta.updateTag({ name: 'twitter:description', content: config.description });
    this.meta.updateTag({ name: 'twitter:image', content: config.image });
  }
}

