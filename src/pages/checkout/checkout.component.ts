
import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from '../../services/store.service';
import { PaymentService, InstallmentOption, PaymentResult } from '../../services/payment.service';
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
                      <div class="md:col-span-2">
                        <label class="text-xs font-bold text-gray-500 uppercase ml-1 mb-1.5 block">E-mail</label>
                        <input type="email" [(ngModel)]="customerEmail" class="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20 outline-none transition-all font-medium text-gray-700" placeholder="seuemail@exemplo.com">
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
                        <p class="text-sm text-gray-500 mt-1 leading-tight">Gere o QR code e pague com confirmação automática.</p>
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
                              @if (selectedInstallment) {
                                <p class="text-xs mt-2 text-gray-500">
                                  Juros: <strong>R$ {{ selectedInstallment.interestAmount.toFixed(2) }}</strong> •
                                  Total: <strong>R$ {{ selectedInstallment.total.toFixed(2) }}</strong>
                                </p>
                              }
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
             <h2 class="text-4xl font-black text-gray-800 mb-4">Pedido Realizado! 🎉</h2>
             <p class="text-xl text-gray-500 mb-8 max-w-lg leading-relaxed">
                @if(paymentMethod === 'pix') {
                  PIX gerado com sucesso. Pague para confirmar automaticamente.
                } @else if (paymentResult?.status === 'approved') {
                  Pagamento aprovado. Obrigado por comprar na YARA Kids.
                } @else {
                  Pagamento em análise pelo provedor. Você será atualizado em breve.
                }
             </p>

             @if (paymentMethod === 'pix' && pixPayload()) {
               <div class="w-full max-w-xl bg-white border border-gray-200 rounded-3xl p-6 mb-8 shadow-sm">
                 <h3 class="font-black text-xl text-gray-800 mb-4">Pague com PIX</h3>
                 @if (pixPayload()?.qrCodeBase64) {
                   <img [src]="'data:image/png;base64,' + pixPayload()?.qrCodeBase64" alt="QR Code PIX" class="w-56 h-56 mx-auto border border-gray-200 rounded-2xl p-2 bg-white mb-4">
                 }
                 <label class="block text-xs font-bold text-gray-500 uppercase mb-1 text-left">Código copia e cola</label>
                 <textarea readonly [value]="pixPayload()?.qrCode || ''" class="w-full p-3 text-xs rounded-xl bg-gray-50 border border-gray-200 text-gray-700 min-h-24"></textarea>
                 <div class="flex flex-wrap items-center justify-center gap-3 mt-4">
                   <button type="button" (click)="copyPixCode()" class="px-5 py-3 rounded-xl bg-brand-pink text-white font-bold hover:bg-pink-600 transition-colors">Copiar código PIX</button>
                   @if (pixPayload()?.ticketUrl) {
                     <a [href]="pixPayload()?.ticketUrl || '#'" target="_blank" class="px-5 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors">Abrir link PIX</a>
                   }
                 </div>
               </div>
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
  customerEmail = '';
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
  paymentResult: PaymentResult | null = null;
  
  loadingCep = false;
  addressFilled = false;

  // Dynamic Installments
  installmentOptions = computed(() => {
    const baseTotal = this.store.finalPrice();
    return this.paymentService.calculateInstallments(baseTotal);
  });
  
  selectedInstallment: InstallmentOption | null = null;

  constructor() {
    this.customerEmail = this.store.user()?.email || '';
  }

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

    if (!this.customerName || !this.customerCpf || !this.address || !this.customerEmail) {
      this.store.showToast('Preencha nome, e-mail, CPF e endereço.', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.customerEmail.trim())) {
      this.store.showToast('Informe um e-mail válido para o pagamento.', 'error');
      return;
    }

    if (this.paymentMethod === 'card') {
      if (!this.cardData.number || !this.cardData.holder || !this.cardData.expiry || !this.cardData.cvv || !this.selectedInstallment) {
        this.store.showToast('Preencha os dados do cartão e selecione o parcelamento.', 'error');
        return;
      }
    }

    this.processingPayment = true;

    try {
      const baseTotal = this.store.finalPrice();
      const paymentAmount = this.paymentMethod === 'pix'
        ? Number((baseTotal * 0.95).toFixed(2))
        : Number((this.selectedInstallment?.total || baseTotal).toFixed(2));

      const idempotencyKey = this.generateIdempotencyKey();
      const cpfDigits = this.customerCpf.replace(/\D/g, '');

      let cardTokenPayload: { cardToken?: string; paymentMethodId?: string; issuerId?: string | number } = {};
      if (this.paymentMethod === 'card') {
        const tokenized = await this.paymentService.tokenizeCard({
          cardNumber: this.cardData.number,
          cardholderName: this.cardData.holder,
          cardExpiration: this.cardData.expiry,
          securityCode: this.cardData.cvv,
          identificationType: 'CPF',
          identificationNumber: cpfDigits
        });
        cardTokenPayload = {
          cardToken: tokenized.cardToken,
          paymentMethodId: tokenized.paymentMethodId,
          issuerId: tokenized.issuerId
        };
      }

      const paymentResult = await this.paymentService.processPayment({
        method: this.paymentMethod,
        amount: paymentAmount,
        installments: this.paymentMethod === 'card' ? (this.selectedInstallment?.count || 1) : 1,
        idempotencyKey,
        ...cardTokenPayload,
        payer: {
          email: this.customerEmail.trim(),
          identification: {
            type: 'CPF',
            number: cpfDigits
          },
          name: this.customerName
        },
        customer: {
          name: this.customerName,
          cpf: this.customerCpf,
          phone: this.customerPhone
        }
      });

      const normalizedStatus = String(paymentResult.status || '').toLowerCase();
      const approved = normalizedStatus === 'approved';
      const pendingProvider = normalizedStatus === 'pending' || normalizedStatus === 'in_process';

      if (!approved && !pendingProvider) {
        throw new Error(`Pagamento não aprovado (${paymentResult.rawProviderStatus || paymentResult.status || 'status desconhecido'}).`);
      }

      const orderStatus = approved ? 'paid' : 'pending';
      const order = await this.createLocalOrder(orderStatus, paymentAmount);
      this.tracking.logPurchase(order.id, order.total, order.items);

      this.paymentResult = paymentResult;
      this.orderComplete = true;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e: any) {
      console.error('Payment error', e);
      this.store.showToast(e?.message || 'Falha ao processar pagamento. Tente novamente.', 'error');
    } finally {
      this.processingPayment = false;
    }
  }

  createLocalOrder(status: 'pending' | 'paid', totalOverride: number) {
    return this.store.createOrder({
      customer: this.customerName || 'Cliente Convidado',
      payment: this.paymentMethod,
      cpf: this.customerCpf,
      phone: this.customerPhone,
      status,
      totalOverride,
      address: {
        cep: this.cep,
        street: this.address,
        number: this.addressNumber,
        city: this.city
      }
    });
  }

  pixPayload() {
    if (!this.paymentResult) return null;
    return this.paymentResult;
  }

  async copyPixCode() {
    const code = this.paymentResult?.qrCode;
    if (!code) return;

    try {
      await navigator.clipboard.writeText(code);
      this.store.showToast('Código PIX copiado!', 'success');
    } catch {
      this.store.showToast('Não foi possível copiar o código PIX.', 'error');
    }
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

