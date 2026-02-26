
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StoreService } from '../../services/store.service';

@Component({
  selector: 'app-exchange-policy',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="container mx-auto px-4 py-16 max-w-3xl">
      <div class="border-b border-gray-100 dark:border-gray-700 pb-8 mb-8">
        <h1 class="text-3xl font-black text-gray-800 dark:text-white mb-2">Política de Trocas e Devoluções</h1>
        <p class="text-gray-500 dark:text-gray-400">Queremos que sua experiência na YARA Kids seja incrível. Se precisar trocar, é fácil.</p>
      </div>

      <div class="prose prose-pink prose-lg text-gray-600 dark:text-gray-300 space-y-6">
        
        <div class="bg-brand-soft dark:bg-brand-pink/10 p-6 rounded-2xl border border-brand-pink/20">
          <h3 class="font-bold text-brand-dark dark:text-white text-lg mb-2">🔄 Resumo Rápido</h3>
          <ul class="list-disc pl-5 space-y-1 text-sm font-medium text-gray-700 dark:text-gray-200">
            <li><strong>7 dias</strong> para devolução por arrependimento (Reembolso total).</li>
            <li><strong>30 dias</strong> para troca por tamanho ou defeito.</li>
            <li>O produto deve estar com <strong>etiqueta e sem uso</strong>.</li>
          </ul>
        </div>

        <h3 class="text-xl font-bold text-brand-dark dark:text-white mt-8">1. Troca por Tamanho ou Cor</h3>
        <p>Se a roupinha não serviu, não se preocupe. Você pode solicitar a troca em até 30 dias corridos após o recebimento. A primeira troca é por nossa conta (frete grátis).</p>

        <h3 class="text-xl font-bold text-brand-dark dark:text-white">2. Devolução por Arrependimento</h3>
        <p>De acordo com o Código de Defesa do Consumidor, você tem 7 dias corridos após receber o produto para desistir da compra. O valor será reembolsado integralmente na mesma forma de pagamento.</p>

        <h3 class="text-xl font-bold text-brand-dark dark:text-white">3. Produto com Defeito</h3>
        <p>Todos os nossos produtos passam por um rigoroso controle de qualidade. Se ainda assim receber uma peça com defeito, entre em contato imediatamente. Faremos a troca ou devolução sem nenhum custo.</p>

        <h3 class="text-xl font-bold text-brand-dark dark:text-white">Como Solicitar?</h3>
        <p>Entre em contato através do nosso WhatsApp <strong>{{ whatsappDisplay }}</strong> informando o número do pedido e o motivo da troca. Nossa equipe irá te orientar sobre o envio.</p>

        <div class="mt-12 flex gap-4">
          <a [href]="whatsappLink" target="_blank" class="px-6 py-3 bg-brand-dark dark:bg-white dark:text-brand-dark text-white font-bold rounded-xl hover:bg-black dark:hover:bg-gray-200 transition-colors no-underline text-center">Falar com Atendimento</a>
          <a routerLink="/" class="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors no-underline text-center">Voltar para Loja</a>
        </div>
      </div>
    </div>
  `
})
export class ExchangePolicyComponent {
  private store = inject(StoreService);

  get whatsappDisplay() {
    return this.store.institutional().whatsapp?.trim() || 'WhatsApp';
  }

  get whatsappLink() {
    const digits = this.whatsappDisplay.replace(/\D/g, '');
    if (!digits) return '#';
    const normalized = digits.startsWith('55') ? digits : `55${digits}`;
    return `https://wa.me/${normalized}`;
  }
}

