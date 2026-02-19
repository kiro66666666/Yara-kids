
import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../ui/icons';

@Component({
  selector: 'app-size-guide',
  standalone: true,
  imports: [CommonModule, IconComponent, FormsModule],
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" (click)="close.emit()">
        <div class="bg-white dark:bg-brand-darksurface rounded-3xl w-full max-w-3xl shadow-2xl relative animate-slide-up flex flex-col max-h-[90vh] border border-gray-100 dark:border-gray-700" (click)="$event.stopPropagation()">
          
          <!-- Header -->
          <div class="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center shrink-0">
            <div>
              <h3 class="text-2xl font-black text-gray-800 dark:text-white flex items-center gap-2">
                <span class="text-3xl">📏</span> Guia de Medidas
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Encontre o tamanho perfeito para a criança.</p>
            </div>
            <button (click)="close.emit()" class="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-white rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              <app-icon name="x" size="20px"></app-icon>
            </button>
          </div>

          <div class="overflow-y-auto p-6 md:p-8 custom-scrollbar">
            
            <!-- Mode Switcher -->
            <div class="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl mb-8">
               <button (click)="mode.set('table')" class="flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                 [class.bg-white]="mode() === 'table'" [class.text-brand-dark]="mode() === 'table'" [class.shadow-sm]="mode() === 'table'"
                 [class.text-gray-500]="mode() !== 'table'"
                 [class.dark:bg-brand-pink]="mode() === 'table'" [class.dark:text-white]="mode() === 'table'">
                 📋 Tabela Completa
               </button>
               <button (click)="mode.set('calculator')" class="flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                 [class.bg-white]="mode() === 'calculator'" [class.text-brand-pink]="mode() === 'calculator'" [class.shadow-sm]="mode() === 'calculator'"
                 [class.text-gray-500]="mode() !== 'calculator'"
                 [class.dark:bg-brand-pink]="mode() === 'calculator'" [class.dark:text-white]="mode() === 'calculator'">
                 ✨ Provador Virtual
               </button>
            </div>

            <!-- MODE: CALCULATOR -->
            @if (mode() === 'calculator') {
               <div class="animate-fade-in">
                  <div class="text-center mb-8">
                    <div class="w-20 h-20 bg-brand-soft dark:bg-pink-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl animate-bounce-gentle">🤖</div>
                    <h4 class="text-xl font-bold text-gray-800 dark:text-white">Calculadora de Tamanho</h4>
                    <p class="text-gray-500 text-sm">Digite as medidas e nossa IA sugere o ideal.</p>
                  </div>

                  <div class="grid grid-cols-2 gap-6 max-w-md mx-auto mb-8">
                     <div>
                       <label class="block text-xs font-bold text-gray-400 uppercase mb-2">Peso (kg)</label>
                       <div class="relative">
                         <input type="number" [(ngModel)]="weight" placeholder="Ex: 12" class="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl font-bold text-center text-lg focus:border-brand-pink outline-none dark:text-white">
                         <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">KG</span>
                       </div>
                     </div>
                     <div>
                       <label class="block text-xs font-bold text-gray-400 uppercase mb-2">Altura (cm)</label>
                       <div class="relative">
                         <input type="number" [(ngModel)]="height" placeholder="Ex: 90" class="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl font-bold text-center text-lg focus:border-brand-pink outline-none dark:text-white">
                         <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">CM</span>
                       </div>
                     </div>
                  </div>

                  @if (suggestedSize()) {
                    <div class="bg-gradient-to-r from-brand-pink to-brand-lilac p-6 rounded-3xl text-white text-center shadow-lg transform transition-all animate-slide-up">
                       <p class="text-xs font-bold uppercase tracking-widest opacity-90 mb-2">Tamanho Recomendado</p>
                       <div class="text-6xl font-black mb-2 drop-shadow-md">{{ suggestedSize() }}</div>
                       <p class="text-sm font-medium">Baseado em {{ weight() }}kg e {{ height() }}cm</p>
                    </div>
                    <button (click)="resetCalculator()" class="block mx-auto mt-6 text-gray-400 text-xs font-bold underline hover:text-brand-pink">Calcular novamente</button>
                  } @else {
                    <button (click)="calculateSize()" [disabled]="!weight() || !height()" class="w-full max-w-xs mx-auto block py-4 bg-brand-dark dark:bg-white dark:text-brand-dark text-white font-bold rounded-2xl shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed">
                      Descobrir Tamanho
                    </button>
                  }
               </div>
            }

            <!-- MODE: TABLE -->
            @if (mode() === 'table') {
              <div class="animate-fade-in">
                <!-- Tabs -->
                <div class="flex gap-2 mb-8 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                  <button (click)="activeTab.set('baby')" 
                    class="flex-1 py-2.5 rounded-lg text-sm font-bold transition-all"
                    [class.bg-white]="activeTab() === 'baby'"
                    [class.text-brand-pink]="activeTab() === 'baby'"
                    [class.shadow-sm]="activeTab() === 'baby'"
                    [class.text-gray-500]="activeTab() !== 'baby'"
                    [class.dark:bg-brand-pink]="activeTab() === 'baby'"
                    [class.dark:text-white]="activeTab() === 'baby'">
                    👶 Bebês
                  </button>
                  <button (click)="activeTab.set('kids')" 
                    class="flex-1 py-2.5 rounded-lg text-sm font-bold transition-all"
                    [class.bg-white]="activeTab() === 'kids'"
                    [class.text-brand-pink]="activeTab() === 'kids'"
                    [class.shadow-sm]="activeTab() === 'kids'"
                    [class.text-gray-500]="activeTab() !== 'kids'"
                    [class.dark:bg-brand-pink]="activeTab() === 'kids'"
                    [class.dark:text-white]="activeTab() === 'kids'">
                    👧 Primeiros Passos
                  </button>
                  <button (click)="activeTab.set('junior')" 
                    class="flex-1 py-2.5 rounded-lg text-sm font-bold transition-all"
                    [class.bg-white]="activeTab() === 'junior'"
                    [class.text-brand-pink]="activeTab() === 'junior'"
                    [class.shadow-sm]="activeTab() === 'junior'"
                    [class.text-gray-500]="activeTab() !== 'junior'"
                    [class.dark:bg-brand-pink]="activeTab() === 'junior'"
                    [class.dark:text-white]="activeTab() === 'junior'">
                    👑 Infantil
                  </button>
                </div>

                <div class="grid md:grid-cols-3 gap-8 mb-8">
                  <!-- Visual Guide -->
                  <div class="md:col-span-1 bg-brand-soft dark:bg-pink-900/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center border-2 border-dashed border-brand-pink/20">
                      <div class="relative w-24 h-48 mx-auto mb-4">
                        <!-- Simple abstract body shape -->
                        <div class="w-20 h-20 bg-brand-pink/20 rounded-full mx-auto mb-1"></div> <!-- Head -->
                        <div class="w-24 h-24 bg-brand-pink/20 rounded-3xl mx-auto"></div> <!-- Torso -->
                        
                        <!-- Lines -->
                        <div class="absolute top-24 left-0 right-0 h-0.5 bg-brand-pink flex items-center justify-between">
                          <span class="w-1 h-3 bg-brand-pink"></span>
                          <span class="text-[10px] font-bold bg-white dark:bg-gray-800 text-brand-pink px-1 rounded">Busto</span>
                          <span class="w-1 h-3 bg-brand-pink"></span>
                        </div>
                        <div class="absolute top-36 left-0 right-0 h-0.5 bg-brand-pink flex items-center justify-between">
                          <span class="w-1 h-3 bg-brand-pink"></span>
                          <span class="text-[10px] font-bold bg-white dark:bg-gray-800 text-brand-pink px-1 rounded">Cintura</span>
                          <span class="w-1 h-3 bg-brand-pink"></span>
                        </div>
                      </div>
                      <p class="text-xs font-bold text-gray-600 dark:text-gray-300">Como Medir?</p>
                      <p class="text-[10px] text-gray-500 dark:text-gray-400 mt-1">Use uma fita métrica sem apertar. Meça o tórax logo abaixo dos braços e a cintura na altura do umbigo.</p>
                  </div>

                  <!-- Table Area -->
                  <div class="md:col-span-2 overflow-x-auto">
                    <table class="w-full text-sm text-left border-collapse">
                      <thead>
                        <tr class="text-gray-400 dark:text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
                          <th class="py-3 font-medium">Tamanho</th>
                          <th class="py-3 font-medium">Idade (aprox)</th>
                          <th class="py-3 font-medium">Altura</th>
                          <th class="py-3 font-medium">Peso</th>
                        </tr>
                      </thead>
                      <tbody class="text-gray-600 dark:text-gray-300">
                        @if(activeTab() === 'baby') {
                          <tr class="border-b border-gray-50 dark:border-gray-800"><td class="py-3 font-black text-brand-dark dark:text-white">RN</td><td>0 - 1 mês</td><td>até 52cm</td><td>2 - 4kg</td></tr>
                          <tr class="border-b border-gray-50 dark:border-gray-800"><td class="py-3 font-black text-brand-dark dark:text-white">P</td><td>1 - 3 meses</td><td>52 - 62cm</td><td>4 - 6kg</td></tr>
                          <tr class="border-b border-gray-50 dark:border-gray-800"><td class="py-3 font-black text-brand-dark dark:text-white">M</td><td>3 - 6 meses</td><td>62 - 67cm</td><td>6 - 8kg</td></tr>
                          <tr class="border-b border-gray-50 dark:border-gray-800"><td class="py-3 font-black text-brand-dark dark:text-white">G</td><td>6 - 9 meses</td><td>67 - 72cm</td><td>8 - 10kg</td></tr>
                          <tr><td class="py-3 font-black text-brand-dark dark:text-white">GG</td><td>9 - 12 meses</td><td>72 - 77cm</td><td>10 - 12kg</td></tr>
                        }
                        @if(activeTab() === 'kids') {
                            <tr class="border-b border-gray-50 dark:border-gray-800"><td class="py-3 font-black text-brand-dark dark:text-white">1</td><td>12 - 18 meses</td><td>80 - 86cm</td><td>10 - 12kg</td></tr>
                            <tr class="border-b border-gray-50 dark:border-gray-800"><td class="py-3 font-black text-brand-dark dark:text-white">2</td><td>18 - 24 meses</td><td>86 - 92cm</td><td>12 - 14kg</td></tr>
                            <tr><td class="py-3 font-black text-brand-dark dark:text-white">3</td><td>2 - 3 anos</td><td>92 - 98cm</td><td>14 - 16kg</td></tr>
                        }
                        @if(activeTab() === 'junior') {
                            <tr class="border-b border-gray-50 dark:border-gray-800"><td class="py-3 font-black text-brand-dark dark:text-white">4</td><td>3 - 4 anos</td><td>98 - 104cm</td><td>16 - 18kg</td></tr>
                            <tr class="border-b border-gray-50 dark:border-gray-800"><td class="py-3 font-black text-brand-dark dark:text-white">6</td><td>4 - 6 anos</td><td>104 - 116cm</td><td>18 - 23kg</td></tr>
                            <tr class="border-b border-gray-50 dark:border-gray-800"><td class="py-3 font-black text-brand-dark dark:text-white">8</td><td>6 - 8 anos</td><td>116 - 128cm</td><td>23 - 30kg</td></tr>
                            <tr class="border-b border-gray-50 dark:border-gray-800"><td class="py-3 font-black text-brand-dark dark:text-white">10</td><td>8 - 10 anos</td><td>128 - 140cm</td><td>30 - 35kg</td></tr>
                            <tr><td class="py-3 font-black text-brand-dark dark:text-white">12</td><td>10 - 12 anos</td><td>140 - 152cm</td><td>35 - 45kg</td></tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            }

            <!-- Footer Note -->
            <div class="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl flex items-start gap-3 border border-yellow-100 dark:border-yellow-900/30">
              <div class="bg-yellow-100 dark:bg-yellow-900/50 p-2 rounded-lg text-yellow-600 dark:text-yellow-400">💡</div>
              <div>
                <p class="font-bold text-yellow-800 dark:text-yellow-400 text-sm">Dica de Mãe</p>
                <p class="text-xs text-yellow-700 dark:text-yellow-300/80 mt-1">Crianças crescem rápido! Na dúvida entre dois tamanhos, sempre escolha o maior. Assim a roupinha dura mais tempo.</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    }
  `
})
export class SizeGuideComponent {
  isOpen = input.required<boolean>();
  close = output<void>();
  
  mode = signal<'table' | 'calculator'>('table');
  activeTab = signal<'baby' | 'kids' | 'junior'>('kids');

  // Calculator State
  weight = signal<number | null>(null);
  height = signal<number | null>(null);
  suggestedSize = signal<string | null>(null);

  calculateSize() {
    const w = this.weight();
    const h = this.height();

    if (!w || !h) return;

    // Simple Logic (Approximate Brazilian Standards)
    let size = '';

    if (w <= 4 || h <= 52) size = 'RN';
    else if (w <= 6 || h <= 62) size = 'P';
    else if (w <= 8 || h <= 67) size = 'M';
    else if (w <= 10 || h <= 72) size = 'G';
    else if (w <= 12 || h <= 77) size = 'GG';
    else if (w <= 12 || h <= 86) size = '1';
    else if (w <= 14 || h <= 92) size = '2';
    else if (w <= 16 || h <= 98) size = '3';
    else if (w <= 18 || h <= 104) size = '4';
    else if (w <= 23 || h <= 116) size = '6';
    else if (w <= 30 || h <= 128) size = '8';
    else if (w <= 35 || h <= 140) size = '10';
    else size = '12';

    this.suggestedSize.set(size);
  }

  resetCalculator() {
    this.suggestedSize.set(null);
    this.weight.set(null);
    this.height.set(null);
  }
}

