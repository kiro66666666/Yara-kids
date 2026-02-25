
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
  private ai: GoogleGenAI | null = null;
  private store = inject(StoreService);
  
  messages = signal<ChatMessage[]>([
    { role: 'model', text: 'Olá! Sou a assistente virtual da YARA Kids. Posso te ajudar a encontrar nossa loja, ver status de pedidos ou recomendar o look perfeito! O que você procura hoje?' }
  ]);
  
  isLoading = signal(false);

  constructor() {
    if (environment.geminiApiKey) {
      this.ai = new GoogleGenAI({ apiKey: environment.geminiApiKey });
    }
  }

  private getProductContext(): string {
    const products = this.store.products();
    if (products.length === 0) return "O catálogo está vazio no momento.";

    // Otimização: Enviar apenas campos essenciais para economizar tokens e acelerar o processamento
    return products.map(p => 
      `- ${p.name} (ID: ${p.id}): R$ ${p.price.toFixed(2)}. Cat: ${p.categoryName}. Gênero: ${p.gender}. Estoque: ${p.stock}. Cores: ${p.colors.map(c => c.name).join(', ')}.`
    ).join('\n');
  }

  private getKnowledgeContext(): string {
    const institutional = this.store.institutional();
    const faqs = this.store.faqs();
    const faqBlock = faqs.length
      ? faqs.map(f => `- Q: ${f.question}\n  A: ${f.answer}`).join('\n')
      : '- Sem FAQs cadastradas.';
    return `
FAQS:
${faqBlock}

POLÍTICAS:
- Privacidade: ${institutional.privacyText}
- Termos: ${institutional.termsText}
- Trocas: ${institutional.exchangePolicyText}

CONTATO:
- WhatsApp: ${institutional.whatsapp}
- E-mail: ${institutional.email}
- Endereço: ${institutional.address}
`;
  }

  async sendMessage(userMessage: string) {
    if (!this.ai) {
      this.messages.update(msgs => [
        ...msgs,
        { role: 'model', text: 'Assistente indisponivel: configure geminiApiKey no app-config.js.' }
      ]);
      return;
    }

    // 1. Adiciona mensagem do usuário
    this.messages.update(msgs => [...msgs, { role: 'user', text: userMessage }]);
    this.isLoading.set(true);

    try {
      const model = 'gemini-2.5-flash';
      const catalogContext = this.getProductContext();
      const knowledgeContext = this.getKnowledgeContext();
      
      // 2. Prepara o Streaming
      const result = await this.ai.models.generateContentStream({
        model: model,
        contents: [
          {
            role: 'user',
            parts: [
              { text: `CONTEXTO DO CATÁLOGO DA LOJA YARA KIDS (Use isso para recomendar produtos reais):
              ${catalogContext}

              CONTEXTO INSTITUCIONAL E FAQ (Use para dúvidas sobre regras, trocas, privacidade e suporte):
              ${knowledgeContext}
              
              INSTRUÇÕES ESPECIAIS:
              1. Se o usuário pedir uma recomendação de produto que temos em estoque, sugira-o educadamente.
              2. IMPORTANTE: Para mostrar o cartão do produto no chat, você DEVE incluir a tag [REC:ID_DO_PRODUTO] no final da sua frase. Exemplo: "Recomendo este lindo vestido! [REC:demo-1]"
              3. Se o usuário perguntar sobre localização, use a ferramenta googleSearch. A loja fica em Redenção, PA.
              4. Seja breve, amigável e use emojis. Responda em Português do Brasil.
              
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



