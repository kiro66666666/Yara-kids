import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type PaymentBody = {
  method?: "pix" | "card";
  amount?: number;
  installments?: number;
  idempotencyKey?: string;
  cardToken?: string;
  paymentMethodId?: string;
  issuerId?: string | number;
  payer?: {
    email?: string;
    identification?: {
      type?: "CPF" | "CNPJ";
      number?: string;
    };
    name?: string;
  };
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
    const idempotencyKey = String(body.idempotencyKey || "").trim();

    const payerEmail = String(body.payer?.email || "").trim().toLowerCase();
    const payerIdType = body.payer?.identification?.type || "CPF";
    const payerIdDigits = String(body.payer?.identification?.number || body.customer?.cpf || "").replace(/\D/g, "");
    const payerName = String(body.payer?.name || body.customer?.name || "Cliente").trim();

    if (!idempotencyKey || idempotencyKey.length < 8) {
      return json({ ok: false, message: "idempotencyKey inválida." }, 400);
    }

    if ((method !== "pix" && method !== "card") || !Number.isFinite(amount) || amount <= 0) {
      return json({ ok: false, message: "Dados de pagamento inválidos." }, 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payerEmail)) {
      return json({ ok: false, message: "E-mail do pagador inválido." }, 400);
    }

    if (payerIdType === "CPF" && payerIdDigits.length !== 11) {
      return json({ ok: false, message: "CPF inválido para pagamento." }, 400);
    }

    if (payerIdType === "CNPJ" && payerIdDigits.length !== 14) {
      return json({ ok: false, message: "CNPJ inválido para pagamento." }, 400);
    }

    if (method === "card") {
      const cardToken = String(body.cardToken || "").trim();
      const paymentMethodId = String(body.paymentMethodId || "").trim();
      if (!cardToken || !paymentMethodId) {
        return json({ ok: false, message: "Token do cartão e bandeira são obrigatórios no pagamento por cartão." }, 400);
      }
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

    const { data: existing } = await supabase
      .from("payment_attempts")
      .select("id, provider_payment_id, status, response_payload")
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();

    const existingStatus = String(existing?.status || "").toLowerCase();
    if (existing?.provider_payment_id && (existingStatus === "approved" || existingStatus === "pending" || existingStatus === "in_process")) {
      const existingNormalized = (existing?.response_payload as any)?.normalized || {};
      return json({
        ok: true,
        id: existing.id,
        paymentId: String(existing?.provider_payment_id || ""),
        status: existing.status,
        qrCode: existingNormalized.qrCode,
        qrCodeBase64: existingNormalized.qrCodeBase64,
        ticketUrl: existingNormalized.ticketUrl,
        rawProviderStatus: existingNormalized.rawProviderStatus
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

    const basePayload: Record<string, unknown> = {
      transaction_amount: Number(amount.toFixed(2)),
      description: "Pedido YARA Kids",
      installments: method === "card" ? Math.max(1, installments) : 1,
      external_reference: idempotencyKey,
      payer: {
        email: payerEmail,
        first_name: payerName,
        identification: {
          type: payerIdType,
          number: payerIdDigits
        }
      }
    };

    let mpPayload: Record<string, unknown>;
    if (method === "pix") {
      mpPayload = {
        ...basePayload,
        payment_method_id: "pix"
      };
    } else {
      const issuerId = body.issuerId === undefined || body.issuerId === null || String(body.issuerId).trim() === ""
        ? undefined
        : Number.isFinite(Number(body.issuerId)) ? Number(body.issuerId) : String(body.issuerId);

      mpPayload = {
        ...basePayload,
        token: String(body.cardToken || "").trim(),
        payment_method_id: String(body.paymentMethodId || "").trim(),
        ...(issuerId !== undefined ? { issuer_id: issuerId } : {})
      };
    }

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
    const rawProviderStatus = String(mpData?.status_detail || mpData?.status || "");
    const paymentId = String(mpData?.id || "");
    const transactionData = mpData?.point_of_interaction?.transaction_data || {};

    const normalizedResult = {
      paymentId,
      status,
      qrCode: transactionData?.qr_code || "",
      qrCodeBase64: transactionData?.qr_code_base64 || "",
      ticketUrl: transactionData?.ticket_url || mpData?.transaction_details?.external_resource_url || "",
      rawProviderStatus
    };

    await supabase.from("payment_attempts").upsert({
      idempotency_key: idempotencyKey,
      method,
      amount,
      installments,
      provider_payment_id: paymentId,
      status,
      response_payload: {
        normalized: normalizedResult,
        raw: mpData
      }
    }, { onConflict: "idempotency_key" });

    if (!mpResponse.ok) {
      return json({
        ok: false,
        message: String(mpData?.message || "Falha ao processar pagamento no provedor."),
        rawProviderStatus,
        detail: mpData
      }, 502);
    }

    return json({
      ok: true,
      paymentId,
      status,
      qrCode: normalizedResult.qrCode,
      qrCodeBase64: normalizedResult.qrCodeBase64,
      ticketUrl: normalizedResult.ticketUrl,
      rawProviderStatus
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

