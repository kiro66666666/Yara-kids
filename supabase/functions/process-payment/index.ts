import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type PaymentBody = {
  method?: "pix" | "card";
  amount?: number;
  installments?: number;
  idempotencyKey?: string;
  customer?: {
    name?: string;
    cpf?: string;
    phone?: string;
  };
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ ok: false, message: "Method not allowed" }, 405);

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const MERCADO_PAGO_ACCESS_TOKEN = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN") || "";

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return json({ ok: false, message: "Missing Supabase environment variables." }, 500);
    }

    const body = (await req.json()) as PaymentBody;
    const method = body.method;
    const amount = Number(body.amount || 0);
    const installments = Number(body.installments || 1);
    const idempotencyKey = (body.idempotencyKey || "").trim();
    const cpfDigits = (body.customer?.cpf || "").replace(/\D/g, "");

    if (!idempotencyKey || idempotencyKey.length < 8) {
      return json({ ok: false, message: "idempotencyKey inválida." }, 400);
    }

    if ((method !== "pix" && method !== "card") || !Number.isFinite(amount) || amount <= 0) {
      return json({ ok: false, message: "Dados de pagamento inválidos." }, 400);
    }

    if (!cpfDigits || cpfDigits.length !== 11) {
      return json({ ok: false, message: "CPF inválido para pagamento." }, 400);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rate = await enforceRateLimit(supabase, {
      bucket: "process_payment",
      key: ip,
      limit: 30,
      windowMinutes: 10
    });

    if (!rate.allowed) {
      return json({ ok: false, message: "Muitas tentativas. Tente novamente em instantes." }, 429);
    }


    // Idempotência: se já existe tentativa finalizada, reaproveita resposta.
    const { data: existing } = await supabase
      .from("payment_attempts")
      .select("id, provider_payment_id, status, response_payload")
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();

    if (existing?.provider_payment_id && existing?.status === "approved") {
      return json({
        ok: true,
        id: existing.id,
        paymentId: existing.provider_payment_id,
        status: existing.status,
        ...((existing.response_payload as Record<string, unknown>) || {})
      });
    }

    if (!MERCADO_PAGO_ACCESS_TOKEN) {
      await supabase.from("payment_attempts").upsert({
        idempotency_key: idempotencyKey,
        method,
        amount,
        installments,
        status: "pending_config",
        response_payload: { reason: "missing_access_token" }
      }, { onConflict: "idempotency_key" });

      return json({
        ok: false,
        message: "Pagamento automático indisponível no momento."
      }, 503);
    }

    const mpPayload: Record<string, unknown> = {
      transaction_amount: Number(amount.toFixed(2)),
      payment_method_id: method === "pix" ? "pix" : "visa",
      description: "Pedido YARA Kids",
      installments: method === "card" ? Math.max(1, installments) : 1,
      external_reference: idempotencyKey,
      payer: {
        email: "checkout@yarakids.com.br",
        first_name: body.customer?.name || "Cliente",
        identification: {
          type: "CPF",
          number: cpfDigits
        }
      }
    };

    const mpResponse = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
        "X-Idempotency-Key": idempotencyKey
      },
      body: JSON.stringify(mpPayload)
    });

    const mpData = await mpResponse.json();

    const status = String(mpData?.status || "processing");
    await supabase.from("payment_attempts").upsert({
      idempotency_key: idempotencyKey,
      method,
      amount,
      installments,
      provider_payment_id: String(mpData?.id || ""),
      status,
      response_payload: mpData
    }, { onConflict: "idempotency_key" });

    if (!mpResponse.ok) {
      return json({ ok: false, message: mpData?.message || "Falha ao processar pagamento.", detail: mpData }, 502);
    }

    return json({
      ok: true,
      paymentId: String(mpData?.id || ""),
      status,
      qrCode: mpData?.point_of_interaction?.transaction_data?.qr_code,
      qrCodeBase64: mpData?.point_of_interaction?.transaction_data?.qr_code_base64
    });
  } catch (error) {
    return json({ ok: false, message: "Erro inesperado ao processar pagamento.", detail: String(error) }, 500);
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

