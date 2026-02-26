import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { StoreService } from './store.service';

declare global {
  interface Window {
    MercadoPago?: any;
  }
}

export interface InstallmentOption {
  count: number;
  value: number;
  total: number;
  interestAmount: number;
  hasInterest: boolean;
  label: string;
}

export interface CardTokenInput {
  cardNumber: string;
  cardholderName: string;
  cardExpiration: string;
  securityCode: string;
  identificationType: 'CPF' | 'CNPJ';
  identificationNumber: string;
}

export interface CardTokenResult {
  cardToken: string;
  paymentMethodId?: string;
  issuerId?: string | number;
  lastFour?: string;
}

export interface PaymentRequest {
  method: 'pix' | 'card';
  amount: number;
  installments: number;
  idempotencyKey: string;
  cardToken?: string;
  paymentMethodId?: string;
  issuerId?: string | number;
  payer: {
    email: string;
    identification: {
      type: 'CPF' | 'CNPJ';
      number: string;
    };
    name?: string;
  };
  customer: {
    name: string;
    cpf: string;
    phone?: string;
  };
}

export interface PaymentResult {
  success: boolean;
  id: string;
  status?: string;
  paymentId?: string;
  qrCode?: string;
  qrCodeBase64?: string;
  ticketUrl?: string;
  rawProviderStatus?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private supabase = inject(SupabaseService);
  private store = inject(StoreService);

  private sdkPromise: Promise<void> | null = null;
  private mpInstance: any | null = null;

  private getInstallmentConfig() {
    const settings = this.store.institutional();
    const maxInstallments = Number(settings.mercadoPagoMaxInstallments ?? 12);
    const freeInstallments = Number(settings.mercadoPagoFreeInstallments ?? 6);
    const interestRate = Number(settings.mercadoPagoInterestRate ?? 2.99);

    const normalizedMax = Number.isFinite(maxInstallments) ? Math.max(1, Math.min(24, Math.trunc(maxInstallments))) : 12;
    const normalizedFree = Number.isFinite(freeInstallments) ? Math.max(0, Math.min(normalizedMax, Math.trunc(freeInstallments))) : 6;
    const normalizedRate = Number.isFinite(interestRate) ? Math.max(0, interestRate) : 2.99;

    return {
      maxInstallments: normalizedMax,
      freeInstallments: normalizedFree,
      interestRate: normalizedRate
    };
  }

  calculateInstallments(amount: number): InstallmentOption[] {
    const { maxInstallments, freeInstallments, interestRate } = this.getInstallmentConfig();
    const options: InstallmentOption[] = [];

    for (let i = 1; i <= maxInstallments; i++) {
      let installmentValue = 0;
      let totalValue = 0;
      let hasInterest = false;

      if (i <= freeInstallments) {
        totalValue = amount;
        installmentValue = amount / i;
        hasInterest = false;
      } else {
        const rate = interestRate / 100;
        totalValue = amount * Math.pow(1 + rate, i);
        installmentValue = totalValue / i;
        hasInterest = true;
      }

      if (installmentValue < 5) continue;

      const interestAmount = Math.max(0, totalValue - amount);
      options.push({
        count: i,
        value: installmentValue,
        total: totalValue,
        interestAmount,
        hasInterest,
        label: `${i}x de R$ ${installmentValue.toFixed(2)} ${hasInterest ? `com juros (total R$ ${totalValue.toFixed(2)})` : 'sem juros'}`
      });
    }

    return options;
  }

