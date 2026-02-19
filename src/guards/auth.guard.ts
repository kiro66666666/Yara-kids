import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { StoreService } from '../services/store.service';

function mapSupabaseUserToStore(dataUser: any) {
  const isAdmin = dataUser?.email === 'admin@yarakids.com.br';
  return {
    id: dataUser.id,
    email: dataUser.email,
    phone: dataUser.phone,
    name: dataUser.user_metadata?.['full_name'] || dataUser.user_metadata?.['name'] || dataUser.email?.split('@')[0] || dataUser.phone || (isAdmin ? 'Administradora' : 'Cliente'),
    role: isAdmin ? 'admin' as const : 'customer' as const
  };
}

/**
 * Protege rotas que exigem login (Minha Conta)
 */
export const authGuard: CanActivateFn = () => {
  const store = inject(StoreService);
  const router = inject(Router);

  if (store.user()) {
    return true;
  }

  return store.supabase.supabase.auth.getUser().then(({ data }) => {
    if (data.user) {
      store.user.set(mapSupabaseUserToStore(data.user));
      return true;
    }

    store.showToast('Faça login para acessar esta página', 'info');
    return router.createUrlTree(['/login']);
  }).catch(() => {
    store.showToast('Faça login para acessar esta página', 'info');
    return router.createUrlTree(['/login']);
  });
};

/**
 * Protege rotas de Administrador
 */
export const adminGuard: CanActivateFn = () => {
  const store = inject(StoreService);
  const router = inject(Router);

  if (store.user()?.role === 'admin') {
    return true;
  }

  return store.supabase.supabase.auth.getUser().then(({ data }) => {
    if (data.user?.email === 'admin@yarakids.com.br') {
      store.user.set(mapSupabaseUserToStore(data.user));
      return true;
    }

    store.showToast('Acesso negado. Área restrita.', 'error');
    return router.createUrlTree(['/']);
  }).catch(() => {
    store.showToast('Acesso negado. Área restrita.', 'error');
    return router.createUrlTree(['/']);
  });
};
