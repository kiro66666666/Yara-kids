
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
    <div class="min-h-screen bg-gray-50 dark:bg-brand-darkbg pb-32 lg:pb-20 transition-colors duration-300">
      <!-- Checkout Header -->
      <div class="bg-white dark:bg-brand-darksurface border-b border-gray-200 dark:border-gray-700 py-4 mb-8 sticky top-0 z-30 shadow-sm transition-colors">
        <div class="container mx-auto px-6 flex items-center justify-between">
           <div class="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-pink to-brand-lilac cursor-pointer" (click)="goHome()">YARA Kids</div>
           <div class="flex items-center gap-2 text-green-600 dark:text-green-400 text-xs font-bold bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full border border-green-100 dark:border-green-900/30">
             <app-icon name="check" size="14px"></app-icon> Ambiente 100% Seguro
           </div>
        </div>
      </div>

      <div class="container mx-auto px-4 max-w-5xl">
        
        @if (!orderComplete) {
          <div class="flex flex-col lg:flex-row gap-8 animate-fade-in">
            <!-- Left Column: Forms -->
            <div class="flex-1 space-y-6">
               <h1 class="text-2xl font-black text-gray-800 dark:text-white mb-2">Finalizar Compra</h1>

               <!-- Step 1: Data -->
               <div class="bg-white dark:bg-brand-darksurface p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
                  <h3 class="font-bold text-lg mb-6 flex items-center gap-3 text-brand-dark dark:text-white">
                    <span class="w-8 h-8 bg-brand-dark dark:bg-brand-pink text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">1</span> 
                    Dados Pessoais
                  </h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                     <div class="md:col-span-2">
                       <label class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1 mb-1.5 block">Nome Completo</label>
                       <input type="text" [(ngModel)]="customerName" class="w-full p-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-black focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20 outline-none transition-all font-bold text-gray-900 dark:text-white placeholder-gray-400" placeholder="Como devemos te chamar?">
                     </div>
                     <div>
                       <label class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1 mb-1.5 block">WhatsApp</label>
                       <input type="text" appMask="phone" [(ngModel)]="customerPhone" placeholder="(00) 00000-0000" class="w-full p-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-black focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20 outline-none transition-all font-bold text-gray-900 dark:text-white placeholder-gray-400">
                     </div>
                     <div>
                       <label class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1 mb-1.5 block">CPF</label>
                       <input type="text" appMask="cpf" [(ngModel)]="customerCpf" placeholder="000.000.000-00" class="w-full p-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-black focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20 outline-none transition-all font-bold text-gray-900 dark:text-white placeholder-gray-400">
                     </div>
                  </div>
               </div>

               <!-- Step 2: Address -->
               <div class="bg-white dark:bg-brand-darksurface p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden transition-colors">
                  <h3 class="font-bold text-lg mb-6 flex items-center gap-3 text-brand-dark dark:text-white">
                    <span class="w-8 h-8 bg-brand-dark dark:bg-brand-pink text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">2</span> 
                    Entrega
                  </h3>
                  
                  <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                     <div class="md:col-span-4 flex flex-col sm:flex-row gap-3 sm:items-end">
                        <div class="flex-1 relative">
                           <label class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1 mb-1.5 block">CEP</label>
                           <div class="relative">
                             <input type="text" appMask="cep" [(ngModel)]="cep" (blur)="searchCep()" placeholder="00000-000" maxlength="9" class="w-full p-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-black focus:border-brand-pink outline-none font-bold text-gray-900 dark:text-white placeholder-gray-400">
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
                       <label class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1 mb-1.5 block">Endereço</label>
                       <input type="text" [(ngModel)]="address" placeholder="Rua, Avenida..." class="w-full p-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-black focus:border-brand-pink outline-none font-bold text-gray-900 dark:text-white transition-colors placeholder-gray-400" [class.bg-green-50]="addressFilled" [class.dark:bg-green-900/20]="addressFilled" [disabled]="addressFilled">
                     </div>
                     <div class="md:col-span-1">
                        <label class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1 mb-1.5 block">Número</label>
                        <input type="text" [(ngModel)]="addressNumber" placeholder="123" class="w-full p-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-black focus:border-brand-pink outline-none font-bold text-gray-900 dark:text-white placeholder-gray-400">
                     </div>
                     <div class="md:col-span-4">
                        <label class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1 mb-1.5 block">Cidade</label>
                        <input type="text" [(ngModel)]="city" placeholder="Cidade - UF" class="w-full p-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-black focus:border-brand-pink outline-none font-bold text-gray-900 dark:text-white placeholder-gray-400" [class.bg-green-50]="addressFilled" [class.dark:bg-green-900/20]="addressFilled" [disabled]="addressFilled">
                     </div>
                  </div>
               </div>

               <!-- Step 3: Payment -->
               <div class="bg-white dark:bg-brand-darksurface p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
                  <h3 class="font-bold text-lg mb-6 flex items-center gap-3 text-brand-dark dark:text-white">
                    <span class="w-8 h-8 bg-brand-dark dark:bg-brand-pink text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">3</span> 
                    Pagamento
                  </h3>
                  
                  <div class="space-y-4">
                    <!-- Option: PIX -->
                    <label class="relative flex items-start gap-4 p-5 border-2 rounded-2xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-all group overflow-hidden" 
                           [class.border-brand-pink]="paymentMethod==='pix'" 
                           [class.bg-pink-50]="paymentMethod==='pix'" 
                           [class.dark:bg-pink-900/10]="paymentMethod==='pix'"
                           [class.border-gray-100]="paymentMethod!=='pix'"
                           [class.dark:border-gray-700]="paymentMethod!=='pix'">
                      <div class="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-xl">5% OFF</div>
                      <input type="radio" name="payment" value="pix" [(ngModel)]="paymentMethod" class="mt-1 w-5 h-5 text-brand-pink focus:ring-brand-pink bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                      <div class="flex-1">
                        <span class="font-bold text-gray-800 dark:text-white text-lg flex items-center gap-2">
                           <span class="text-xl">💠</span> PIX
                        </span>
                        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-tight">Aprovação imediata ou envie o comprovante no WhatsApp.</p>
                      </div>
                    </label>

                    <!-- Option: Credit Card -->
                    <label class="flex flex-col p-5 border-2 rounded-2xl cursor-pointer transition-all group hover:bg-gray-50 dark:hover:bg-gray-800" 
                           [class.border-brand-pink]="paymentMethod==='card'" 
                           [class.border-gray-100]="paymentMethod!=='card'"
                           [class.dark:border-gray-700]="paymentMethod!=='card'">
                      <div class="flex items-start gap-4 mb-4">
                        <input type="radio" name="payment" value="card" [(ngModel)]="paymentMethod" class="mt-1 w-5 h-5 text-brand-pink focus:ring-brand-pink bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                        <div class="flex-1">
                          <span class="font-bold text-gray-800 dark:text-white text-lg flex items-center gap-2">
                             <span class="text-xl">💳</span> Cartão de Crédito
                          </span>
                          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Parcele em até 12x</p>
                        </div>
                        <div class="flex gap-1 opacity-60">
                           <div class="h-6 w-8 bg-gray-200 dark:bg-gray-600 rounded"></div>
                           <div class="h-6 w-8 bg-gray-200 dark:bg-gray-600 rounded"></div>
                        </div>
                      </div>

                      <!-- Credit Card Form (Only Visible if Selected) -->
                      @if (paymentMethod === 'card') {
                        <div class="pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-4 animate-slide-up">
                           <div class="col-span-2">
                             <label class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1 mb-1 block">Número do Cartão</label>
                             <div class="relative">
                               <input type="text" appMask="card" [(ngModel)]="cardData.number" placeholder="0000 0000 0000 0000" class="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-black focus:border-brand-pink outline-none font-mono text-gray-700 dark:text-white font-bold transition-all placeholder-gray-400">
                               <app-icon name="check" size="16px" class="absolute left-3 top-3.5 text-gray-400"></app-icon>
                             </div>
                           </div>
                           <div class="col-span-2">
                             <label class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1 mb-1 block">Nome no Cartão</label>
                             <input type="text" [(ngModel)]="cardData.holder" placeholder="Como está impresso" class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-black focus:border-brand-pink outline-none uppercase font-bold text-sm text-gray-700 dark:text-white transition-all placeholder-gray-400">
                           </div>
                           <div>
                             <label class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1 mb-1 block">Validade</label>
                             <input type="text" appMask="expiry" [(ngModel)]="cardData.expiry" placeholder="MM/AA" class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-black focus:border-brand-pink outline-none font-bold text-center text-gray-700 dark:text-white transition-all placeholder-gray-400">
                           </div>
                           <div>
                             <label class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1 mb-1 block">CVV</label>
                             <div class="relative">
                               <input type="text" [(ngModel)]="cardData.cvv" placeholder="123" maxlength="4" class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-black focus:border-brand-pink outline-none font-bold text-center text-gray-700 dark:text-white transition-all placeholder-gray-400">
                               <app-icon name="help-circle" size="14px" class="absolute right-3 top-3.5 text-gray-400" title="Código de 3 dígitos no verso"></app-icon>
                             </div>
                           </div>
                           
                           <!-- Installment Selector -->
                           <div class="col-span-2 mt-2">
                             <label class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1 mb-1 block">Parcelamento</label>
                             <select [(ngModel)]="selectedInstallment" class="w-full px-4 py-3 bg-white dark:bg-gray-900 border-2 border-brand-pink/20 dark:border-brand-pink/20 rounded-xl focus:border-brand-pink outline-none font-bold text-gray-700 dark:text-white cursor-pointer text-sm">
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
               <div class="bg-white dark:bg-brand-darksurface p-8 rounded-3xl shadow-card border border-gray-100 dark:border-gray-700 sticky top-24 transition-colors">
                  <h3 class="font-bold text-lg mb-6 text-gray-800 dark:text-white">Resumo da Compra</h3>
                  
                  <div class="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    @for (item of store.cart(); track item.id) {
                      <div class="flex gap-4 items-center">
                        <div class="w-16 h-16 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 flex-shrink-0 bg-white dark:bg-gray-800">
                          <img [src]="item.image" class="w-full h-full object-cover">
                        </div>
                        <div class="flex-1 min-w-0">
                           <p class="text-sm font-bold text-gray-800 dark:text-white line-clamp-1">{{ item.name }}</p>
                           <p class="text-xs text-gray-500 dark:text-gray-400 font-medium">{{ item.quantity }}x R$ {{ item.price.toFixed(2) }}</p>
                        </div>
                      </div>
                    }
                  </div>

                  <div class="border-t border-gray-100 dark:border-gray-700 pt-4 space-y-2 mb-6 text-sm">
                    <div class="flex justify-between text-gray-600 dark:text-gray-400"><span>Subtotal</span> <span>R$ {{ store.cartTotal().toFixed(2) }}</span></div>
                    
                    @if (store.discountAmount() > 0) {
                       <div class="flex justify-between text-green-600 dark:text-green-400 font-bold"><span>Cupom ({{ store.appliedCoupon()?.code }})</span> <span>- R$ {{ store.discountAmount().toFixed(2) }}</span></div>
                    }

                    <div class="flex justify-between text-gray-600 dark:text-gray-400"><span>Frete</span> <span class="text-green-600 dark:text-green-400 font-bold">Grátis</span></div>
                    
                    @if(paymentMethod === 'pix') {
                       <div class="flex justify-between text-green-600 dark:text-green-400 font-medium">
                         <span>Desconto PIX (5%)</span> 
                         <span>- R$ {{ (store.finalPrice() * 0.05).toFixed(2) }}</span>
                       </div>
                    }
                  </div>

                  <div class="flex justify-between items-end mb-8 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <span class="font-bold text-gray-600 dark:text-gray-400">Total a pagar</span>
                    <div class="text-right">
                      @if (paymentMethod === 'card' && selectedInstallment) {
                         <span class="text-3xl font-black text-brand-dark dark:text-white block">
                           R$ {{ selectedInstallment.total.toFixed(2) }}
                         </span>
                         <span class="text-xs text-brand-pink font-bold block mt-1">
                           {{ selectedInstallment.count }}x de R$ {{ selectedInstallment.value.toFixed(2) }}
                         </span>
                      } @else {
                         <!-- Default or PIX price -->
                         <span class="text-3xl font-black text-brand-dark dark:text-white block">
                           R$ {{ (paymentMethod === 'pix' ? store.finalPrice() * 0.95 : store.finalPrice()).toFixed(2) }}
                         </span>
                      }
                    </div>
                  </div>

                  <button (click)="finishOrder()" [disabled]="!customerName || processingPayment" 
                    class="w-full py-4 bg-green-500 text-white font-bold text-lg rounded-2xl hover:bg-green-600 shadow-lg shadow-green-200 dark:shadow-none transition-all hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                    @if (processingPayment) {
                      <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processando...
                    } @else {
                      <app-icon name="check"></app-icon> Confirmar Pedido
                    }
                  </button>

                  <div class="mt-4 flex items-center justify-center gap-2 text-[10px] text-gray-400 text-center">
                    <span class="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">SSL</span>
                    Site Seguro & Verificado
                  </div>
               </div>
            </div>
          </div>
        } @else {
          
          <!-- Success State (General) -->
          <div class="flex flex-col items-center justify-center py-10 animate-fade-in max-w-2xl mx-auto text-center">
             
             <div class="w-32 h-32 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-8 text-green-50 dark:text-green-400 shadow-xl shadow-green-100 dark:shadow-none animate-bounce-gentle">
               <app-icon name="check" size="64px"></app-icon>
             </div>
             
             @if (viaWhatsapp) {
                <h2 class="text-3xl font-black text-gray-800 dark:text-white mb-4">Redirecionando para WhatsApp...</h2>
                <p class="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">Seu pedido foi montado! Finalize o pagamento e o envio diretamente com nossa atendente.</p>
                <div class="text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 mb-8">
                   Se a janela do WhatsApp não abriu, verifique seu bloqueador de pop-ups.
                </div>
             } @else {
                <h2 class="text-4xl font-black text-gray-800 dark:text-white mb-4">Pedido Realizado! 🎉</h2>
                <p class="text-xl text-gray-500 dark:text-gray-400 mb-8 max-w-lg leading-relaxed">
                   @if(paymentMethod === 'pix') {
                     Seu código PIX foi gerado com sucesso.
                   } @else {
                     Pagamento aprovado. Obrigado por comprar na YARA Kids.
                   }
                </p>
             }
             
             <div class="flex flex-col sm:flex-row gap-4 w-full justify-center">
                 <button (click)="goAccount()" class="px-8 py-4 bg-white dark:bg-brand-darksurface border-2 border-gray-100 dark:border-gray-700 text-gray-600 dark:text-white font-bold rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
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

  // Form Data
  customerName = '';
  customerPhone = '';
  customerCpf = '';
  
  cep = '';
  address = '';
  addressNumber = '';
  city = '';
  
  loadingCep = false;
  addressFilled = false;

  paymentMethod = 'pix';
  cardData = { number: '', holder: '', expiry: '', cvv: '' };
  selectedInstallment: InstallmentOption | null = null;
  
  installmentOptions = computed(() => {
    if (this.paymentMethod === 'card') {
      return this.paymentService.calculateInstallments(this.store.finalPrice());
    }
    return [];
  });

  processingPayment = false;
  orderComplete = false;
  viaWhatsapp = false;

  constructor() {
    effect(() => {
      // Redirect if cart is empty
      if (this.store.cart().length === 0 && !this.orderComplete) {
        this.router.navigate(['/carrinho']);
      }
    });

    // Auto-fill from user data if available
    const user = this.store.user();
    if (user) {
        this.customerName = user.name || '';
        if(user.phone) this.customerPhone = user.phone;
    }
  }

  async searchCep() {
    if (this.cep.length >= 8) {
      this.loadingCep = true;
      const addr = await this.store.fetchAddressByCep(this.cep);
      this.loadingCep = false;
      if (addr) {
        this.address = addr.address;
        this.city = addr.city;
        this.addressFilled = true;
      }
    }
  }

  async finishOrder() {
    this.processingPayment = true;
    
    // Validate
    if (!this.customerName || !this.customerPhone || !this.address || !this.addressNumber || !this.city) {
        this.store.showToast('Preencha todos os dados de entrega', 'error');
        this.processingPayment = false;
        return;
    }

    if (this.paymentMethod === 'card') {
       if (!this.cardData.number || !this.cardData.holder || !this.cardData.expiry || !this.cardData.cvv || !this.selectedInstallment) {
           this.store.showToast('Preencha os dados do cartão', 'error');
           this.processingPayment = false;
           return;
       }
    }
    
    // Simulate Payment
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Create Order
    const order = await this.store.createOrder({
        customer: this.customerName,
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

    if (order) {
        this.tracking.logPurchase(order.id, order.total, order.items);
        this.orderComplete = true;
        
        if (this.paymentMethod === 'pix') {
             // Maybe show QR Code or instructions
        } else {
             // Card success
        }
    } else {
        this.store.showToast('Erro ao criar pedido. Tente novamente.', 'error');
    }

    this.processingPayment = false;
  }

  goHome() { this.router.navigate(['/']); }
  goAccount() { this.router.navigate(['/minha-conta']); }
}
