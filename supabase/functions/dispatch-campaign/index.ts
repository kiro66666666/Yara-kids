import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type DispatchBody = {
  campaignId: string;
  retryFailedOnly?: boolean;
};

serve(async (req) => {
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const FIREBASE_PROJECT_ID = Deno.env.get('FIREBASE_PROJECT_ID') || '';
    const FIREBASE_CLIENT_EMAIL = Deno.env.get('FIREBASE_CLIENT_EMAIL') || '';
    const FIREBASE_PRIVATE_KEY = (Deno.env.get('FIREBASE_PRIVATE_KEY') || '').replace(/\\n/g, '\n');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
      return json({ ok: false, error: 'Missing required env vars' }, 500);
    }

    const body = (await req.json()) as DispatchBody;
    if (!body.campaignId) {
      return json({ ok: false, error: 'campaignId is required' }, 400);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: campaign, error: campaignErr } = await supabase
      .from('notification_campaigns')
      .select('*')
      .eq('id', body.campaignId)
      .single();

    if (campaignErr || !campaign) {
      return json({ ok: false, error: 'Campaign not found', detail: campaignErr?.message }, 404);
    }

    const subscriptionsQuery = supabase
      .from('push_subscriptions')
      .select('*')
      .eq('is_active', true);

    const { data: subscriptions, error: subsErr } = await subscriptionsQuery;
    if (subsErr) {
      return json({ ok: false, error: subsErr.message }, 500);
    }

    const allFiltered = (subscriptions || []).filter((s: any) => {
      if (!Array.isArray(campaign.channels) || campaign.channels.length === 0) return true;
      return campaign.channels.includes(s.platform);
    });
    const filtered = body.retryFailedOnly
      ? await filterFailedSubscriptions(supabase, campaign.id, allFiltered)
      : allFiltered;

    const total = filtered.length;
    let delivered = 0;
    let failed = 0;
    const accessToken = await getGoogleAccessToken({
      clientEmail: FIREBASE_CLIENT_EMAIL,
      privateKey: FIREBASE_PRIVATE_KEY
    });

    await supabase.from('notification_campaigns').update({ status: 'sending' }).eq('id', campaign.id);

    for (const sub of filtered) {
      const deliveryRow = {
        campaign_id: campaign.id,
        subscription_id: sub.id,
        status: 'queued'
      };

      const { data: delivery } = await supabase
        .from('notification_deliveries')
        .upsert(deliveryRow, { onConflict: 'campaign_id,subscription_id' })
        .select('id')
        .single();

      try {
        const payload = {
          message: {
            token: sub.token,
            notification: {
              title: campaign.title,
              body: campaign.body,
              image: campaign.image_url || undefined
            },
            data: {
              deeplink: campaign.deeplink || '/#/minha-conta',
              campaignId: campaign.id
            },
            android: { priority: 'high' },
            webpush: {
              fcm_options: {
                link: campaign.deeplink || '/#/minha-conta'
              }
            }
          }
        };

        const resp = await fetch(`https://fcm.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/messages:send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
          },
          body: JSON.stringify(payload)
        });

        if (!resp.ok) {
          const msg = await resp.text();
          throw new Error(msg);
        }

        delivered += 1;
        if (delivery?.id) {
          await supabase
            .from('notification_deliveries')
            .update({ status: 'sent', sent_at: new Date().toISOString() })
            .eq('id', delivery.id);
        }
      } catch (err) {
        failed += 1;
        if (delivery?.id) {
          await supabase
            .from('notification_deliveries')
            .update({ status: 'failed', error_message: String(err) })
            .eq('id', delivery.id);
        }
      }
    }

    const status = failed > 0 ? (delivered > 0 ? 'partial_failure' : 'cancelled') : 'completed';

    await supabase
      .from('notification_campaigns')
      .update({
        status,
        metrics: {
          total,
          delivered,
          clicked: 0,
          failed
        }
      })
      .eq('id', campaign.id);

    return json({ ok: true, campaignId: campaign.id, total, delivered, failed, status });
  } catch (err) {
    return json({ ok: false, error: String(err) }, 500);
  }
});

async function filterFailedSubscriptions(supabase: ReturnType<typeof createClient>, campaignId: string, subscriptions: any[]) {
  const { data: failedRows } = await supabase
    .from('notification_deliveries')
    .select('subscription_id,status')
    .eq('campaign_id', campaignId)
    .eq('status', 'failed');

  const failedIds = new Set((failedRows || []).map((row: any) => row.subscription_id));
  return subscriptions.filter((sub: any) => failedIds.has(sub.id));
}

async function getGoogleAccessToken(input: { clientEmail: string; privateKey: string }) {
  const now = Math.floor(Date.now() / 1000);
  const assertion = await createJwtAssertion({
    clientEmail: input.clientEmail,
    privateKey: input.privateKey,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600
  });

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to get Google access token: ${await response.text()}`);
  }

  const tokenData = await response.json();
  if (!tokenData.access_token) {
    throw new Error('Missing access_token in Google OAuth response');
  }
  return tokenData.access_token as string;
}

async function createJwtAssertion(payload: {
  clientEmail: string;
  privateKey: string;
  scope: string;
  aud: string;
  iat: number;
  exp: number;
}) {
  const header = { alg: 'RS256', typ: 'JWT' };
  const claimSet = {
    iss: payload.clientEmail,
    scope: payload.scope,
    aud: payload.aud,
    iat: payload.iat,
    exp: payload.exp
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedClaimSet = base64UrlEncode(JSON.stringify(claimSet));
  const signingInput = `${encodedHeader}.${encodedClaimSet}`;

  const key = await importPrivateKey(payload.privateKey);
  const signature = await crypto.subtle.sign(
    { name: 'RSASSA-PKCS1-v1_5' },
    key,
    new TextEncoder().encode(signingInput)
  );

  return `${signingInput}.${base64UrlEncodeBytes(new Uint8Array(signature))}`;
}

async function importPrivateKey(privateKeyPem: string) {
  const pem = privateKeyPem
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '');

  const binaryDer = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0));

  return crypto.subtle.importKey(
    'pkcs8',
    binaryDer.buffer,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256'
    },
    false,
    ['sign']
  );
}

function base64UrlEncode(value: string) {
  return base64UrlEncodeBytes(new TextEncoder().encode(value));
}

function base64UrlEncodeBytes(bytes: Uint8Array) {
  const base64 = btoa(String.fromCharCode(...bytes));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
