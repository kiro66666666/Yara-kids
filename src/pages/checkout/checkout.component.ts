
import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from '../../services/store.service';
import { PaymentService, InstallmentOption } from '../../services/payment.service';
import { TrackingService } from '../../services/tracking.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IconComponent } from '../../ui/icons';
import { MaskDirective } from '../../directives/mask.directive';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, MaskDirective],
  template: `
    <div class="min-h-screen bg-gray-50 pb-32 lg:pb-20">
      <!-- Checkout Header -->
      <div class="bg-white border-b border-gray-200 py-4 mb-8 sticky top-0 z-30 shadow-sm">
        <div class="container mx-auto px-6 flex items-center justify-between">
           <div class="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-pink to-brand-lilac cursor-pointer" (click)="goHome()">YARA Kids</div>
           <div class="flex items-center gap-2 text-green-600 text-xs font-bold bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
             <app-icon name="check" size="14px"></app-icon> Ambiente 100% Seguro
           </div>
        </div>
      </div>

      <div class="container mx-auto px-4 max-w-5xl">
        
        @if (!orderComplete) {
          <div class="flex flex-col lg:flex-row gap-8 animate-fade-in">
            <!-- Left Column: Forms -->
            <div class="flex-1 space-y-6">
               <h1 class="text-2xl font-black text-gray-800 mb-2">Finalizar Compra</h1>

               <!-- Step 1: Data -->
               <div class="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
                  <h3 class="font-bold text-lg mb-6 flex items-center gap-3 text-brand-dark">
                    <span class="w-8 h-8 bg-brand-dark text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">1</span> 
                    Dados Pessoais
                  </h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                     <div class="md:col-span-2">
                       <label class="text-xs font-bold text-gray-500 uppercase ml-1 mb-1.5 block">Nome Completo</label>
                       <input type="text" [(ngModel)]="customerName" class="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20 outline-none transition-all font-medium text-gray-700" placeholder="Como devemos te chamar?">
                     </div>
                     <div>
                       <label class="text-xs font-bold text-gray-500 uppercase ml-1 mb-1.5 block">WhatsApp</label>
                       <input type="text" appMask="phone" [(ngModel)]="customerPhone" placeholder="(00) 00000-0000" class="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20 outline-none transition-all font-medium text-gray-700">
                     </div>
                     <div>
                       <label class="text-xs font-bold text-gray-500 uppercase ml-1 mb-1.5 block">CPF</label>
                       <input type="text" appMask="cpf" [(ngModel)]="customerCpf" placeholder="000.000.000-00" class="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20 outline-none transition-all font-medium text-gray-700">
                     </div>
                  </div>
               </div>

               <!-- Step 2: Address -->
               <div class="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
                  <h3 class="font-bold text-lg mb-6 flex items-center gap-3 text-brand-dark">
                    <span class="w-8 h-8 bg-brand-dark text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">2</span> 
                    Entrega
                  </h3>
                  
                  <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                     <div class="md:col-span-4 flex flex-col sm:flex-row gap-3 sm:items-end">
                        <div class="flex-1 relative">
                           <label class="text-xs font-bold text-gray-500 uppercase ml-1 mb-1.5 block">CEP</label>
                           <div class="relative">
                             <input type="text" appMask="cep" [(ngModel)]="cep" (blur)="searchCep()" placeholder="00000-000" maxlength="9" class="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-brand-pink outline-none font-medium">
                             <div *ngIf="loadingCep" class="absolute right-3 top-3.5">
                               <div class="w-5 h-5 border-2 border-brand-pink border-t-transparent rounded-full animate-spin"></div>
                             </div>
                           </div>
                        </div>
                        <a href="https://buscacepinter.correios.com.br/app/endereco/index.php" target="_blank" class="text-xs font-bold text-brand-pink hover:underline mb-4 sm:mb-4 whitespace-nowrap">
                          Não sei meu CEP
                        </a>
                     </div>

                     <div class="md:col-span-3">
                       <label class="text-xs font-bold text-gray-500 uppercase ml-1 mb-1.5 block">Endereço</label>
                       <input type="text" [(ngModel)]="address" placeholder="Rua, Avenida..." class="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-brand-pink outline-none font-medium transition-colors" [class.bg-green-50]="addressFilled" [disabled]="addressFilled">
                     </div>
                     <div class="md:col-span-1">
                        <label class="text-xs font-bold text-gray-500 uppercase ml-1 mb-1.5 block">Número</label>
                        <input type="text" [(ngModel)]="addressNumber" placeholder="123" class="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-brand-pink outline-none font-medium">
                     </div>
                     <div class="md:col-span-4">
                        <label class="text-xs font-bold text-gray-500 uppercase ml-1 mb-1.5 block">Cidade</label>
                        <input type="text" [(ngModel)]="city" placeholder="Cidade - UF" class="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-brand-pink outline-none font-medium" [class.bg-green-50]="addressFilled" [disabled]="addressFilled">
                     </div>
                  </div>
               </div>

               <!-- Step 3: Payment -->
               <div class="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
                  <h3 class="font-bold text-lg mb-6 flex items-center gap-3 text-brand-dark">
                    <span class="w-8 h-8 bg-brand-dark text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">3</span> 
                    Pagamento
                  </h3>
                  
                  <div class="space-y-4">
                    <!-- Option: PIX -->
                    <label class="relative flex items-start gap-4 p-5 border-2 rounded-2xl cursor-pointer hover:bg-gray-50 transition-all group overflow-hidden" 
                           [class.border-brand-pink]="paymentMethod==='pix'" 
                           [class.bg-pink-50]="paymentMethod==='pix'" 
                           [class.border-gray-100]="paymentMethod!=='pix'">
                      <div class="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-xl">5% OFF</div>
                      <input type="radio" name="payment" value="pix" [(ngModel)]="paymentMethod" class="mt-1 w-5 h-5 text-brand-pink focus:ring-brand-pink">
                      <div class="flex-1">
                        <span class="font-bold text-gray-800 text-lg flex items-center gap-2">
                           <span class="text-xl">💠</span> PIX
                        </span>
                        <p class="text-sm text-gray-500 mt-1 leading-tight">Aprovação imediata ou envie o comprovante no WhatsApp.</p>
                      </div>
                    </label>

                    <!-- Option: Credit Card -->
                    <label class="flex flex-col p-5 border-2 rounded-2xl cursor-pointer transition-all group" 
                           [class.border-brand-pink]="paymentMethod==='card'" 
                           [class.border-gray-100]="paymentMethod!=='card'">
                      <div class="flex items-start gap-4 mb-4">
                        <input type="radio" name="payment" value="card" [(ngModel)]="paymentMethod" class="mt-1 w-5 h-5 text-brand-pink focus:ring-brand-pink">
                        <div class="flex-1">
                          <span class="font-bold text-gray-800 text-lg flex items-center gap-2">
                             <span class="text-xl">💳</span> Cartão de Crédito
                          </span>
                          <p class="text-sm text-gray-500 mt-1">Parcele em até 12x</p>
                        </div>
                        <div class="flex gap-1 opacity-60">
                           <div class="h-6 w-8 bg-gray-200 rounded"></div>
                           <div class="h-6 w-8 bg-gray-200 rounded"></div>
                        </div>
                      </div>

                      <!-- Credit Card Form (Only Visible if Selected) -->
                      @if (paymentMethod === 'card') {
                        <div class="pt-4 border-t border-gray-200 grid grid-cols-2 gap-4 animate-slide-up">
                           <div class="col-span-2">
                             <label class="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Número do Cartão</label>
                             <div class="relative">
                               <input type="text" appMask="card" [(ngModel)]="cardData.number" placeholder="0000 0000 0000 0000" class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-brand-pink outline-none font-mono text-gray-700 font-bold transition-all">
                               <app-icon name="check" size="16px" class="absolute left-3 top-3.5 text-gray-400"></app-icon>
                             </div>
                           </div>
                           <div class="col-span-2">
                             <label class="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Nome no Cartão</label>
                             <input type="text" [(ngModel)]="cardData.holder" placeholder="Como está impresso" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-brand-pink outline-none uppercase font-bold text-sm text-gray-700 transition-all">
                           </div>
                           <div>
                             <label class="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Validade</label>
                             <input type="text" appMask="expiry" [(ngModel)]="cardData.expiry" placeholder="MM/AA" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-brand-pink outline-none font-bold text-center text-gray-700 transition-all">
                           </div>
                           <div>
                             <label class="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">CVV</label>
                             <div class="relative">
                               <input type="text" [(ngModel)]="cardData.cvv" placeholder="123" maxlength="4" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-brand-pink outline-none font-bold text-center text-gray-700 transition-all">
                               <app-icon name="help-circle" size="14px" class="absolute right-3 top-3.5 text-gray-400" title="Código de 3 dígitos no verso"></app-icon>
                             </div>
                           </div>
                           
                           <!-- Installment Selector -->
                           <div class="col-span-2 mt-2">
                             <label class="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">Parcelamento</label>
                             <select [(ngModel)]="selectedInstallment" class="w-full px-4 py-3 bg-white border-2 border-brand-pink/20 rounded-xl focus:border-brand-pink outline-none font-bold text-gray-700 cursor-pointer text-sm">
                               <option [ngValue]="null" disabled selected>Selecione o número de parcelas</option>
                               @for (opt of installmentOptions(); track opt.count) {
                                 <option [ngValue]="opt">{{ opt.label }}</option>
                               }
                             </select>
                           </div>
                        </div>
                      }
                    </label>
                  </div>
               </div>
            </div>

            <!-- Right Column: Summary -->
            <div class="w-full lg:w-[400px]">
               <div class="bg-white p-8 rounded-3xl shadow-card border border-gray-100 sticky top-24">
                  <h3 class="font-bold text-lg mb-6 text-gray-800">Resumo da Compra</h3>
                  
                  <div class="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    @for (item of store.cart(); track item.id) {
                      <div class="flex gap-4 items-center">
                        <div class="w-16 h-16 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
                          <img [src]="item.image" class="w-full h-full object-cover">
                        </div>
                        <div class="flex-1 min-w-0">
                           <p class="text-sm font-bold text-gray-800 line-clamp-1">{{ item.name }}</p>
                           <p class="text-xs text-gray-500 font-medium">{{ item.quantity }}x R$ {{ item.price.toFixed(2) }}</p>
                        </div>
                      </div>
                    }
                  </div>

                  <div class="border-t border-gray-100 pt-4 space-y-2 mb-6 text-sm">
                    <div class="flex justify-between text-gray-600"><span>Subtotal</span> <span>R$ {{ store.cartTotal().toFixed(2) }}</span></div>
                    
                    @if (store.discountAmount() > 0) {
                       <div class="flex justify-between text-green-600 font-bold"><span>Cupom ({{ store.appliedCoupon()?.code }})</span> <span>- R$ {{ store.discountAmount().toFixed(2) }}</span></div>
                    }

                    <div class="flex justify-between text-gray-600"><span>Frete</span> <span class="text-green-600 font-bold">Grátis</span></div>
                    
                    @if(paymentMethod === 'pix') {
                       <div class="flex justify-between text-green-600 font-medium">
                         <span>Desconto PIX (5%)</span> 
                         <span>- R$ {{ (store.finalPrice() * 0.05).toFixed(2) }}</span>
                       </div>
                    }
                  </div>

                  <div class="flex justify-between items-end mb-8 pt-4 border-t border-gray-100">
                    <span class="font-bold text-gray-600">Total a pagar</span>
                    <div class="text-right">
                      @if (paymentMethod === 'card' && selectedInstallment) {
                         <span class="text-3xl font-black text-brand-dark block">
                           R$ {{ selectedInstallment.total.toFixed(2) }}
                         </span>
                         <span class="text-xs text-brand-pink font-bold block mt-1">
                           {{ selectedInstallment.count }}x de R$ {{ selectedInstallment.value.toFixed(2) }}
                         </span>
                      } @else {
                         <!-- Default or PIX price -->
                         <span class="text-3xl font-black text-brand-dark block">
                           R$ {{ (paymentMethod === 'pix' ? store.finalPrice() * 0.95 : store.finalPrice()).toFixed(2) }}
                         </span>
                      }
                    </div>
                  </div>

                  <button (click)="finishOrder()" [disabled]="!customerName || processingPayment" 
                    class="w-full py-4 bg-green-500 text-white font-bold text-lg rounded-2xl hover:bg-green-600 shadow-lg shadow-green-200 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                    @if (processingPayment) {
                      <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processando...
                    } @else {
                      <app-icon name="check"></app-icon> Confirmar Pedido
                    }
                  </button>

                  <div class="mt-4 flex items-center justify-center gap-2 text-[10px] text-gray-400 text-center">
                    <span class="bg-gray-100 px-2 py-1 rounded">SSL</span>
                    Site Seguro & Verificado
                  </div>
               </div>
            </div>
          </div>
        } @else {
          
          <!-- Success State (General) -->
          <div class="flex flex-col items-center justify-center py-10 animate-fade-in max-w-2xl mx-auto text-center">
             
             <div class="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mb-8 text-green-50 shadow-xl shadow-green-100 animate-bounce-gentle">
               <app-icon name="check" size="64px"></app-icon>
             </div>
             
             @if (viaWhatsapp) {
                <h2 class="text-3xl font-black text-gray-800 mb-4">Redirecionando para WhatsApp...</h2>
                <p class="text-gray-500 mb-8 max-w-md mx-auto">Seu pedido foi montado! Finalize o pagamento e o envio diretamente com nossa atendente.</p>
                <div class="text-sm bg-blue-50 text-blue-700 p-4 rounded-xl border border-blue-100 mb-8">
                   Se a janela do WhatsApp não abriu, verifique seu bloqueador de pop-ups.
                </div>
             } @else {
                <h2 class="text-4xl font-black text-gray-800 mb-4">Pedido Realizado! 🎉</h2>
                <p class="text-xl text-gray-500 mb-8 max-w-lg leading-relaxed">
                   @if(paymentMethod === 'pix') {
                     Seu código PIX foi gerado com sucesso.
                   } @else {
                     Pagamento aprovado. Obrigado por comprar na YARA Kids.
                   }
                </p>
             }
             
             <div class="flex flex-col sm:flex-row gap-4 w-full justify-center">
                 <button (click)="goAccount()" class="px-8 py-4 bg-white border-2 border-gray-100 text-gray-600 font-bold rounded-full hover:bg-gray-50 transition-all">
                   Ver Meus Pedidos
                 </button>
                 <button (click)="goHome()" class="px-12 py-4 bg-brand-pink text-white font-bold rounded-full hover:bg-pink-600 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                   Voltar para Loja
                 </button>
             </div>
          </div>
        }
      </div>
    </div>
  `
})
export class CheckoutComponent {
  store = inject(StoreService);
  paymentService = inject(PaymentService);
  tracking = inject(TrackingService);
  router = inject(Router);
  
