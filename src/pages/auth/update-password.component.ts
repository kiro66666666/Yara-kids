import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { StoreService } from '../../services/store.service';

@Component({
  selector: 'app-update-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-brand-darkbg py-12 px-4 flex items-center justify-center">
      <div class="w-full max-w-md bg-white dark:bg-brand-darksurface border border-gray-100 dark:border-gray-700 rounded-3xl shadow-sm p-6 md:p-8">
        <h1 class="text-2xl font-black text-gray-800 dark:text-white mb-2">Redefinir senha</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">Defina uma nova senha para concluir a recuperação da conta.</p>

        <div class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Nova senha</label>
            <input type="password" [(ngModel)]="password" class="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-brand-pink outline-none" placeholder="Mínimo de 6 caracteres">
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Confirmar senha</label>
            <input type="password" [(ngModel)]="confirmPassword" class="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-brand-pink outline-none" placeholder="Repita a nova senha">
          </div>
        </div>

        <button type="button" (click)="submit()" [disabled]="loading" class="w-full mt-6 py-3 rounded-xl bg-brand-pink text-white font-bold hover:bg-pink-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
          {{ loading ? 'Salvando...' : 'Atualizar senha' }}
        </button>

        <a routerLink="/login" class="mt-4 block text-center text-sm text-gray-500 dark:text-gray-400 hover:text-brand-pink">Voltar para login</a>
      </div>
    </div>
  `
})
export class UpdatePasswordComponent {
  private store = inject(StoreService);
  private router = inject(Router);

  password = '';
  confirmPassword = '';
  loading = false;

  async submit() {
    if (this.loading) return;
    if (!this.password || this.password.length < 6) {
      this.store.showToast('A senha deve ter pelo menos 6 caracteres.', 'error');
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.store.showToast('As senhas não coincidem.', 'error');
      return;
    }

    this.loading = true;
    try {
      const { data: sessionData } = await this.store.supabase.supabase.auth.getSession();
      if (!sessionData.session) {
        this.store.showToast('Link de recuperação inválido ou expirado. Solicite novamente.', 'error');
        this.loading = false;
        return;
      }

      const { error } = await this.store.supabase.supabase.auth.updateUser({ password: this.password });
      if (error) throw error;

      this.store.showToast('Senha atualizada com sucesso! Faça login novamente.', 'success');
      await this.store.supabase.supabase.auth.signOut();
      this.router.navigate(['/login']);
    } catch (e: any) {
      this.store.showToast(e?.message || 'Não foi possível atualizar a senha.', 'error');
    } finally {
      this.loading = false;
    }
  }
}

