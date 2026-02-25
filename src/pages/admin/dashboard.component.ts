
import { Component, inject, OnInit, OnDestroy, signal, computed, ElementRef, ViewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService, Category, Product, Banner, Institutional, Order, ProductVariant, Coupon, InstagramPost, FaqItem } from '../../services/store.service';
import { NotificationService } from '../../services/notification.service';
import { NotificationAudience, NotificationComposerInput } from '../../services/notification.types';
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
export class AdminDashboardComponent implements OnInit, OnDestroy {
  store = inject(StoreService);
  notifications = inject(NotificationService);
  router = inject(Router);
  
  view = signal<'dashboard' | 'products' | 'categories' | 'banners' | 'orders' | 'settings' | 'coupons' | 'messages' | 'instagram' | 'faq' | 'feedbacks' | 'notifications'>('dashboard');
  todayStr = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  showCategoryModal = false;
  showProductModal = false;
  showBannerModal = false;
  showCouponModal = false; 
  showFaqModal = false;
  sidebarOpen = signal(true);
  isDesktopViewport = signal(typeof window !== 'undefined' ? window.innerWidth >= 768 : true);
  
  selectedOrder: Order | null = null;
  isEditing = false;
  
  // Temporary storage for File objects before upload
  tempImageFile: File | null = null;
  aboutImageFile: File | null = null;
  tempCategoryVideoFile: File | null = null;
  tempBannerVideoFile: File | null = null;
  
  newCategory: Partial<Category> = { name: '', image: '', mediaType: 'image', videoUrl: '', playAudioOnHover: false };
  newProduct: Partial<Product> = { name: '', price: 0, originalPrice: 0, stock: 0, image: '', categoryId: '', description: '', gender: 'girl', gallery: [], video: '', colorImages: [] };
  newBanner: Partial<Banner> = { title: '', subtitle: '', link: '/catalogo', image: '', location: 'home-hero', description: '', badgeText: '', endDate: '', mediaType: 'image', videoUrl: '', playAudioOnHover: false, active: true, order: 1 };
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
  newInstagramMediaType: 'image' | 'video' = 'image';
  newInstagramVideoUrl = '';
  newInstagramPlayAudioOnHover = false;

  notificationComposer: NotificationComposerInput = {
    title: '',
    body: '',
    image_url: '',
    deeplink: '/minha-conta',
    audience: 'all',
    category_slug: '',
    send_now: true,
    schedule_for: null,
    channels: ['web', 'android']
  };
  templateName = '';
  bannerLinkSearch = signal('');

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

  allBannerRoutes = computed(() => {
    const base = [...this.bannerRoutes];
    const dynamicCategories = this.store.categories().map(c => ({
      label: `Categoria: ${c.name}`,
      value: `/catalogo?cat=${c.slug}`
    }));
    const dynamicProducts = this.store.products().slice(0, 200).map(p => ({
      label: `Produto: ${p.name}`,
      value: `/produto/${p.id}`
    }));
    const merged = [...base, ...dynamicCategories, ...dynamicProducts];
    const dedup = new Map<string, { label: string; value: string }>();
    for (const item of merged) {
      if (!dedup.has(item.value)) dedup.set(item.value, item);
    }
    return Array.from(dedup.values());
  });

