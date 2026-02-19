import { Injectable, inject, signal, computed } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getMessaging, getToken, isSupported as isMessagingSupported } from 'firebase/messaging';
import { environment } from '../environments/environment';
import {
  NotificationCampaign,
  NotificationComposerInput,
  NotificationDelivery,
  NotificationTemplate,
  PushSubscriptionRecord
} from './notification.types';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private supabase = inject(SupabaseService);
  private firebaseReady: Promise<boolean> | null = null;

  permission = signal<NotificationPermission>('default');
  isSupported = signal<boolean>(typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator);
  isSubscribed = signal<boolean>(false);
  campaigns = signal<NotificationCampaign[]>([]);
  deliveries = signal<NotificationDelivery[]>([]);
  templates = signal<NotificationTemplate[]>([]);
  loading = signal<boolean>(false);

  stats = computed(() => {
    const rows = this.campaigns();
    return {
      total: rows.length,
      completed: rows.filter(r => r.status === 'completed').length,
      failed: rows.filter(r => r.status === 'partial_failure').length,
      scheduled: rows.filter(r => r.status === 'scheduled').length
    };
  });

  constructor() {
    if (this.isSupported()) {
      this.permission.set(Notification.permission);
    }
  }

  async initialize(user: { id?: string; email?: string } | null) {
    await this.loadAdminData();
    if (user?.id) {
      await this.syncBrowserSubscription(user.id, user.email);
    }
    this.startRealtime();
  }

  async loadAdminData() {
    this.loading.set(true);
    try {
      const [campaigns, templates] = await Promise.all([
        this.supabase.getAll('notification_campaigns'),
        this.supabase.getAll('notification_templates')
      ]);

      this.campaigns.set((campaigns || []) as NotificationCampaign[]);
      this.templates.set((templates || []) as NotificationTemplate[]);
    } catch (e) {
      console.error('Erro ao carregar dados de notificacao', e);
    } finally {
      this.loading.set(false);
    }
  }

  async requestPermissionAndSubscribe(userId: string, email?: string): Promise<boolean> {
    if (!this.isSupported()) return false;
    const messagingReady = await this.ensureFirebaseMessaging();
    if (!messagingReady) return false;

    const result = await Notification.requestPermission();
    this.permission.set(result);
    if (result !== 'granted') {
      this.isSubscribed.set(false);
      return false;
    }

    return this.syncBrowserSubscription(userId, email);
  }

  async syncBrowserSubscription(userId: string, email?: string): Promise<boolean> {
    try {
      const messagingReady = await this.ensureFirebaseMessaging();
      if (!messagingReady) return false;

      const reg = await navigator.serviceWorker.ready;
      const app = getApps().length ? getApp() : initializeApp(environment.firebase.config);
      const messaging = getMessaging(app);
      const token = await getToken(messaging, {
        vapidKey: environment.firebase.vapidKey,
        serviceWorkerRegistration: reg
      });
      if (!token) {
        this.isSubscribed.set(false);
        return false;
      }

      const payload: Partial<PushSubscriptionRecord> = {
        user_id: userId,
        email,
        platform: 'web',
        token,
        device_label: this.getDeviceLabel(),
        is_active: true,
        metadata: {
          userAgent: navigator.userAgent,
          lang: navigator.language
        }
      };

      await this.upsertPushSubscription(payload);
      this.isSubscribed.set(true);
      return true;
    } catch (e) {
      console.error('Erro ao sincronizar inscricao web', e);
      this.isSubscribed.set(false);
      return false;
    }
  }

  async upsertPushSubscription(payload: Partial<PushSubscriptionRecord>) {
    const row = {
      ...payload,
      updated_at: new Date().toISOString()
    };

    await this.supabase.upsert('push_subscriptions', row, 'user_id,platform,device_label');
  }

  async deactivateUserSubscriptions(userId: string) {
    try {
      const rows = (await this.supabase.getAll('push_subscriptions')) as PushSubscriptionRecord[];
      const targets = rows.filter(r => r.user_id === userId && r.is_active);
      await Promise.all(
        targets.map(t => this.supabase.update('push_subscriptions', t.id, { is_active: false, updated_at: new Date().toISOString() }))
      );
    } catch (e) {
      console.error('Erro ao desativar subscriptions', e);
    }
  }

  async createCampaign(input: NotificationComposerInput, actorEmail?: string) {
    const payload: Partial<NotificationCampaign> = {
      title: input.title,
      body: input.body,
      image_url: input.image_url,
      deeplink: input.deeplink,
      audience: input.audience,
      channels: input.channels,
      category_slug: input.category_slug,
      schedule_for: input.send_now ? null : input.schedule_for || null,
      status: input.send_now ? 'sending' : 'scheduled',
      created_by: actorEmail,
      metrics: { total: 0, delivered: 0, clicked: 0, failed: 0 }
    };

    const created = await this.supabase.insert('notification_campaigns', payload);

    if (input.send_now) {
      await this.dispatchCampaign(created.id);
    }

    await this.loadAdminData();
    return created;
  }

  async saveTemplate(template: Partial<NotificationTemplate>) {
    if (!template.id) {
      await this.supabase.insert('notification_templates', template);
    } else {
      await this.supabase.update('notification_templates', template.id, template);
    }
    await this.loadAdminData();
  }

  async dispatchCampaign(campaignId: string) {
    await this.supabase.callFunction('dispatch-campaign', { campaignId });
    await this.loadAdminData();
  }

  async retryFailed(campaignId: string) {
    await this.supabase.callFunction('dispatch-campaign', { campaignId, retryFailedOnly: true });
    await this.loadAdminData();
  }

  async queueEvent(eventType: string, payload: Record<string, any>, userId?: string) {
    await this.supabase.insert('notification_events', {
      event_type: eventType,
      payload,
      user_id: userId || null,
      status: 'queued'
    });
  }

  private getDeviceLabel() {
    const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
    return isMobile ? 'Mobile Browser' : 'Desktop Browser';
  }

  private async ensureFirebaseMessaging(): Promise<boolean> {
    if (this.firebaseReady) {
      return this.firebaseReady;
    }

    this.firebaseReady = (async () => {
      try {
        const supported = await isMessagingSupported();
        if (!supported) {
          return false;
        }
        if (!getApps().length) {
          initializeApp(environment.firebase.config);
        }
        return true;
      } catch (e) {
        console.error('Erro ao inicializar Firebase Messaging', e);
        return false;
      }
    })();

    return this.firebaseReady;
  }

  private realtimeStarted = false;
  private startRealtime() {
    if (this.realtimeStarted) return;
    this.realtimeStarted = true;

    this.supabase.supabase
      .channel('notifications-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notification_campaigns' }, () => this.loadAdminData())
      .subscribe();
  }
}