  paymentMethod: 'pix' | 'card' = 'pix';
  customerName = '';
  customerPhone = '';
  customerCpf = '';
  
  cep = '';
  address = '';
  addressNumber = '';
  city = '';
  
  // Card Data
  cardData = {
    number: '',
    holder: '',
    expiry: '',
    cvv: ''
  };
  
  orderComplete = false;
  processingPayment = false;
  viaWhatsapp = false;
  
  loadingCep = false;
  addressFilled = false;

  // Dynamic Installments
  installmentOptions = computed(() => {
    const baseTotal = this.store.finalPrice();
    return this.paymentService.calculateInstallments(baseTotal);
  });
  
  selectedInstallment: InstallmentOption | null = null;

  async searchCep() {
    if (this.cep.length >= 8) {
      this.loadingCep = true;
      const data = await this.store.fetchAddressByCep(this.cep);
      if (data) {
        this.address = data.address;
        this.city = data.city;
        this.addressFilled = true;
        this.store.showToast('Endereço encontrado!', 'success');
      } else {
        this.store.showToast('CEP não encontrado', 'error');
        this.addressFilled = false;
      }
      this.loadingCep = false;
    }
  }

  async finishOrder() {
    if (this.processingPayment) return;

    // Basic Validation
    if (!this.customerName || !this.customerCpf || !this.address) {
        this.store.showToast('Preencha todos os dados de entrega', 'error');
        return;
    }

    // Card Validation
    if (this.paymentMethod === 'card') {
        if (!this.cardData.number || !this.selectedInstallment) {
            this.store.showToast('Preencha os dados do cartão e selecione o parcelamento', 'error');
            return;
        }
    }

    this.processingPayment = true;

    try {
        await this.paymentService.processPayment({
            method: this.paymentMethod,
            amount: this.paymentMethod === 'card' && this.selectedInstallment ? this.selectedInstallment.total : this.store.finalPrice(),
            installments: this.selectedInstallment ? this.selectedInstallment.count : 1,
            idempotencyKey: this.generateIdempotencyKey(),
            customer: {
              name: this.customerName,
              cpf: this.customerCpf,
              phone: this.customerPhone
            },
        });

        // SUCCESS: Create Local Order
        const order = await this.createLocalOrder();
        
        // Track Purchase
        this.tracking.logPurchase(order.id, order.total, order.items);

        this.viaWhatsapp = false;
        this.orderComplete = true;
        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (e) {
        // ERROR: Fallback to WhatsApp
        console.error('Payment Error, falling back to WhatsApp', e);
        this.store.showToast('Instabilidade no pagamento automático. Redirecionando para finalizar no WhatsApp...', 'info');
        await this.finalizeViaWhatsApp();
    } finally {
        this.processingPayment = false;
    }
  }

  createLocalOrder() {
    return this.store.createOrder({
        customer: this.customerName || 'Cliente Convidado',
        payment: this.paymentMethod,
        cpf: this.customerCpf,
        phone: this.customerPhone,
        address: {
            cep: this.cep,
            street: this.address,
            number: this.addressNumber,
            city: this.city
        }
    });
  }

  async finalizeViaWhatsApp() {
    // 1. Create Order locally (Pending)
    const order = await this.createLocalOrder();

    // 2. Format Message
    const cartItems = order.items.map(i => 
        `▪️ ${i.quantity}x ${i.name} (${i.selectedSize}/${i.selectedColor})`
    ).join('\n');

    const paymentText = this.paymentMethod === 'pix' ? 'PIX (5% OFF)' : `Cartão (${this.selectedInstallment?.count || 1}x)`;

    const msg = `
👋 Olá! Fiz um pedido no site e quero finalizar.
🆔 *Pedido #${order.id}*

👤 *Cliente:* ${this.customerName}
📄 *CPF:* ${this.customerCpf}

📦 *Itens:*
${cartItems}

💰 *Total:* R$ ${order.total.toFixed(2)}
💳 *Pagamento:* ${paymentText}
📍 *Entrega:* ${this.address}, ${this.addressNumber} - ${this.city} (${this.cep})

Aguardo a chave PIX ou link de pagamento!
    `.trim();

    // 3. WhatsApp Redirect
    // Strip non-digits from store phone number
    const storePhone = this.store.institutional().whatsapp.replace(/\D/g, '') || '5594991334401'; 
    // Ensure country code 55 if missing (simple check)
    const finalPhone = storePhone.length <= 11 ? `55${storePhone}` : storePhone;

    const url = `https://wa.me/${finalPhone}?text=${encodeURIComponent(msg)}`;
    
    // Open in new tab
    window.open(url, '_blank');

    this.viaWhatsapp = true;
    this.orderComplete = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }


  private generateIdempotencyKey() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }

    return `checkout-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  goHome() {
    this.router.navigate(['/']);
  }

  goAccount() {
    if(!this.store.user()) {
        this.store.login(this.customerName ? `${this.customerName.toLowerCase().replace(/\s/g, '.')}@email.com` : 'cliente@email.com');
    }
    this.router.navigate(['/minha-conta']);
  }
}

