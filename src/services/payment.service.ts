
import { Injectable } from '@angular/core';

export interface InstallmentOption {
  count: number;
  value: number;
  total: number;
  hasInterest: boolean;
  label: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  
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
   * Simula o processamento do pagamento com o Mercado Pago
   */
  async processPayment(data: any): Promise<{ success: boolean; id: string }> {
    // Aqui entraria a chamada real para o seu Backend -> Mercado Pago
    console.log('Enviando dados para processamento:', data);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          id: Math.floor(Math.random() * 1000000000).toString()
        });
      }, 2000); // Simula delay de rede de 2 segundos
    });
  }
}

