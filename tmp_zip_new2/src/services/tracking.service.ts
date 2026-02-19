
import { Injectable } from '@angular/core';
import { Product, CartItem } from './store.service';

// Declaração global para evitar erros de TypeScript caso os scripts não estejam carregados
declare const gtag: Function; 
declare const fbq: Function; 

@Injectable({
  providedIn: 'root'
})
export class TrackingService {

  constructor() {}

  /**
   * Evento: Visualizar Produto (view_item)
   */
  logViewItem(product: Product) {
    console.log(`📊 [Tracking] View Item: ${product.name}`);
    
    // GA4 Integration Mock
    if (typeof gtag !== 'undefined') {
      gtag('event', 'view_item', {
        currency: 'BRL',
        value: product.price,
        items: [{
          item_id: product.id,
          item_name: product.name,
          item_category: product.categoryName,
          price: product.price
        }]
      });
    }

    // Meta Pixel Integration Mock
    if (typeof fbq !== 'undefined') {
      fbq('track', 'ViewContent', {
        content_ids: [product.id],
        content_type: 'product',
        value: product.price,
        currency: 'BRL'
      });
    }
  }

  /**
   * Evento: Adicionar ao Carrinho (add_to_cart)
   */
  logAddToCart(product: Product, size: string, color: string) {
    console.log(`📊 [Tracking] Add To Cart: ${product.name} (${size}/${color})`);

    if (typeof gtag !== 'undefined') {
      gtag('event', 'add_to_cart', {
        currency: 'BRL',
        value: product.price,
        items: [{
          item_id: product.id,
          item_name: product.name,
          variant: `${size}-${color}`,
          price: product.price
        }]
      });
    }

    if (typeof fbq !== 'undefined') {
      fbq('track', 'AddToCart', {
        content_ids: [product.id],
        content_type: 'product',
        value: product.price,
        currency: 'BRL'
      });
    }
  }

  /**
   * Evento: Iniciar Checkout (begin_checkout)
   */
  logBeginCheckout(total: number, items: CartItem[]) {
    console.log(`📊 [Tracking] Begin Checkout: R$ ${total}`);
    
    if (typeof gtag !== 'undefined') {
      gtag('event', 'begin_checkout', {
        currency: 'BRL',
        value: total,
        items: items.map(i => ({ item_id: i.id, item_name: i.name, price: i.price }))
      });
    }

    if (typeof fbq !== 'undefined') {
      fbq('track', 'InitiateCheckout', {
        value: total,
        currency: 'BRL',
        num_items: items.length
      });
    }
  }

  /**
   * Evento: Compra Realizada (purchase)
   */
  logPurchase(orderId: string, total: number, items: CartItem[]) {
    console.log(`📊 [Tracking] Purchase Completed: #${orderId} - R$ ${total}`);

    if (typeof gtag !== 'undefined') {
      gtag('event', 'purchase', {
        transaction_id: orderId,
        value: total,
        currency: 'BRL',
        tax: 0,
        shipping: 0,
        items: items.map(i => ({ item_id: i.id, item_name: i.name, price: i.price, quantity: i.quantity }))
      });
    }

    if (typeof fbq !== 'undefined') {
      fbq('track', 'Purchase', {
        value: total,
        currency: 'BRL',
        content_ids: items.map(i => i.id),
        content_type: 'product'
      });
    }
  }
}
