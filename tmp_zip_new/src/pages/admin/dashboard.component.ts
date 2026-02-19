
import { Component, inject, OnInit, signal, computed, ElementRef, ViewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService, Category, Product, Banner, Institutional, Order, ProductVariant, Coupon, InstagramPost, FaqItem } from '../../services/store.service';
import { Router } from '@angular/router';
import { IconComponent } from '../../ui/icons';
import { FormsModule } from '@angular/forms';
import { ImageUploadComponent } from '../../ui/image-upload.component';
import * as d3 from 'd3';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, IconComponent, FormsModule, ImageUploadComponent],
  templateUrl: './dashboard.component.html'
})
export class AdminDashboardComponent implements OnInit {
  store = inject(StoreService);
  router = inject(Router);
  
  view = signal<'dashboard' | 'products' | 'categories' | 'banners' | 'orders' | 'settings' | 'coupons' | 'messages' | 'instagram' | 'faq' | 'feedbacks'>('dashboard');
  todayStr = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  showCategoryModal = false;
  showProductModal = false;
  showBannerModal = false;
  showCouponModal = false; 
  showFaqModal = false; 
  mobileMenuOpen = false;
  
  selectedOrder: Order | null = null;
  isEditing = false;
  
  // Temporary storage for File objects before upload
  tempImageFile: File | null = null;
  
  // Specific file for About Us image in Settings
  aboutImageFile: File | null = null;
  
  newCategory: Partial<Category> = { name: '', image: '' };
  newProduct: Partial<Product> = { name: '', price: 0, stock: 0, image: '', categoryId: '', description: '', gender: 'girl', gallery: [], video: '', colorImages: [] };
  newBanner: Partial<Banner> = { title: '', subtitle: '', link: '/catalogo', image: '', location: 'home-hero', description: '', badgeText: '', endDate: '' };
  newCoupon: Partial<Coupon> = { code: '', type: 'percent', value: 0, minPurchase: 0, active: true, description: '' };
  newFaq: Partial<FaqItem> = { question: '', answer: '' };

  tempSizes = '';
  tempColors = '';
  tempVariants: ProductVariant[] = [];
  tempColorMap: { [key: string]: string } = {}; 
  tempGalleryTags: { [key: string]: string } = {};

  tempSettings: Institutional = { ...this.store.institutional() };
  
  selectedProducts = signal<string[]>([]);

  // Instagram Upload
  newInstagramImage: string = '';
  newInstagramFile: File | null = null;

  bannerRoutes = [
    { label: 'Início (Home)', value: '/' },
    { label: 'Catálogo Completo', value: '/catalogo' },
    { label: 'Catálogo: Vestidos', value: '/catalogo?cat=vestidos' },
    { label: 'Catálogo: Conjuntos', value: '/catalogo?cat=conjuntos' },
    { label: 'Catálogo: Acessórios', value: '/catalogo?cat=acessorios' },
    { label: 'Catálogo: Promoções', value: '/catalogo?promo=true' },
    { label: 'Catálogo: Lançamentos', value: '/catalogo?sort=newest' },
    { label: 'Página Sobre Nós', value: '/sobre' },
    { label: 'Página de Contato', value: '/contato' }
  ];

  @ViewChild('chartContainer') chartContainer!: ElementRef;

  constructor() {
    effect(() => {
      const v = this.view();
      const stats = this.store.dashboardStats();
      const theme = this.store.theme();
      
      if (v === 'dashboard') {
        setTimeout(() => this.createChart(stats.chart.labels, stats.chart.data, theme), 100);
      }
    });
  }

  ngOnInit() {
    if (this.store.user()?.role !== 'admin') {
      this.router.navigate(['/']);
    }
  }

