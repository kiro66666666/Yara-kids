import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async () => {
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return json({ ok: false, error: 'Missing Supabase env vars' }, 500);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: events, error } = await supabase
      .from('notification_events')
      .select('*')
      .eq('status', 'queued')
      .order('created_at', { ascending: true })
      .limit(50);

    if (error) return json({ ok: false, error: error.message }, 500);

    let processed = 0;
    for (const event of events || []) {
      try {
        const title = mapTitle(event.event_type, event.payload || {});
        const body = mapBody(event.event_type, event.payload || {});

        const { data: campaign, error: campaignErr } = await supabase
          .from('notification_campaigns')
          .insert({
            title,
            body,
            audience: event.event_type === 'contact_message_created' ? 'admins' : 'all',
            channels: ['web', 'android'],
            deeplink: '/#/minha-conta',
            status: 'sending',
            created_by: 'system'
          })
          .select('id')
          .single();

        if (campaignErr || !campaign) throw new Error(campaignErr?.message || 'Campaign insert failed');

        await supabase.functions.invoke('dispatch-campaign', { body: { campaignId: campaign.id } });

        await supabase
          .from('notification_events')
          .update({ status: 'processed', processed_at: new Date().toISOString() })
          .eq('id', event.id);
        processed += 1;
      } catch (err) {
        await supabase
          .from('notification_events')
          .update({ status: 'failed', error_message: String(err), processed_at: new Date().toISOString() })
          .eq('id', event.id);
      }
    }

    return json({ ok: true, processed, queued: (events || []).length });
  } catch (err) {
    return json({ ok: false, error: String(err) }, 500);
  }
});

function mapTitle(eventType: string, payload: Record<string, any>) {
  switch (eventType) {
    case 'order_created':
      return `Pedido #${payload.orderId || ''} criado`;
    case 'order_status_changed':
      return `Pedido #${payload.orderId || ''} atualizado`;
    case 'product_restocked':
      return `${payload.productName || 'Produto'} voltou ao estoque`;
    case 'contact_message_created':
      return `Nova mensagem de contato`;
    case 'promotion_created':
      return `Nova promoção disponível`;
    default:
      return 'Atualização YARA Kids';
  }
}

function mapBody(eventType: string, payload: Record<string, any>) {
  switch (eventType) {
    case 'order_created':
      return `Seu pedido foi recebido com total de R$ ${payload.total || 0}.`;
    case 'order_status_changed':
      return `Novo status: ${payload.status || 'atualizado'}.`;
    case 'product_restocked':
      return `O item ${payload.productName || ''} está disponível novamente.`;
    case 'contact_message_created':
      return `Assunto: ${payload.subject || 'Contato da loja'}`;
    case 'promotion_created':
      return `${payload.code || 'Promoção'} disponível agora.`;
    default:
      return 'Confira as novidades no app.';
  }
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
