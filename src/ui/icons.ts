
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-icon',
  standalone: true,
  template: `
    <svg [class]="class()" [style.width]="size()" [style.height]="size()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      @if (name() === 'search') { <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line> }
      @if (name() === 'heart') { <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path> }
      @if (name() === 'user') { <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle> }
      @if (name() === 'shopping-bag') { <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path> }
      @if (name() === 'menu') { <line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line> }
      @if (name() === 'x') { <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line> }
      @if (name() === 'star') { <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon> }
      @if (name() === 'trash') { <polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path> }
      @if (name() === 'edit') { <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path> }
      @if (name() === 'chevron-left') { <polyline points="15 18 9 12 15 6"></polyline> }
      @if (name() === 'chevron-right') { <polyline points="9 18 15 12 9 6"></polyline> }
      @if (name() === 'chevron-down') { <polyline points="6 9 12 15 18 9"></polyline> }
      @if (name() === 'check') { <polyline points="20 6 9 17 4 12"></polyline> }
      @if (name() === 'package') { <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line> }
      @if (name() === 'dollar-sign') { <line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path> }
      @if (name() === 'log-out') { <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line> }
      @if (name() === 'crown') { <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"></path> }
      @if (name() === 'home') { <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline> }
      @if (name() === 'grid') { <rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect> }
      @if (name() === 'truck') { <rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle> }
      @if (name() === 'map-pin') { <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle> }
      @if (name() === 'phone') { <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path> }
      @if (name() === 'mail') { <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline> }
      @if (name() === 'help-circle') { <circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line> }
      
      <!-- Social & UI -->
      @if (name() === 'instagram') { <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line> }
      @if (name() === 'whatsapp') { <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path> }
      @if (name() === 'image-off') { <line x1="1" y1="1" x2="23" y2="23"></line><path d="M21 21l-4.486-4.494M9.534 9.516A3 3 0 0 0 12 12a3 3 0 0 0 2.476-4.482M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6"></path> }
      @if (name() === 'sun') { <circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line> }
      @if (name() === 'moon') { <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path> }
      
      <!-- New Icons -->
      @if (name() === 'share') { <circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line> }
      @if (name() === 'link') { <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path> }
      
      <!-- Brand Icons -->
      @if (name() === 'google') { <path fill="none" d="M0 0h24v24H0z"></path><path d="M12 11v2.167h5.178c-.2 1.25-1.467 3.666-5.178 3.666-3.11 0-5.656-2.522-5.656-5.633 0-3.11 2.545-5.633 5.656-5.633 1.767 0 3.011.756 3.69 1.4l1.71-1.711C16.322 3.822 14.367 2.8 12 2.8 6.922 2.8 2.8 6.922 2.8 12s4.122 9.2 9.2 9.2c5.31 0 8.845-3.733 8.845-9 0-.6-.056-1.056-.1-1.533H12z" stroke-width="0" fill="currentColor"></path> }
      
      <!-- NEW RAINBOW ICON -->
      @if (name() === 'rainbow') { <path d="M4 17c0-5 3.5-9 9-9s9 4 9 9" stroke="#FF69B4" stroke-width="2.5" stroke-linecap="round"></path><path d="M7 17c0-3.5 2.5-6 6-6s6 2.5 6 6" stroke="#9B7EDE" stroke-width="2.5" stroke-linecap="round"></path><path d="M10 17c0-1.5 1.5-3 3-3s3 1.5 3 3" stroke="#FFD700" stroke-width="2.5" stroke-linecap="round"></path><circle cx="3" cy="18" r="2" fill="#E2E8F0" stroke="none"></circle><circle cx="6" cy="18" r="2" fill="#E2E8F0" stroke="none"></circle><circle cx="21" cy="18" r="2" fill="#E2E8F0" stroke="none"></circle><circle cx="18" cy="18" r="2" fill="#E2E8F0" stroke="none"></circle> }
    </svg>
  `
})
export class IconComponent {
  name = input.required<string>();
  class = input<string>('');
  size = input<string>('24px');
}
