import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ ok: false, message: "Method not allowed" }, 405);

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const MERCADO_PAGO_ACCESS_TOKEN = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN") || "";
    const WEBHOOK_SECRET = Deno.env.get("MERCADO_PAGO_WEBHOOK_SECRET") || "";

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return json({ ok: false, message: "Missing Supabase environment variables." }, 500);
    }

    if (!MERCADO_PAGO_ACCESS_TOKEN) {
      return json({ ok: false, message: "Missing Mercado Pago access token." }, 500);
    }

    const signature = req.headers.get("x-signature") || "";
    if (WEBHOOK_SECRET && signature !== WEBHOOK_SECRET) {
      return json({ ok: false, message: "Invalid webhook signature." }, 401);
    }

    const body = await req.json();
    const eventId = String(body?.id || "");
    const topic = String(body?.type || body?.topic || "payment");
    const paymentId = String(body?.data?.id || body?.id || "");

    if (!paymentId) {
      return json({ ok: false, message: "Missing payment id in webhook payload." }, 400);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rate = await enforceRateLimit(supabase, {
      bucket: "process_payment_webhook",
      key: ip,
      limit: 60,
      windowMinutes: 10
    });

    if (!rate.allowed) {
      return json({ ok: false, message: "Muitas tentativas. Tente novamente em instantes." }, 429);
    }


    // Idempotência do webhook
    if (eventId) {
      const { data: exists } = await supabase
        .from("payment_webhook_events")
        .select("id")
        .eq("event_id", eventId)
        .maybeSingle();

      if (exists?.id) {
        return json({ ok: true, duplicate: true, paymentId });
      }

      await supabase.from("payment_webhook_events").insert({
        event_id: eventId,
        topic,
        payload: body
      });
    }

    // Confirma status direto no provedor para evitar payload incompleto/fraudado
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`
      }
    });

    const mpData = await mpRes.json();
    if (!mpRes.ok) {
      return json({ ok: false, message: "Failed to fetch payment status from provider.", detail: mpData }, 502);
    }

    const status = String(mpData?.status || "processing");
    const externalReference = String(mpData?.external_reference || "");

    let updated: { id: string; idempotency_key: string } | null = null;

    const primaryUpdate = await supabase
      .from("payment_attempts")
      .update({
        status,
        response_payload: mpData
      })
      .eq("provider_payment_id", paymentId)
      .select("id, idempotency_key")
      .maybeSingle();

    const updateError = primaryUpdate.error;
    updated = (primaryUpdate.data as { id: string; idempotency_key: string } | null) || null;

    if (!updated?.id && externalReference) {
      const secondaryUpdate = await supabase
        .from("payment_attempts")
        .update({
          status,
          provider_payment_id: paymentId,
          response_payload: mpData
        })
        .eq("idempotency_key", externalReference)
        .select("id, idempotency_key")
        .maybeSingle();

      if (!updateError && !secondaryUpdate.error) {
        updated = (secondaryUpdate.data as { id: string; idempotency_key: string } | null) || null;
      }
    }

    if (updateError) {
      return json({ ok: false, message: updateError.message }, 500);
    }


    if (!updated?.id) {
      // fallback: registra tentativa “órfã” para auditoria
      await supabase.from("payment_attempts").insert({
        idempotency_key: `webhook-${paymentId}`,
        method: String(mpData?.payment_method_id || "unknown"),
        amount: Number(mpData?.transaction_amount || 0),
        installments: Number(mpData?.installments || 1),
        provider_payment_id: paymentId,
        status,
        response_payload: mpData
      });
    }

    return json({
      ok: true,
      paymentId,
      status,
      attemptId: updated?.id || null,
      idempotencyKey: updated?.idempotency_key || null
    });
  } catch (error) {
    return json({ ok: false, message: "Unexpected webhook processing error.", detail: String(error) }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json"
    }
  });
}


async function enforceRateLimit(
  supabase: ReturnType<typeof createClient>,
  config: { bucket: string; key: string; limit: number; windowMinutes: number }
): Promise<{ allowed: boolean }> {
  const now = Date.now();
  const cutoffIso = new Date(now - config.windowMinutes * 60_000).toISOString();

  const { data: existing } = await supabase
    .from("api_rate_limits")
    .select("id, count, window_started_at")
    .eq("bucket", config.bucket)
    .eq("key", config.key)
    .maybeSingle();

  if (!existing) {
    await supabase.from("api_rate_limits").insert({
      bucket: config.bucket,
      key: config.key,
      count: 1,
      window_started_at: new Date().toISOString()
    });
    return { allowed: true };
  }

  const inWindow = existing.window_started_at >= cutoffIso;
  const nextCount = inWindow ? (existing.count || 0) + 1 : 1;

  await supabase
    .from("api_rate_limits")
    .update({
      count: nextCount,
      window_started_at: inWindow ? existing.window_started_at : new Date().toISOString()
    })
    .eq("id", existing.id);

  return { allowed: nextCount <= config.limit };
}