  createChart(labels: string[], data: number[], theme: 'light' | 'dark') {
    if (!this.chartContainer) return;

    const D3 = d3 as any;

    const element = this.chartContainer.nativeElement;
    D3.select(element).selectAll('*').remove(); 

    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = element.offsetWidth - margin.left - margin.right;
    const height = element.offsetHeight - margin.top - margin.bottom;

    const svg = D3.select(element)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const lineColor = '#FF69B4'; 
    const areaColorStart = theme === 'dark' ? 'rgba(255, 105, 180, 0.5)' : 'rgba(255, 105, 180, 0.2)';
    const areaColorEnd = theme === 'dark' ? 'rgba(255, 105, 180, 0.0)' : 'rgba(255, 105, 180, 0.0)';
    const textColor = theme === 'dark' ? '#9CA3AF' : '#6B7280';
    const gridColor = theme === 'dark' ? '#374151' : '#E5E7EB';

    const x = D3.scalePoint().domain(labels).range([0, width]);
    const y = D3.scaleLinear().domain([0, D3.max(data) || 100]).range([height, 0]);

    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', 'area-gradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    
    gradient.append('stop').attr('offset', '0%').attr('stop-color', areaColorStart);
    gradient.append('stop').attr('offset', '100%').attr('stop-color', areaColorEnd);

    const area = D3.area().x((d: any, i: any) => x(labels[i])!).y0(height).y1((d: any) => y(d)).curve(D3.curveMonotoneX);
    const line = D3.line().x((d: any, i: any) => x(labels[i])!).y((d: any) => y(d)).curve(D3.curveMonotoneX);

    svg.append('path').datum(data).attr('fill', 'url(#area-gradient)').attr('d', area);
    svg.append('path').datum(data).attr('fill', 'none').attr('stroke', lineColor).attr('stroke-width', 3).attr('d', line);

    svg.selectAll('.dot').data(data).enter().append('circle')
      .attr('class', 'dot').attr('cx', (d: any, i: any) => x(labels[i])!).attr('cy', (d: any) => y(d)).attr('r', 5)
      .attr('fill', '#fff').attr('stroke', lineColor).attr('stroke-width', 2);

    svg.append('g').attr('transform', `translate(0,${height})`).call(D3.axisBottom(x).tickSize(0).tickPadding(10)).attr('color', textColor).select('.domain').remove();
    svg.append('g').call(D3.axisLeft(y).ticks(5).tickSize(-width).tickPadding(10)).attr('color', textColor).select('.domain').remove();
    svg.selectAll('.tick line').attr('stroke', gridColor).attr('stroke-dasharray', '2,2');
  }

  logout() {
    this.store.logout();
    this.router.navigate(['/']);
  }

  switchView(newView: any) {
    if (newView === 'settings') {
      this.tempSettings = { ...this.store.institutional() }; 
      this.aboutImageFile = null; // Reset file
    }
    this.view.set(newView);
    this.mobileMenuOpen = false;
  }

  openOrderDetails(order: Order) {
    this.selectedOrder = order;
  }

  // --- Instagram Actions ---
  onInstagramImageSelected(base64: string) { this.newInstagramImage = base64; }
  onInstagramFileSelected(file: File) { this.newInstagramFile = file; }
  
  async addInstagramPost() {
      if(!this.newInstagramImage && !this.newInstagramFile) return;
      
      let imageUrl = this.newInstagramImage;
      
      if (this.newInstagramFile && this.store.mode() === 'real') {
          const url = await this.store.supabase.uploadImage(this.newInstagramFile, 'instagram');
          if(url) imageUrl = url;
      }
      
      await this.store.addInstagramPost(imageUrl);
      this.newInstagramImage = '';
      this.newInstagramFile = null;
  }

  async deleteInstagramPost(id: string) {
      if(confirm('Remover post do feed?')) {
          await this.store.deleteInstagramPost(id);
      }
  }

  // --- Settings Actions ---
  
  onAboutImageSelected(base64: string) { this.tempSettings.aboutImage = base64; }
  onAboutFileSelected(file: File) { this.aboutImageFile = file; }

  async saveSettings() {
    this.store.showToast('Salvando configurações...', 'info');
    
    // Upload About Image if changed
    if (this.aboutImageFile && this.store.mode() === 'real') {
        const url = await this.store.supabase.uploadImage(this.aboutImageFile, 'institutional');
        if(url) this.tempSettings.aboutImage = url;
    }

    this.store.updateInstitutional(this.tempSettings);
  }

