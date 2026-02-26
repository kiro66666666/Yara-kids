
import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './guards/auth.guard';

export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) 
  },
  { 
    path: 'catalogo', 
    loadComponent: () => import('./pages/catalog/catalog.component').then(m => m.CatalogComponent) 
  },
  { 
    path: 'produto/:id', 
    loadComponent: () => import('./pages/product-detail/product-detail.component').then(m => m.ProductDetailComponent) 
  },
  { 
    path: 'carrinho', 
    loadComponent: () => import('./pages/cart/cart.component').then(m => m.CartComponent) 
  },
  { 
    path: 'checkout', 
    loadComponent: () => import('./pages/checkout/checkout.component').then(m => m.CheckoutComponent) 
  },
  { 
    path: 'login', 
    loadComponent: () => import('./pages/auth/login.component').then(m => m.LoginComponent) 
  },
  {
    path: 'redefinir-senha',
    loadComponent: () => import('./pages/auth/update-password.component').then(m => m.UpdatePasswordComponent)
  },
  {
    path: 'minha-conta/update-password',
    loadComponent: () => import('./pages/auth/update-password.component').then(m => m.UpdatePasswordComponent)
  },
  { 
    path: 'minha-conta', 
    loadComponent: () => import('./pages/account/account.component').then(m => m.AccountComponent),
    canActivate: [authGuard] // Protected
  },
  { 
    path: 'admin', 
    loadComponent: () => import('./pages/admin/dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [adminGuard] // Protected (Admin Only)
  },
  { 
    path: 'contato', 
    loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent) 
  },
  {
    path: 'feedback',
    loadComponent: () => import('./pages/feedback/feedback.component').then(m => m.FeedbackComponent)
  },
  { 
    path: 'faq', 
    loadComponent: () => import('./pages/legal/faq.component').then(m => m.FaqComponent) 
  },
  { 
    path: 'politica-de-trocas', 
    loadComponent: () => import('./pages/legal/exchange-policy.component').then(m => m.ExchangePolicyComponent) 
  },
  { 
    path: 'privacidade', 
    loadComponent: () => import('./pages/legal/privacy.component').then(m => m.PrivacyComponent) 
  },
  { 
    path: 'termos', 
    loadComponent: () => import('./pages/legal/terms.component').then(m => m.TermsComponent) 
  },
  { 
    path: 'sobre', 
    loadComponent: () => import('./pages/legal/about.component').then(m => m.AboutComponent) 
  },
  { 
    path: '**', 
    loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent) 
  }
];
