
# 🎀 YARA Kids - Moda Infantil

Bem-vindo ao projeto **YARA Kids v3.2**, uma loja virtual completa desenvolvida com Angular moderno e TailwindCSS.

## 🚀 Como Executar o Projeto

Este projeto utiliza Angular v17+ (Standalone Components).

### Opção 1: Visual Studio Code (Local)

1.  **Pré-requisitos**: Certifique-se de ter o [Node.js](https://nodejs.org/) instalado (v18 ou superior).
2.  **Instale o Angular CLI** (se não tiver):
    ```bash
    npm install -g @angular/cli
    ```
3.  **Baixe/Clone este código** para uma pasta.
4.  **Inicialize**: Como este é um código gerado via AI Studio (estrutura simplificada), você precisará criar um projeto Angular padrão e copiar os arquivos `src` para dentro dele.
    ```bash
    ng new yara-kids --style=css --routing --ssr=false
    # Escolha 'Yes' para roteamento e 'CSS' para estilos.
    ```
5.  **Instale dependências**: O projeto usa Tailwind via CDN no `index.html` para facilitar o teste, mas você pode instalar via npm se preferir.
6.  **Copie os arquivos**: Copie todo o conteúdo da pasta `src` gerada aqui para a pasta `src` do seu novo projeto Angular.
7.  **Execute**:
    ```bash
    ng serve
    ```
8.  Acesse `http://localhost:4200`.

### Opção 2: StackBlitz (Online - Mais Fácil)

1.  Acesse [StackBlitz](https://stackblitz.com/).
2.  Crie um novo projeto **Angular**.
3.  Copie e cole o conteúdo de cada arquivo fornecido nos respectivos arquivos do projeto online.
4.  O projeto rodará automaticamente.

## 📱 Recursos Principais

*   **Design Responsivo**: Mobile-first com TailwindCSS.
*   **Gestão de Estado**: Usando Angular Signals (`store.service.ts`).
*   **Carrinho & Checkout**: Fluxo completo com validação de estoque e cupom.
*   **Painel Administrativo**:
    *   Senha: `YaraAdmin@2026!`
    *   Gestão de Produtos, Categorias e Pedidos.
    *   Alternância entre Modo Visual (Dados Demo) e Modo Real.
*   **Integrações**:
    *   WhatsApp para finalizar compras.
    *   Botão "Avise-me quando chegar".
    *   Feed do Instagram simulado.

## 📁 Estrutura de Pastas

*   `src/components`: Componentes reutilizáveis (Header, Footer, Cards).
*   `src/pages`: Páginas principais (Home, Catálogo, Admin, Checkout).
*   `src/services`: Lógica de negócio e estado global.
*   `src/ui`: Elementos de UI base (ícones, etc).

---
*Desenvolvido para YARA Kids - Fevereiro 2026*