  // --- NEW: EXPORT CSV ---
  exportOrdersToCSV() {
    const orders = this.store.orders();
    if (orders.length === 0) {
      this.store.showToast('Sem pedidos para exportar', 'info');
      return;
    }

    const headers = ['ID', 'Data', 'Cliente', 'CPF', 'Telefone', 'Total', 'Status', 'Itens'];
    const rows = orders.map(o => [
      o.id,
      o.date,
      `"${o.customerName}"`,
      `"${o.customerCpf || ''}"`,
      `"${o.customerPhone || ''}"`,
      o.total.toFixed(2),
      o.status,
      `"${o.items.map(i => `${i.quantity}x ${i.name} (${i.selectedSize})`).join(', ')}"`
    ]);

    const csvContent = [
      headers.join(','), 
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `pedidos_yarakids_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    this.store.showToast('Relatório baixado com sucesso!', 'success');
  }

  // --- NEW: PRINT SHIPPING LABEL (Improved) ---
  printShippingLabel(order: Order) {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;

    const itemsHtml = order.items.map(i => `
      <tr>
        <td style="padding: 5px; border-bottom: 1px solid #eee;">${i.quantity}x ${i.name} (${i.selectedSize}/${i.selectedColor})</td>
      </tr>
    `).join('');

    const html = `
      <html>
        <head>
          <title>Etiqueta de Envio #${order.id}</title>
          <style>
            body { font-family: 'Arial', sans-serif; padding: 20px; background: #f0f0f0; }
            .page { background: white; padding: 30px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
            .header h1 { margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px; }
            .logo { font-weight: bold; color: #FF69B4; font-size: 20px; }
            
            .section { margin-bottom: 25px; border: 1px solid #eee; padding: 15px; border-radius: 8px; position: relative; }
            .section-title { font-size: 10px; font-weight: bold; text-transform: uppercase; color: #888; position: absolute; top: -8px; left: 10px; background: white; padding: 0 5px; }
            
            .dest-name { font-size: 18px; font-weight: bold; margin: 0 0 5px 0; }
            .address { font-size: 14px; color: #333; line-height: 1.4; }
            .cep { font-size: 16px; font-weight: bold; margin-top: 5px; display: block; }
            
            .remetente { font-size: 11px; color: #666; margin-top: 10px; line-height: 1.3; }
            
            .barcode { text-align: center; margin: 20px 0; border-top: 2px dashed #ccc; padding-top: 20px; }
            .barcode-lines { height: 60px; background: repeating-linear-gradient(to right, #000, #000 2px, #fff 2px, #fff 5px); width: 80%; margin: 0 auto 10px; }
            .tracking-code { font-family: 'Courier New', monospace; font-weight: bold; font-size: 14px; }
            
            .declaration { margin-top: 30px; page-break-before: always; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            
            @media print {
              body { background: none; padding: 0; }
              .page { box-shadow: none; border: none; width: 100%; max-width: 100%; }
            }
          </style>
        </head>
        <body onload="window.print();">
          <div class="page">
            <!-- LABEL -->
            <div class="header">
              <div class="logo">YARA Kids</div>
              <h1>SEDEX</h1>
              <div style="font-size: 12px; font-weight: bold; border: 1px solid #000; padding: 5px;">PLP: ${Math.floor(Math.random()*100000)}</div>
            </div>
            
            <div class="section">
              <div class="section-title">DESTINATÁRIO</div>
              <div class="dest-name">${order.customerName}</div>
              <div class="address">
                ${order.shippingAddress ? `${order.shippingAddress.street}, ${order.shippingAddress.number}` : 'Endereço não informado'}<br>
                ${order.shippingAddress?.city || 'Cidade não informada'}<br>
                CPF: ${order.customerCpf || 'N/A'} • Tel: ${order.customerPhone || 'N/A'}
                <span class="cep">CEP: ${order.shippingAddress?.cep || '00000-000'}</span>
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">REMETENTE</div>
              <div style="font-weight: bold; font-size: 14px;">YARA Kids Moda Infantil</div>
              <div class="remetente">
                Av. Brasil, 120 - Centro<br>
                Redenção - PA<br>
                CEP: 68550-000<br>
                CNPJ: 00.000.000/0001-00
              </div>
            </div>
            
            <div class="barcode">
              <div class="barcode-lines"></div>
              <div class="tracking-code">${order.id}BR</div>
              <p style="font-size: 10px; color: #999; margin-top: 5px;">Pedido #${order.id} • ${order.date}</p>
            </div>

            <!-- DECLARATION OF CONTENTS (Mini) -->
            <div style="border-top: 2px dashed #000; margin-top: 30px; padding-top: 20px;">
               <h3 style="font-size: 14px; text-transform: uppercase; margin-bottom: 10px;">Declaração de Conteúdo (Simplificada)</h3>
               <table>
                 ${itemsHtml}
               </table>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  }

  // --- Category Logic (Added missing methods) ---
  openCategoryModal(cat?: Category) { 
    this.isEditing = !!cat;
    this.newCategory = cat ? { ...cat } : { name: '', image: '' }; 
    this.tempImageFile = null;
    this.showCategoryModal = true; 
  }
  
  onCategoryImageSelected(base64: string) { this.newCategory.image = base64; }
  onCategoryFileSelected(file: File) { this.tempImageFile = file; }

  async saveCategory() {
    if (!this.newCategory.name) return this.store.showToast('Nome obrigatório', 'error');

    this.store.showToast('Salvando...', 'info');

    if (this.tempImageFile && this.store.mode() === 'real') {
       const url = await this.store.supabase.uploadImage(this.tempImageFile, 'categories');
       if (url) this.newCategory.image = url;
    }

    const c: Category = {
      id: this.isEditing ? this.newCategory.id! : 'cat-' + Date.now(),
      name: this.newCategory.name!,
      slug: this.newCategory.name!.toLowerCase().replace(/\s+/g, '-'),
      image: this.newCategory.image || ''
    };

    if (this.isEditing) {
      this.store.updateCategory(c);
    } else {
      this.store.addCategory(c);
    }
    this.showCategoryModal = false;
    this.store.showToast('Categoria salva!', 'success');
  }

  deleteCategory(id: string) {
    if (confirm('Tem certeza que deseja excluir esta categoria?')) {
      this.store.deleteCategory(id);
    }
  }

  // --- Banner Logic ---
  onBannerImageSelected(b: string) { this.newBanner.image = b; }
  onBannerFileSelected(file: File) { this.tempImageFile = file; }

  openBannerModal(b?: Banner) {
    this.isEditing = !!b;
    this.newBanner = b ? { ...b } : { title: '', subtitle: '', link: '/catalogo', image: '', location: 'home-hero', description: '', badgeText: 'Oferta', endDate: '' };
    this.tempImageFile = null;
    this.showBannerModal = true;
  }

  async saveBanner() {
    if (this.tempImageFile && this.store.mode() === 'real') {
       const url = await this.store.supabase.uploadImage(this.tempImageFile, 'banners');
       if (url) this.newBanner.image = url;
    }
    
    if(!this.newBanner.image) return this.store.showToast('Imagem obrigatória', 'error');
    const b: Banner = { ...this.newBanner as Banner, id: this.isEditing ? this.newBanner.id! : 'ban-' + Date.now() };
    this.isEditing ? this.store.updateBanner(b) : this.store.addBanner(b);
    this.showBannerModal = false;
    this.store.showToast('Banner salvo!', 'success');
  }
  
  deleteBanner(id: string) { if(confirm('Excluir?')) this.store.deleteBanner(id); }
  getBannerLocationName(l: string) { const m: any = {'home-hero': 'Home: Principal', 'home-mid': 'Home: Meio', 'catalog-top': 'Catálogo: Topo', 'catalog-sidebar': 'Catálogo: Lateral'}; return m[l] || l; }

  // --- Product Logic ---
  openProductModal(prod?: Product) { 
    this.isEditing = !!prod;
    this.tempImageFile = null;
    if (prod) {
      this.newProduct = JSON.parse(JSON.stringify(prod));
      this.tempVariants = [...(this.newProduct.variants || [])];
      this.newProduct.colors?.forEach(c => this.tempColorMap[c.name] = c.hex);
      this.tempSizes = [...new Set(this.tempVariants.map(v => v.size))].join(', ');
      this.tempColors = [...new Set(this.tempVariants.map(v => v.color))].join(', ');
      this.tempGalleryTags = {};
      this.newProduct.colorImages?.forEach(ci => this.tempGalleryTags[ci.image] = ci.color);
    } else {
      const firstCat = this.store.categories()[0]?.id || '';
      this.newProduct = { name: '', price: 0, stock: 0, image: '', categoryId: firstCat, description: '', gender: 'girl', gallery: [], video: '', colorImages: [] }; 
      this.tempSizes = ''; this.tempColors = ''; this.tempVariants = []; this.tempColorMap = {}; this.tempGalleryTags = {};
    }
    this.showProductModal = true; 
  }

  onProductImageSelected(base64: string) { this.newProduct.image = base64; }
  onProductFileSelected(file: File) { this.tempImageFile = file; }

  onGalleryImageSelected(e: any) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev: any) => { if (!this.newProduct.gallery) this.newProduct.gallery = []; this.newProduct.gallery.push(ev.target.result); };
      reader.readAsDataURL(file);
    }
  }

  removeGalleryImage(index: number, imgUrl: string) { this.newProduct.gallery?.splice(index, 1); delete this.tempGalleryTags[imgUrl]; }

  moveGalleryImage(index: number, dir: -1 | 1) {
    if (!this.newProduct.gallery) return;
    const n = index + dir;
    if (n >= 0 && n < this.newProduct.gallery.length) {
      [this.newProduct.gallery[index], this.newProduct.gallery[n]] = [this.newProduct.gallery[n], this.newProduct.gallery[index]];
    }
  }

  onVideoSelected(e: any) {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 15*1024*1024) alert('Vídeo grande!');
      const reader = new FileReader();
      reader.onload = (ev: any) => this.newProduct.video = ev.target.result;
      reader.readAsDataURL(file);
    }
  }

  generateVariants() {
    if (!this.tempSizes || !this.tempColors) return this.store.showToast('Preencha campos', 'error');
    const sizes = this.tempSizes.split(',').map(s => s.trim()).filter(s => s);
    const colors = this.tempColors.split(',').map(c => c.trim()).filter(c => c);
    this.tempVariants = [];
    colors.forEach(c => {
      if (!this.tempColorMap[c]) this.tempColorMap[c] = this.getColorHex(c);
      sizes.forEach(s => this.tempVariants.push({ size: s, color: c, stock: 1 }));
    });
  }

  getAvailableColors() {
    const manualColors = this.tempColors.split(',').map(c => c.trim()).filter(c => c);
    const variantColors = this.tempVariants.map(v => v.color);
    return [...new Set([...manualColors, ...variantColors])];
  }

  removeVariant(i: number) { this.tempVariants.splice(i, 1); }
  getTotalStock() { return this.tempVariants.reduce((a, b) => a + b.stock, 0); }
  getUniqueColorNames() { return [...new Set(this.tempVariants.map(v => v.color))]; }

  async saveProduct() {
    if (!this.newProduct.name || !this.newProduct.price) return this.store.showToast('Dados incompletos', 'error');
    
    this.store.showToast('Salvando...', 'info');

    if (this.tempImageFile && this.store.mode() === 'real') {
       const url = await this.store.supabase.uploadImage(this.tempImageFile);
       if (url) this.newProduct.image = url;
    }

    const cat = this.store.categories().find(c => c.id === this.newProduct.categoryId);
    let fSizes = ['U'], fColors = [{name: 'Padrão', hex: '#ccc'}], fStock = this.newProduct.stock || 0;

    if (this.tempVariants.length > 0) {
       fStock = this.getTotalStock();
       fSizes = [...new Set(this.tempVariants.map(v => v.size))];
       fColors = this.getUniqueColorNames().map(n => ({ name: n, hex: this.tempColorMap[n] || '#ccc' }));
    }

    const cImgs = Object.entries(this.tempGalleryTags).filter(([_, c]) => c).map(([i, c]) => ({ image: i, color: c }));
    let gall = this.newProduct.gallery || [];
    if (this.newProduct.image && !gall.includes(this.newProduct.image)) gall.unshift(this.newProduct.image);

    const p: Product = {
      id: this.isEditing && this.newProduct.id ? this.newProduct.id : 'prod-' + Date.now(),
      name: this.newProduct.name,
      categoryId: this.newProduct.categoryId || (cat?.id || 'geral'),
      categoryName: cat ? cat.name : 'Geral',
      gender: this.newProduct.gender || 'girl',
      price: this.newProduct.price,
      originalPrice: this.newProduct.price * 1.2,
      discount: 0,
      image: this.newProduct.image || '',
      gallery: gall,
      colorImages: cImgs, 
      video: this.newProduct.video,
      sizes: fSizes,
      colors: fColors,
      stock: fStock,
      variants: this.tempVariants.length > 0 ? this.tempVariants : undefined,
      rating: 5, reviews: 0, isNew: true, isBestSeller: false,
      description: this.newProduct.description || ''
    };

    if (this.isEditing) await this.store.updateProduct(p); else await this.store.addProduct(p);
    this.showProductModal = false;
  }

  deleteProduct(id: string) { if(confirm('Excluir?')) this.store.deleteProduct(id); }

  getColorHex(n: string): string {
    const map: any = { 'rosa': '#FF69B4', 'azul': '#60A5FA', 'verde': '#4ADE80', 'amarelo': '#FCD34D', 'branco': '#FFFFFF', 'preto': '#000000', 'vermelho': '#EF4444' };
    for (const k in map) if (n.toLowerCase().includes(k)) return map[k];
    return '#CCCCCC'; 
  }

  toggleAllProducts(e: any) { e.target.checked ? this.selectedProducts.set(this.store.products().map(p => p.id)) : this.selectedProducts.set([]); }
  toggleProductSelection(id: string) { this.selectedProducts.update(c => c.includes(id) ? c.filter(x => x !== id) : [...c, id]); }
  bulkDeleteProducts() { if (confirm('Excluir selecionados?')) { this.store.showToast('Excluídos', 'success'); this.selectedProducts.set([]); } }

  // --- Coupon Logic ---
  openCouponModal() { this.newCoupon = { code: '', type: 'percent', value: 0, minPurchase: 0, active: true, description: '' }; this.showCouponModal = true; }
  saveCoupon() {
    if (!this.newCoupon.code || !this.newCoupon.value) return;
    this.store.addCoupon({ ...this.newCoupon as Coupon, id: 'cup-' + Date.now(), code: this.newCoupon.code.toUpperCase() });
    this.showCouponModal = false;
  }
  deleteCoupon(id: string) { if (confirm('Excluir?')) this.store.deleteCoupon(id); }

  getStatusLabel(s: Order['status']) { const m: any = {'pending': 'Pendente', 'paid': 'Pago', 'shipped': 'Enviado', 'delivered': 'Entregue', 'cancelled': 'Cancelado'}; return m[s] || s; }
  updateOrderStatus(id: string, e: Event) { const s = (e.target as HTMLSelectElement).value; if (s) this.store.updateOrderStatus(id, s as any); }

  // --- FAQ Management Logic ---
  openFaqModal(faq?: FaqItem) {
    this.isEditing = !!faq;
    this.newFaq = faq ? { ...faq } : { question: '', answer: '' };
    this.showFaqModal = true;
  }

  saveFaq() {
    if (!this.newFaq.question || !this.newFaq.answer) return this.store.showToast('Preencha pergunta e resposta', 'error');
    
    const item: FaqItem = {
      id: this.isEditing ? this.newFaq.id! : 'faq-' + Date.now(),
      question: this.newFaq.question!,
      answer: this.newFaq.answer!
    };

    if (this.isEditing) {
      this.store.updateFaq(item);
    } else {
      this.store.addFaq(item);
    }
    this.showFaqModal = false;
  }

  deleteFaq(id: string) {
    if (confirm('Tem certeza que deseja excluir esta pergunta?')) {
      this.store.deleteFaq(id);
    }
  }

  // --- Feedback Logic ---
  deleteFeedback(id: string) {
    if(confirm('Excluir este feedback?')) {
      this.store.deleteFeedback(id);
    }
  }
}
