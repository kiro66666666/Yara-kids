
import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appMask]',
  standalone: true
})
export class MaskDirective {
  @Input('appMask') maskType: 'cpf' | 'phone' | 'cep' | 'card' | 'expiry' = 'phone';

  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  onInput(event: any) {
    let value = event.target.value.replace(/\D/g, ''); // Remove non-digits
    
    if (this.maskType === 'cpf') {
      if (value.length > 11) value = value.slice(0, 11);
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } 
    else if (this.maskType === 'phone') {
      if (value.length > 11) value = value.slice(0, 11);
      if (value.length > 10) {
        value = value.replace(/^(\d\d)(\d{5})(\d{4}).*/, '($1) $2-$3');
      } else {
        value = value.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, '($1) $2-$3');
      }
    }
    else if (this.maskType === 'cep') {
      if (value.length > 8) value = value.slice(0, 8);
      value = value.replace(/^(\d{5})(\d)/, '$1-$2');
    }
    else if (this.maskType === 'card') {
      if (value.length > 16) value = value.slice(0, 16);
      value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    }
    else if (this.maskType === 'expiry') {
      if (value.length > 4) value = value.slice(0, 4);
      if (value.length >= 2) {
        value = value.replace(/^(\d{2})(\d{0,2})/, '$1/$2');
      }
    }

    this.el.nativeElement.value = value;
    // Dispatch input event for Angular forms to detect change
    this.el.nativeElement.dispatchEvent(new Event('input'));
  }
}
