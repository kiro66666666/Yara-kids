
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 bg-gray-50 dark:bg-brand-darkbg transition-colors duration-300">
      <div class="text-9xl font-black text-brand-soft dark:text-brand-lilac/40 drop-shadow-sm select-none">404</div>
      <div class="absolute text-6xl animate-bounce-gentle">🎈</div>
      
      <h1 class="text-3xl font-black text-gray-800 dark:text-white mt-8 mb-2">Ops! Página não encontrada</h1>
      <p class="text-gray-500 dark:text-gray-300 max-w-md mb-10">Parece que o link que você clicou não existe ou foi movido. Que tal voltar e ver nossas novidades?</p>
      
      <a routerLink="/" class="px-10 py-4 bg-brand-pink text-white font-bold rounded-full hover:bg-pink-600 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
        Ir para Página Inicial
      </a>
    </div>
  `
})
export class NotFoundComponent {}

