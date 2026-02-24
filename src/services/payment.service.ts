
import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface InstallmentOption {
  count: number;
  value: number;
  total: number;
  hasInterest: boolean;
  label: string;
}

export interface PaymentRequest {
  method: 'pix' | 'card';
  amount: number;
  installments: number;
  idempotencyKey: string;
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
  qrCode?: string;
  qrCodeBase64?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private supabase = inject(SupabaseService);
  
  // Configurações da Loja (Isso viria do backend no futuro)
  private config = {
    maxInstallments: 12,
    freeInstallments: 6, // Sem juros até 6x
    interestRate: 2.99 // Taxa de juros mensal % para parcelas acima da isenção
  };

  constructor() {}

  /**
   * Calcula as opções de parcelamento baseadas no valor total
   */
  calculateInstallments(amount: number): InstallmentOption[] {
    const options: InstallmentOption[] = [];

    for (let i = 1; i <= this.config.maxInstallments; i++) {
      let installmentValue = 0;
      let totalValue = 0;
      let hasInterest = false;

      if (i <= this.config.freeInstallments) {
        // Sem Juros
        totalValue = amount;
        installmentValue = amount / i;
        hasInterest = false;
      } else {
        // Com Juros Composto (Simulação padrão de mercado)
        // M = P * (1 + i)^n
        const rate = this.config.interestRate / 100;
        totalValue = amount * Math.pow(1 + rate, i);
        installmentValue = totalValue / i;
        hasInterest = true;
      }

      // Regra de parcela mínima (ex: R$ 5,00)
      if (installmentValue < 5) continue;

      options.push({
        count: i,
        value: installmentValue,
        total: totalValue,
        hasInterest: hasInterest,
        label: `${i}x de R$ ${installmentValue.toFixed(2)} ${hasInterest ? 'com juros' : 'sem juros'}`
      });
    }

    return options;
  }

  /**
   * Processa o pagamento via Edge Function (backend), com idempotência.
   */
  async processPayment(data: PaymentRequest): Promise<PaymentResult> {
    const response = await this.supabase.callFunction('process-payment', data);

    if (!response?.ok) {
      throw new Error(response?.message || 'Falha ao processar pagamento.');
    }

    return {
      success: true,
      id: String(response.paymentId || response.id || Date.now()),
      status: response.status,
      qrCode: response.qrCode,
      qrCodeBase64: response.qrCodeBase64
    };
  }
}