  sortedBanners = computed(() =>
    [...this.store.banners()].sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
  );
  filteredBannerRoutes = computed(() => {
    const query = this.bannerLinkSearch().trim().toLowerCase();
    const routes = this.allBannerRoutes();
    if (!query) return routes.slice(0, 60);
    return routes
      .filter(r => r.label.toLowerCase().includes(query) || r.value.toLowerCase().includes(query))
      .slice(0, 120);
  });

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
    this.handleViewportChange();
    window.addEventListener('resize', this.handleViewportChange);
    this.notifications.loadAdminData();
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.handleViewportChange);
  }

  audiences: { value: NotificationAudience; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'active_customers', label: 'Clientes ativos' },
    { value: 'inactive_customers', label: 'Clientes inativos' },
    { value: 'interest_category', label: 'Interesse por categoria' },
    { value: 'abandoned_cart', label: 'Carrinho abandonado' },
    { value: 'admins', label: 'Somente admins' }
  ];

  async sendCampaign() {
    if (!this.notificationComposer.title || !this.notificationComposer.body) {
      this.store.showToast('Título e mensagem são obrigatórios', 'error');
      return;
    }
    try {
      await this.notifications.createCampaign(this.notificationComposer, this.store.user()?.email);
      this.store.showToast('Campanha criada com sucesso', 'success');
      this.notificationComposer = {
        ...this.notificationComposer,
        title: '',
        body: '',
        image_url: '',
        category_slug: '',
        schedule_for: null
      };
    } catch (e: any) {
      this.store.showToast('Erro ao criar campanha: ' + e.message, 'error');
    }
  }

  async saveCurrentTemplate() {
    if (!this.templateName || !this.notificationComposer.title || !this.notificationComposer.body) {
      this.store.showToast('Nome, título e mensagem são obrigatórios', 'error');
      return;
    }

    await this.notifications.saveTemplate({
      name: this.templateName,
      title: this.notificationComposer.title,
      body: this.notificationComposer.body,
      deeplink: this.notificationComposer.deeplink,
      image_url: this.notificationComposer.image_url,
      audience: this.notificationComposer.audience,
      category_slug: this.notificationComposer.category_slug
    });
    this.store.showToast('Template salvo', 'success');
  }

  applyTemplate(templateId: string) {
    const found = this.notifications.templates().find(t => t.id === templateId);
    if (!found) return;
    this.notificationComposer = {
      ...this.notificationComposer,
      title: found.title,
      body: found.body,
      deeplink: found.deeplink || '/minha-conta',
      image_url: found.image_url || '',
      audience: found.audience,
      category_slug: found.category_slug || ''
    };
  }

  async retryCampaign(campaignId: string) {
    await this.notifications.retryFailed(campaignId);
    this.store.showToast('Reenvio solicitado', 'success');
  }

  async dispatchCampaign(campaignId: string) {
    await this.notifications.dispatchCampaign(campaignId);
    this.store.showToast('Disparo iniciado', 'success');
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
      this.aboutImageFile = null;
    }
    this.view.set(newView);
    if (!this.isDesktopViewport()) {
      this.sidebarOpen.set(false);
    }
  }

  toggleSidebar() {
    this.sidebarOpen.update(v => !v);
  }

  private handleViewportChange = () => {
    const isDesktop = typeof window !== 'undefined' ? window.innerWidth >= 768 : true;
    this.isDesktopViewport.set(isDesktop);
    if (isDesktop && this.sidebarOpen() === false) {
      this.sidebarOpen.set(true);
    }
  };

  openOrderDetails(order: Order) {
    this.selectedOrder = order;
  }

  // --- Instagram Actions ---
  onInstagramImageSelected(base64: string) {
    this.newInstagramImage = base64;
    this.newInstagramMediaType = 'image';
  }
  onInstagramFileSelected(file: File) {
    this.newInstagramFile = file;
    this.newInstagramMediaType = 'image';
  }
  
  async addInstagramPost() {
      if (this.newInstagramMediaType === 'video') {
        const videoUrl = this.newInstagramVideoUrl.trim();
        if (!videoUrl) {
          this.store.showToast('Informe a URL do vídeo para o feed.', 'error');
          return;
        }
        await this.store.addInstagramPost({
          mediaType: 'video',
          videoUrl,
          playAudioOnHover: this.newInstagramPlayAudioOnHover
        });
        this.newInstagramVideoUrl = '';
        this.newInstagramPlayAudioOnHover = false;
        this.newInstagramImage = '';
        this.newInstagramFile = null;
        return;
      }

      if (!this.newInstagramImage && !this.newInstagramFile) return;

      let imageUrl = this.newInstagramImage;

      if (this.newInstagramFile && this.store.mode() === 'real') {
        const url = await this.store.supabase.uploadImage(this.newInstagramFile, 'instagram');
        if (url) imageUrl = url;
      }

      await this.store.addInstagramPost({
        mediaType: 'image',
        imageUrl
      });
      this.newInstagramImage = '';
      this.newInstagramFile = null;
  }

  async deleteInstagramPost(id: string | number) {
      if(confirm('Remover post do feed?')) {
          await this.store.deleteInstagramPost(String(id));
      }
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

  // --- NEW: PRINT SHIPPING LABEL ---
  printShippingLabel(order: Order) {
    const printWindow = window.open('', '_blank', 'width=600,height=800');
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>Etiqueta de Envio #${order.id}</title>
          <style>
            body { font-family: 'Arial', sans-serif; padding: 20px; }
            .label { border: 2px dashed #000; padding: 20px; max-width: 400px; margin: 0 auto; position: relative; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
            .header h1 { margin: 0; font-size: 24px; text-transform: uppercase; }
            .dest { margin-bottom: 20px; }
            .dest h3 { margin: 0 0 5px 0; font-size: 14px; text-transform: uppercase; color: #555; }
            .dest p { margin: 2px 0; font-size: 16px; font-weight: bold; }
            .dest .address { font-size: 14px; font-weight: normal; }
            .remetente { font-size: 10px; color: #555; border-top: 1px solid #ccc; padding-top: 10px; margin-top: 20px; }
            .barcode { text-align: center; margin-top: 20px; }
            .barcode div { height: 50px; background: repeating-linear-gradient(to right, #000, #000 2px, #fff 2px, #fff 4px); width: 80%; margin: 0 auto; }
            .tag { position: absolute; top: 20px; right: 20px; border: 1px solid #000; padding: 5px 10px; font-weight: bold; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="label">
            <div class="header">
              <h1>SEDEX</h1>
              <div class="tag">PLP: 982123</div>
            </div>
            <div class="dest">
              <h3>Destinatário</h3>
              <p>${order.customerName}</p>
              <div class="address">
                ${order.shippingAddress ? `${order.shippingAddress.street}, ${order.shippingAddress.number}` : 'Endereço não informado'}<br>
                ${order.shippingAddress?.city || ''}<br>
                <strong>CEP: ${order.shippingAddress?.cep || '00000-000'}</strong>
              </div>
            </div>
            <div class="remetente">
              <strong>Remetente:</strong> YARA Kids Moda Infantil<br>
              Av. Brasil, 120 - Redenção/PA<br>
              CEP: 68550-000
            </div>
            <div class="barcode">
              <div></div>
              <p>${order.id}BR</p>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  }

  onAboutImageSelected(base64: string) { this.tempSettings.aboutImage = base64; }
  onAboutFileSelected(file: File) { this.aboutImageFile = file; }

  async saveSettings() {
    this.store.showToast('Salvando configurações...', 'info');

    if (this.aboutImageFile && this.store.mode() === 'real') {
      const url = await this.store.supabase.uploadImage(this.aboutImageFile, 'institutional');
      if (url) this.tempSettings.aboutImage = url;
    }

    this.store.updateInstitutional(this.tempSettings);
  }

  openCategoryModal(cat?: Category) { 
    this.isEditing = !!cat;
    this.newCategory = cat
      ? {
          ...cat,
          mediaType: cat.mediaType || 'image',
          videoUrl: cat.videoUrl || '',
          playAudioOnHover: !!cat.playAudioOnHover
        }
      : { name: '', image: '', mediaType: 'image', videoUrl: '', playAudioOnHover: false };
    this.tempImageFile = null;
    this.tempCategoryVideoFile = null;
    this.showCategoryModal = true; 
  }
  
  onCategoryImageSelected(base64: string) {
    this.newCategory.image = base64;
    this.newCategory.mediaType = 'image';
  }
  onCategoryFileSelected(file: File) { this.tempImageFile = file; }
  onCategoryVideoFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    this.tempCategoryVideoFile = file;
    if (!file || this.store.mode() === 'real') return;
    this.fileToDataUrl(file).then(url => (this.newCategory.videoUrl = url));
  }

  async saveCategory() {
    if (!this.newCategory.name) return this.store.showToast('Nome obrigatório', 'error');

    const mediaType = this.newCategory.mediaType || 'image';
    
    if (mediaType === 'image') {
      if (this.tempImageFile && this.store.mode() === 'real') {
         const url = await this.store.supabase.uploadImage(this.tempImageFile);
         if (url) this.newCategory.image = url;
      }
      if (!this.newCategory.image) {
        return this.store.showToast('Envie uma imagem para a categoria.', 'error');
      }
    } else {
      if (this.tempCategoryVideoFile && this.store.mode() === 'real') {
        const uploadedVideoUrl = await this.store.supabase.uploadVideo(this.tempCategoryVideoFile, 'categories');
        if (uploadedVideoUrl) this.newCategory.videoUrl = uploadedVideoUrl;
      }
      if (!this.newCategory.videoUrl?.trim()) {
        return this.store.showToast('Informe a URL do vídeo ou envie um arquivo .mp4.', 'error');
      }
    }

    const payload: Category = {
      id: this.isEditing && this.newCategory.id ? this.newCategory.id : 'cat-' + Date.now(),
      name: this.newCategory.name,
      slug: this.newCategory.name.toLowerCase().replace(/ /g, '-'),
      image: mediaType === 'image' ? (this.newCategory.image || '') : (this.newCategory.image || ''),
      mediaType,
      videoUrl: mediaType === 'video' ? this.newCategory.videoUrl?.trim() : '',
      playAudioOnHover: !!this.newCategory.playAudioOnHover
    };

    if (this.isEditing && this.newCategory.id) {
       this.store.updateCategory(payload);
    } else {
       this.store.addCategory(payload);
    }
    this.showCategoryModal = false;
  }

  deleteCategory(id: string) { if(confirm('Excluir?')) this.store.deleteCategory(id); }

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
      this.newProduct = { name: '', price: 0, originalPrice: 0, stock: 0, image: '', categoryId: firstCat, description: '', gender: 'girl', gallery: [], video: '', colorImages: [] }; 
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

  removeVariant(i: number) { this.tempVariants.splice(i, 1); }
  getTotalStock() { return this.tempVariants.reduce((a, b) => a + b.stock, 0); }
  getUniqueColorNames() { return [...new Set(this.tempVariants.map(v => v.color))]; }
  getAvailableColors() {
    const manualColors = this.tempColors.split(',').map(c => c.trim()).filter(c => c);
    const variantColors = this.tempVariants.map(v => v.color);
    return [...new Set([...manualColors, ...variantColors])];
  }

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
      originalPrice: this.newProduct.originalPrice && this.newProduct.originalPrice > this.newProduct.price
        ? this.newProduct.originalPrice
        : this.newProduct.price,
      discount: this.newProduct.originalPrice && this.newProduct.originalPrice > this.newProduct.price
        ? Math.round(((this.newProduct.originalPrice - this.newProduct.price) / this.newProduct.originalPrice) * 100)
        : 0,
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

  openBannerModal(b?: Banner) {
    this.isEditing = !!b;
    this.newBanner = b
      ? {
          ...b,
          mediaType: b.mediaType || 'image',
          videoUrl: b.videoUrl || '',
          playAudioOnHover: !!b.playAudioOnHover,
          active: b.active !== false,
          order: b.order ?? 1
        }
      : { title: '', subtitle: '', link: '/catalogo', image: '', location: 'home-hero', description: '', badgeText: 'Oferta', endDate: '', mediaType: 'image', videoUrl: '', playAudioOnHover: false, active: true, order: 1 };
    this.tempImageFile = null;
    this.tempBannerVideoFile = null;
    this.bannerLinkSearch.set('');
    this.showBannerModal = true;
  }
  onBannerImageSelected(b: string) {
    this.newBanner.image = b;
    this.newBanner.mediaType = 'image';
  }
  onBannerFileSelected(file: File) { this.tempImageFile = file; }
  onBannerVideoFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    this.tempBannerVideoFile = file;
    if (!file || this.store.mode() === 'real') return;
    this.fileToDataUrl(file).then(url => (this.newBanner.videoUrl = url));
  }

  selectBannerRoute(value: string) {
    this.newBanner.link = value;
  }

  async saveBanner() {
    const mediaType = this.newBanner.mediaType || 'image';
    if (mediaType === 'image') {
      if (this.tempImageFile && this.store.mode() === 'real') {
         const url = await this.store.supabase.uploadImage(this.tempImageFile);
         if (url) this.newBanner.image = url;
      }
      if (!this.newBanner.image) {
        this.store.showToast('Selecione uma imagem para o banner.', 'error');
        return;
      }
    } else {
      if (this.tempBannerVideoFile && this.store.mode() === 'real') {
        const uploadedVideoUrl = await this.store.supabase.uploadVideo(this.tempBannerVideoFile, 'banners');
        if (uploadedVideoUrl) this.newBanner.videoUrl = uploadedVideoUrl;
      }
      if (!this.newBanner.videoUrl?.trim()) {
        this.store.showToast('Informe a URL do vídeo ou envie um arquivo .mp4.', 'error');
        return;
      }
    }

    const b: Banner = {
      ...(this.newBanner as Banner),
      id: this.isEditing ? this.newBanner.id! : 'ban-' + Date.now(),
      mediaType,
      videoUrl: mediaType === 'video' ? this.newBanner.videoUrl?.trim() : '',
      playAudioOnHover: !!this.newBanner.playAudioOnHover,
      active: this.newBanner.active !== false,
      order: Number(this.newBanner.order || 1)
    };
    this.isEditing ? this.store.updateBanner(b) : this.store.addBanner(b);
    this.showBannerModal = false;
  }
  
  deleteBanner(id: string) { if(confirm('Excluir?')) this.store.deleteBanner(id); }
  getBannerLocationName(l: string) { const m: any = {'home-hero': 'Home: Principal', 'home-mid': 'Home: Meio', 'catalog-top': 'Catálogo: Topo', 'catalog-sidebar': 'Catálogo: Lateral'}; return m[l] || l; }

  openCouponModal() { this.newCoupon = { code: '', type: 'percent', value: 0, minPurchase: 0, active: true, description: '' }; this.showCouponModal = true; }
  saveCoupon() {
    if (!this.newCoupon.code || !this.newCoupon.value) return;
    this.store.addCoupon({ ...this.newCoupon as Coupon, id: 'cup-' + Date.now(), code: this.newCoupon.code.toUpperCase() });
    this.showCouponModal = false;
  }
  deleteCoupon(id: string) { if (confirm('Excluir?')) this.store.deleteCoupon(id); }

  getStatusLabel(s: Order['status']) { const m: any = {'pending': 'Pendente', 'paid': 'Pago', 'shipped': 'Enviado', 'delivered': 'Entregue', 'cancelled': 'Cancelado'}; return m[s] || s; }
  updateOrderStatus(id: string, e: Event) { const s = (e.target as HTMLSelectElement).value; if (s) this.store.updateOrderStatus(id, s as any); }

  openFaqModal(faq?: FaqItem) {
    this.isEditing = !!faq;
    this.newFaq = faq ? { ...faq } : { question: '', answer: '' };
    this.showFaqModal = true;
  }

  saveFaq() {
    if (!this.newFaq.question || !this.newFaq.answer) {
      this.store.showToast('Preencha pergunta e resposta', 'error');
      return;
    }
    const item: FaqItem = {
      id: this.isEditing ? this.newFaq.id! : 'faq-' + Date.now(),
      question: this.newFaq.question,
      answer: this.newFaq.answer
    };
    if (this.isEditing) this.store.updateFaq(item); else this.store.addFaq(item);
    this.showFaqModal = false;
  }

  deleteFaq(id: string) {
    if (confirm('Excluir esta pergunta?')) this.store.deleteFaq(id);
  }

  deleteFeedback(id: string) {
    if (confirm('Excluir este feedback?')) this.store.deleteFeedback(id);
  }

  private fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}


