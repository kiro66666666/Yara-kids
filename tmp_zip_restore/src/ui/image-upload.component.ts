
import { Component, output, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from './icons';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="w-full">
      <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">{{ label() }}</label>
      
      @if (!currentImage() && !previewUrl) {
        <div 
          class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-brand-pink hover:bg-brand-soft/50 dark:hover:bg-brand-pink/10 transition-all group h-40"
          (click)="fileInput.click()"
          (drop)="onDrop($event)"
          (dragover)="onDragOver($event)"
          (dragleave)="onDragLeave($event)">
          
          <input #fileInput type="file" (change)="onFileSelected($event)" accept="image/*" hidden>
          
          <div class="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-400 group-hover:text-brand-pink group-hover:scale-110 transition-all mb-2">
            <app-icon name="image-off" size="20px"></app-icon>
          </div>
          <p class="text-sm font-bold text-gray-500 dark:text-gray-400 group-hover:text-brand-pink">Clique ou arraste a imagem</p>
          <p class="text-[10px] text-gray-400">JPG, PNG ou WEBP (Max 2MB)</p>
        </div>
      } @else {
        <div class="relative w-full h-48 rounded-xl overflow-hidden group border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <img [src]="previewUrl || currentImage()" class="w-full h-full object-contain">
          
          <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
             <button (click)="removeImage()" class="px-4 py-2 bg-red-500 text-white rounded-lg font-bold text-xs hover:bg-red-600 flex items-center gap-2 transform hover:scale-105 transition-all">
               <app-icon name="trash" size="14px"></app-icon> Remover
             </button>
          </div>
        </div>
      }
    </div>
  `
})
export class ImageUploadComponent {
  label = input<string>('Imagem do Produto');
  currentImage = input<string | undefined | null>(''); 
  
  // Emits base64 for preview AND File for upload
  imageSelected = output<string>();
  fileSelected = output<File>(); // New output

  previewUrl: string | null = null;

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) this.processFile(file);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer?.files.length) {
      this.processFile(event.dataTransfer.files[0]);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  processFile(file: File) {
    if (file.size > 2 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 2MB');
      return;
    }

    // Create a local preview
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.previewUrl = e.target.result;
      this.imageSelected.emit(this.previewUrl!);
      this.fileSelected.emit(file); // Emit the actual file for upload
    };
    reader.readAsDataURL(file);
  }

  removeImage() {
    this.previewUrl = null;
    this.imageSelected.emit('');
    // Emit dummy empty file or just handle logic in parent
  }
}
