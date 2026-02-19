
import { Injectable, signal, inject } from '@angular/core';
import { GoogleGenAI } from "@google/genai";
import { StoreService } from './store.service';
import { environment } from '../environments/environment';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isMap?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private ai: GoogleGenAI;
  private store = inject(StoreService);
  
  messages = signal<ChatMessage[]>([
    { role: 'model', text: 'Olá! Sou a assistente virtual da YARA Kids. Posso te ajudar a encontrar nossa loja, ver status de pedidos, tirar dúvidas sobre trocas ou recomendar o look perfeito! O que você procura hoje?' }
  ]);
  
  isLoading = signal(false);

  constructor() {
    // FIX: Use environment variable defined in Angular, not process.env
    this.ai = new GoogleGenAI({ apiKey: environment.geminiApiKey });
  }

  private getContext(): string {
    const products = this.store.products();
    const inst = this.store.institutional();
    const faqs = this.store.faqs();

    let context = "";

    // 1. Catálogo de Produtos (Resumido)
    if (products.length > 0) {
      context += "CATÁLOGO DE PRODUTOS:\n";
      context += products.map(p => 
        `- ${p.name} (ID: ${p.id}): R$ ${p.price.toFixed(2)}. Cat: ${p.categoryName}. Gênero: ${p.gender}. Estoque: ${p.stock}. Cores: ${p.colors.map(c => c.name).join(', ')}.`
      ).join('\n');
      context += "\n\n";
    }

    // 2. Perguntas Frequentes (FAQ) Dinâmicas
    if (faqs.length > 0) {
      context += "PERGUNTAS FREQUENTES (FAQ Oficiais):\n";
      context += faqs.map(f => `P: ${f.question}\nR: ${f.answer}`).join('\n\n');
      context += "\n\n";
    }

    // 3. Informações Institucionais e Políticas
    context += "INFORMAÇÕES INSTITUCIONAIS E POLÍTICAS:\n";
    context += `QUEM SOMOS: ${inst.aboutText}\n\n`;
    context += `POLÍTICA DE TROCAS: ${inst.exchangePolicyText}\n\n`;
    context += `TERMOS DE USO (Resumo): ${inst.termsText}\n\n`;
    context += `PRIVACIDADE (Resumo): ${inst.privacyText}\n\n`;
    context += `CONTATO: WhatsApp ${inst.whatsapp}, Email ${inst.email}, Endereço ${inst.address}.\n`;

    return context;
  }

  async sendMessage(userMessage: string) {
    // 1. Adiciona mensagem do usuário
    this.messages.update(msgs => [...msgs, { role: 'user', text: userMessage }]);
    this.isLoading.set(true);

    try {
      const model = 'gemini-2.5-flash';
      const fullContext = this.getContext();
      
      // 2. Prepara o Streaming
      const result = await this.ai.models.generateContentStream({
        model: model,
        contents: [
          {
            role: 'user',
            parts: [
              { text: `VOCÊ É A ASSISTENTE VIRTUAL DA LOJA "YARA KIDS".
              
              USE O CONTEXTO ABAIXO PARA RESPONDER ÀS DÚVIDAS DO CLIENTE.
              
              CONTEXTO DA LOJA:
              ${fullContext}
              
              INSTRUÇÕES ESPECIAIS:
              1. Se o usuário pedir recomendação de produto EM ESTOQUE, sugira. Use a tag [REC:ID_DO_PRODUTO] no final para mostrar o card.
              2. Se a dúvida for sobre TROCAS, ENTREGAS ou PAGAMENTO, use EXATAMENTE as informações da seção de FAQ ou Políticas fornecidas no contexto. Não invente regras.
              3. Se não souber a resposta com base no contexto, peça para o cliente chamar no WhatsApp: ${this.store.institutional().whatsapp}.
              4. Se o usuário perguntar localização, use a ferramenta googleSearch para confirmar, mas priorize o endereço do contexto: ${this.store.institutional().address}.
              5. Seja breve, amigável, use emojis e responda em Português do Brasil.
              
              Pergunta do cliente: ${userMessage}` }
            ]
          }
        ],
        config: {
          tools: [{ googleSearch: {} }], 
        }
      });

      // 3. Cria um balão vazio para a resposta da IA
      this.messages.update(msgs => [...msgs, { role: 'model', text: '' }]);

      // 4. Processa o Streaming (Chunk by Chunk)
      for await (const chunk of result) {
        const chunkText = chunk.text;
        
        if (chunkText) {
          // Atualiza a última mensagem adicionando o novo pedaço de texto
          this.messages.update(currentMsgs => {
            const newMsgs = [...currentMsgs];
            const lastMsgIndex = newMsgs.length - 1;
            
            // Cria uma cópia da última mensagem para manter a imutabilidade
            const updatedMsg = { ...newMsgs[lastMsgIndex] };
            updatedMsg.text += chunkText;
            
            newMsgs[lastMsgIndex] = updatedMsg;
            return newMsgs;
          });
        }
      }

    } catch (error) {
      console.error('AI Error:', error);
      this.messages.update(msgs => [...msgs, { role: 'model', text: 'Ops, tive um probleminha técnico. Pode tentar novamente?' }]);
    } finally {
      this.isLoading.set(false);
    }
  }
}
