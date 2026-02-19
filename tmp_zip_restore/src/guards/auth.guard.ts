
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { StoreService } from '../services/store.service';

/**
 * Protege rotas que exigem login (Minha Conta)
 */
export const authGuard: CanActivateFn = () => {
  const store = inject(StoreService);
  const router = inject(Router);

  if (store.user()) {
    return true;
  }

  store.showToast('Faça login para acessar esta página', 'info');
  router.navigate(['/login']);
  return false;
};

/**
 * Protege rotas de Administrador
 */
export const adminGuard: CanActivateFn = () => {
  const store = inject(StoreService);
  const router = inject(Router);
  const user = store.user();

  if (user && user.role === 'admin') {
    return true;
  }

  store.showToast('Acesso negado. Área restrita.', 'error');
  router.navigate(['/']);
  return false;
};
