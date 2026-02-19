export type NotificationChannel = 'web' | 'android';
export type NotificationAudience =
  | 'all'
  | 'active_customers'
  | 'inactive_customers'
  | 'interest_category'
  | 'abandoned_cart'
  | 'admins';

export type NotificationCampaignStatus =
  | 'draft'
  | 'scheduled'
  | 'sending'
  | 'completed'
  | 'partial_failure'
  | 'cancelled';

export interface PushSubscriptionRecord {
  id: string;
  user_id?: string;
  email?: string;
  platform: NotificationChannel;
  token: string;
  device_label?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  metadata?: Record<string, any>;
}

export interface NotificationCampaign {
  id: string;
  title: string;
  body: string;
  image_url?: string;
  deeplink?: string;
  audience: NotificationAudience;
  channels: NotificationChannel[];
  category_slug?: string;
  schedule_for?: string | null;
  status: NotificationCampaignStatus;
  created_by?: string;
  metrics?: {
    total: number;
    delivered: number;
    clicked: number;
    failed: number;
  };
  created_at?: string;
}

export interface NotificationDelivery {
  id: string;
  campaign_id: string;
  subscription_id: string;
  status: 'queued' | 'sent' | 'delivered' | 'clicked' | 'failed';
  error_message?: string;
  sent_at?: string;
  delivered_at?: string;
  clicked_at?: string;
  created_at?: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  body: string;
  deeplink?: string;
  image_url?: string;
  audience: NotificationAudience;
  category_slug?: string;
  created_at?: string;
}

export interface NotificationComposerInput {
  title: string;
  body: string;
  image_url?: string;
  deeplink?: string;
  audience: NotificationAudience;
  category_slug?: string;
  send_now: boolean;
  schedule_for?: string | null;
  channels: NotificationChannel[];
}
