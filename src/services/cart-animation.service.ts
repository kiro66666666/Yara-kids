
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CartAnimationService {

  animate(startElement: HTMLElement) {
    // 1. Identify Target (Desktop Header Icon or Mobile Bottom Nav Icon)
    const isMobile = window.innerWidth < 1024;
    const targetId = isMobile ? 'mobile-cart' : 'desktop-cart';
    const targetElement = document.getElementById(targetId);

    if (!startElement || !targetElement) return;

    // 2. Clone the Image
    const clone = startElement.cloneNode(true) as HTMLElement;
    const rect = startElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();

    // 3. Style the Clone
    clone.style.position = 'fixed';
    clone.style.top = `${rect.top}px`;
    clone.style.left = `${rect.left}px`;
    clone.style.width = `${rect.width}px`;
    clone.style.height = `${rect.height}px`;
    clone.style.zIndex = '9999';
    clone.style.borderRadius = '1rem';
    clone.style.opacity = '0.8';
    clone.style.pointerEvents = 'none';
    clone.style.transition = 'all 0.8s cubic-bezier(0.19, 1, 0.22, 1)'; // Smooth easing

    document.body.appendChild(clone);

    // 4. Trigger Animation (Next Frame)
    requestAnimationFrame(() => {
      clone.style.top = `${targetRect.top + 10}px`; // Center on icon
      clone.style.left = `${targetRect.left + 10}px`;
      clone.style.width = '20px';
      clone.style.height = '20px';
      clone.style.opacity = '0';
      clone.style.transform = 'rotate(360deg)';
    });

    // 5. Cleanup
    setTimeout(() => {
      clone.remove();
      // Optional: Bump effect on cart icon
      targetElement.classList.add('animate-bump');
      setTimeout(() => targetElement.classList.remove('animate-bump'), 300);
    }, 800);
  }
}
