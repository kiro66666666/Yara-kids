import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type SubscribeBody = {
  email?: string;
  source?: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ ok: false, status: "error", message: "Method not allowed" }, 405);
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
    const RESEND_FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL") || "YARA Kids <onboarding@resend.dev>";

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return json({ ok: false, status: "error", message: "Missing Supabase environment variables." }, 500);
    }

    const body = (await req.json()) as SubscribeBody;
    const email = (body.email || "").trim().toLowerCase();
    const source = (body.source || "footer").trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return json({ ok: false, status: "invalid_email", message: "Digite um e-mail válido." }, 400);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rate = await enforceRateLimit(supabase, {
      bucket: "newsletter_subscribe",
      key: ip,
      limit: 20,
      windowMinutes: 10
    });

    if (!rate.allowed) {
      return json({ ok: false, message: "Muitas tentativas. Tente novamente em instantes." }, 429);
    }

    const { data: existing } = await supabase
      .from("newsletter_subscribers")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing?.id) {
      return json({
        ok: true,
        status: "already_exists",
        message: "Este e-mail já está cadastrado na newsletter."
      });
    }

    const { error: insertError } = await supabase
      .from("newsletter_subscribers")
      .insert({
        email,
        source,
        status: "active"
      });

    if (insertError) {
      return json({
        ok: false,
        status: "error",
        message: "Não foi possível salvar sua inscrição agora.",
        detail: insertError.message
      }, 500);
    }

    if (!RESEND_API_KEY) {
      return json({
        ok: false,
        status: "mail_failed",
        message: "E-mail salvo, mas o envio está temporariamente indisponível (RESEND_API_KEY ausente)."
      }, 500);
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: RESEND_FROM_EMAIL,
        to: [email],
        subject: "Confirmação da newsletter YARA Kids",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto;">
            <h2 style="color:#FF69B4; margin-bottom: 12px;">Cadastro confirmado!</h2>
            <p style="font-size:15px; color:#334155; line-height:1.6;">
              Obrigada por se cadastrar na newsletter da <strong>YARA Kids</strong>.
            </p>
            <p style="font-size:15px; color:#334155; line-height:1.6;">
              Você vai receber ofertas secretas, novidades e mimos especiais em primeira mão.
            </p>
            <p style="font-size:13px; color:#64748B; margin-top:24px;">
              Se você não fez esse cadastro, basta ignorar este e-mail.
            </p>
          </div>
        `
      })
    });

    if (!emailResponse.ok) {
      const detail = await emailResponse.text();
      return json({
        ok: false,
        status: "mail_failed",
        message: "E-mail salvo, mas houve falha ao enviar a confirmação.",
        detail
      }, 502);
    }

    return json({
      ok: true,
      status: "mail_sent",
      message: "Inscrição confirmada! Verifique seu e-mail."
    });
  } catch (error) {
    return json({
      ok: false,
      status: "error",
      message: "Falha inesperada ao processar a newsletter.",
      detail: String(error)
    }, 500);
  }
});

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

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json"
    }
  });
}
