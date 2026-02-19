import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return json({ ok: false, error: 'Missing Supabase env vars' }, 500);
    }

    const body = await req.json();
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data, error } = await supabase
      .from('push_subscriptions')
      .upsert(
        {
          user_id: body.user_id,
          email: body.email,
          platform: body.platform,
          token: body.token,
          device_label: body.device_label,
          is_active: body.is_active ?? true,
          metadata: body.metadata || {}
        },
        { onConflict: 'user_id,platform,device_label' }
      )
      .select('*')
      .single();

    if (error) return json({ ok: false, error: error.message }, 500);
    return json({ ok: true, data });
  } catch (err) {
    return json({ ok: false, error: String(err) }, 400);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