  private loadSdk(): Promise<void> {
    if (this.sdkPromise) return this.sdkPromise;

    if (typeof window === 'undefined') {
      this.sdkPromise = Promise.reject(new Error('SDK Mercado Pago indisponível fora do navegador.'));
      return this.sdkPromise;
    }

    if (window.MercadoPago) {
      this.sdkPromise = Promise.resolve();
      return this.sdkPromise;
    }

    this.sdkPromise = new Promise<void>((resolve, reject) => {
      const existing = document.querySelector('script[data-mp-sdk="true"]') as HTMLScriptElement | null;
      if (existing) {
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener('error', () => reject(new Error('Falha ao carregar SDK Mercado Pago.')), { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://sdk.mercadopago.com/js/v2';
      script.async = true;
      script.defer = true;
      script.dataset['mpSdk'] = 'true';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Falha ao carregar SDK Mercado Pago.'));
      document.head.appendChild(script);
    });

    return this.sdkPromise;
  }

  private async getMercadoPagoInstance() {
    await this.loadSdk();

    if (this.mpInstance) return this.mpInstance;

    const publicKey = String(this.store.institutional().mercadoPagoPublicKey || '').trim();
    if (!publicKey) {
      throw new Error('Public Key do Mercado Pago não configurada no painel.');
    }

    if (!window.MercadoPago) {
      throw new Error('SDK Mercado Pago indisponível no navegador.');
    }

    this.mpInstance = new window.MercadoPago(publicKey, { locale: 'pt-BR' });
    return this.mpInstance;
  }

  private parseExpiration(expiration: string): { month: string; year: string } {
    const clean = String(expiration || '').replace(/\s+/g, '');
    const [monthRaw = '', yearRaw = ''] = clean.split('/');
    const month = monthRaw.padStart(2, '0').slice(0, 2);
    const yy = yearRaw.padStart(2, '0').slice(-2);
    const fullYear = `20${yy}`;
    return { month, year: fullYear };
  }

  async tokenizeCard(input: CardTokenInput): Promise<CardTokenResult> {
    const mp = await this.getMercadoPagoInstance();
    const digits = String(input.cardNumber || '').replace(/\D/g, '');
    const { month, year } = this.parseExpiration(input.cardExpiration);

    if (digits.length < 13 || digits.length > 19) {
      throw new Error('Número de cartão inválido.');
    }

    if (!month || !year || Number(month) < 1 || Number(month) > 12) {
      throw new Error('Validade do cartão inválida.');
    }

    const tokenResponse = await mp.createCardToken({
      cardNumber: digits,
      cardholderName: String(input.cardholderName || '').trim(),
      cardExpirationMonth: month,
      cardExpirationYear: year,
      securityCode: String(input.securityCode || '').trim(),
      identificationType: input.identificationType,
      identificationNumber: String(input.identificationNumber || '').replace(/\D/g, '')
    });

    const tokenId = String(tokenResponse?.id || '');
    if (!tokenId) {
      throw new Error('Não foi possível tokenizar o cartão.');
    }

    const bin = digits.slice(0, 6);
    let paymentMethodId = tokenResponse?.payment_method_id || undefined;
    let issuerId = tokenResponse?.issuer_id || undefined;

    if ((!paymentMethodId || !issuerId) && bin.length === 6) {
      try {
        const methodsResponse = await mp.getPaymentMethods({ bin });
        const methods = methodsResponse?.results || methodsResponse || [];
        if (!paymentMethodId) paymentMethodId = methods?.[0]?.id;

        if (!issuerId && paymentMethodId) {
          const issuersResponse = await mp.getIssuers({ paymentMethodId, bin });
          const issuers = issuersResponse?.results || issuersResponse || [];
          issuerId = issuers?.[0]?.id;
        }
      } catch {
        // Se lookup falhar, backend ainda tentará processar com os dados disponíveis.
      }
    }

    return {
      cardToken: tokenId,
      paymentMethodId,
      issuerId,
      lastFour: tokenResponse?.last_four_digits
    };
  }

  async processPayment(data: PaymentRequest): Promise<PaymentResult> {
    const response = await this.supabase.callFunction('process-payment', data);

    if (!response?.ok) {
      throw new Error(response?.message || 'Falha ao processar pagamento.');
    }

    return {
      success: true,
      id: String(response.id || response.paymentId || Date.now()),
      paymentId: String(response.paymentId || ''),
      status: String(response.status || ''),
      qrCode: response.qrCode,
      qrCodeBase64: response.qrCodeBase64,
      ticketUrl: response.ticketUrl,
      rawProviderStatus: response.rawProviderStatus
    };
  }
}
