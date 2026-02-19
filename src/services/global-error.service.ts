
import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { StoreService } from './store.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private injector: Injector) {}

  handleError(error: any) {
    // Log the error to console for debugging
    console.error('🔥 Global Error Caught:', error);

    try {
      // Use Injector to get StoreService lazily to prevent Circular Dependency
      const store = this.injector.get(StoreService);
      
      // Check if it's a chunk load error (common after deployments)
      if (error.message && error.message.includes('Loading chunk')) {
         store.showToast('Nova versão disponível! Recarregando...', 'info');
         window.location.reload();
         return;
      }

      // Show friendly message
      store.showToast('Ops! Ocorreu um erro inesperado. Tente recarregar.', 'error');
    } catch (e) {
      console.error('Error handling failed', e);
    }
  }
}

