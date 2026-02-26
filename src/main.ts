
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { provideRouter, withHashLocation } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations'; // Important for Angular Animations if needed
import { ErrorHandler } from '@angular/core';
import { GlobalErrorHandler } from './services/global-error.service';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes, withHashLocation()),
    provideAnimations(),
    { provide: ErrorHandler, useClass: GlobalErrorHandler }
  ]
}).then(() => {
  // Service Worker Registration
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('SW registered: ', registration);

          // Force activation of fresh worker when available
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }

          registration.addEventListener('updatefound', () => {
            const installingWorker = registration.installing;
            if (!installingWorker) return;

            installingWorker.addEventListener('statechange', () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                installingWorker.postMessage({ type: 'SKIP_WAITING' });
              }
            });
          });
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
    });

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });

    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'notification-click' && event.data?.deeplink) {
        const deeplink = String(event.data.deeplink);
        if (deeplink.startsWith('/#/')) {
          window.location.hash = deeplink.replace('/#', '');
        } else if (deeplink.startsWith('/')) {
          window.location.hash = deeplink;
        }
      }
    });
  }
}).catch((err) => console.error(err));
