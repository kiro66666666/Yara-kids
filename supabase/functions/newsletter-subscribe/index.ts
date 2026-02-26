import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type SubscribeBody = {
  email?: string;
  source?: string;
};

const DEFAULT_FROM_EMAIL = "YARA Kids <onboarding@resend.dev>";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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
    const RESEND_FROM_EMAIL = normalizeFromEmail(Deno.env.get("RESEND_FROM_EMAIL") || DEFAULT_FROM_EMAIL);
    const NEWSLETTER_COUPON_CODE = Deno.env.get("NEWSLETTER_COUPON_CODE") || "WELCOME10";
    const NEWSLETTER_COUPON_PERCENT = Deno.env.get("NEWSLETTER_COUPON_PERCENT") || "10";

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return json({ ok: false, status: "error", message: "Missing Supabase environment variables." }, 500);
    }

    const body = (await req.json()) as SubscribeBody;
    const email = (body.email || "").trim().toLowerCase();
    const source = (body.source || "footer").trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return json({ ok: false, status: "invalid_email", message: "Digite um e-mail valido." });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rate = await enforceRateLimit(supabase, {
      bucket: "newsletter_subscribe",
      key: ip,
      limit: 20,
      windowMinutes: 10,
    });

    if (!rate.allowed) {
      return json({ ok: false, status: "error", message: "Muitas tentativas. Tente novamente em instantes." }, 429);
    }

    const { data: existing } = await supabase
      .from("newsletter_subscribers")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing?.id) {
      const resendResult = await sendCouponEmail({
        apiKey: RESEND_API_KEY,
        fromEmail: RESEND_FROM_EMAIL,
        toEmail: email,
        couponCode: NEWSLETTER_COUPON_CODE,
        couponPercent: NEWSLETTER_COUPON_PERCENT,
      });

      if (resendResult.ok) {
        return json({
          ok: true,
          status: "mail_sent",
          message: "Este e-mail ja estava cadastrado. Reenviamos o cupom para voce.",
        });
      }

      return json({
        ok: true,
        status: "already_exists",
        message: "Este e-mail ja esta cadastrado na newsletter.",
      });
    }

    const { error: insertError } = await supabase
      .from("newsletter_subscribers")
      .insert({
        email,
        source,
        status: "active",
      });

    if (insertError) {
      return json({
        ok: false,
        status: "error",
        message: "Nao foi possivel salvar sua inscricao agora.",
        detail: insertError.message,
      }, 500);
    }

    const sendResult = await sendCouponEmail({
      apiKey: RESEND_API_KEY,
      fromEmail: RESEND_FROM_EMAIL,
      toEmail: email,
      couponCode: NEWSLETTER_COUPON_CODE,
      couponPercent: NEWSLETTER_COUPON_PERCENT,
    });

    if (!sendResult.ok) {
      return json({
        ok: false,
        status: "mail_failed",
        message: "E-mail salvo, mas houve falha ao enviar o cupom.",
        detail: sendResult.detail,
      });
    }

    return json({
      ok: true,
      status: "mail_sent",
      message: "Inscricao confirmada! Cupom enviado para seu e-mail. Verifique caixa principal, Promocoes ou Spam.",
    });
  } catch (error) {
    return json({
      ok: false,
      status: "error",
      message: "Falha inesperada ao processar a newsletter.",
      detail: String(error),
    }, 500);
  }
});

async function enforceRateLimit(
  supabase: ReturnType<typeof createClient>,
  config: { bucket: string; key: string; limit: number; windowMinutes: number },
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
      window_started_at: new Date().toISOString(),
    });
    return { allowed: true };
  }

  const inWindow = existing.window_started_at >= cutoffIso;
  const nextCount = inWindow ? (existing.count || 0) + 1 : 1;

  await supabase
    .from("api_rate_limits")
    .update({
      count: nextCount,
      window_started_at: inWindow ? existing.window_started_at : new Date().toISOString(),
    })
    .eq("id", existing.id);

  return { allowed: nextCount <= config.limit };
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

type SendCouponEmailArgs = {
  apiKey: string;
  fromEmail: string;
  toEmail: string;
  couponCode: string;
  couponPercent: string;
};

type SendCouponEmailResult = {
  ok: boolean;
  detail?: string;
};

async function sendCouponEmail(args: SendCouponEmailArgs): Promise<SendCouponEmailResult> {
  if (!args.apiKey) {
    return { ok: false, detail: "Missing RESEND_API_KEY" };
  }

  const fromCandidates = buildFromCandidates(args.fromEmail);
  const details: string[] = [];

  for (const fromEmail of fromCandidates) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${args.apiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [args.toEmail],
        subject: `Seu cupom de ${args.couponPercent}% OFF chegou! | YARA Kids`,
        html: buildCouponHtml(args.couponCode, args.couponPercent),
        text: buildCouponText(args.couponCode, args.couponPercent),
      }),
    });

    if (response.ok) {
      return { ok: true };
    }

    const detail = compactDetail(await response.text());
    details.push(`${fromEmail}: ${detail}`);
  }

  return {
    ok: false,
    detail: details.join(" | "),
  };
}

function buildFromCandidates(preferred: string): string[] {
  if (!preferred || preferred === DEFAULT_FROM_EMAIL) {
    return [DEFAULT_FROM_EMAIL];
  }
  return [preferred, DEFAULT_FROM_EMAIL];
}

function normalizeFromEmail(raw: string): string {
  const trimmed = String(raw || "").trim().replace(/^["']+|["']+$/g, "");
  return trimmed || DEFAULT_FROM_EMAIL;
}

function compactDetail(value: string): string {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, 500);
}

function buildCouponHtml(couponCode: string, couponPercent: string): string {
  return `
    <div style="margin:0;padding:24px;background:#f6f7fb;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
      <div style="max-width:580px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e5e7eb;">
        <div style="padding:24px 28px;background:linear-gradient(90deg,#ff69b4,#9b7ede);color:#ffffff;">
          <p style="margin:0;font-size:12px;letter-spacing:1px;font-weight:700;text-transform:uppercase;">YARA Kids</p>
          <h1 style="margin:8px 0 0;font-size:26px;line-height:1.2;">Seu cupom chegou!</h1>
        </div>
        <div style="padding:28px;">
          <p style="margin:0 0 14px;font-size:15px;line-height:1.7;">Obrigada por entrar na nossa newsletter.</p>
          <p style="margin:0 0 18px;font-size:15px;line-height:1.7;">Use o cupom abaixo e ganhe desconto na sua proxima compra:</p>
          <div style="padding:16px;border:2px dashed #ff69b4;border-radius:14px;background:#fff6fb;text-align:center;">
            <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#6b7280;">Cupom de boas-vindas</p>
            <p style="margin:0;font-size:30px;font-weight:800;letter-spacing:1px;color:#db2777;">${couponCode}</p>
            <p style="margin:10px 0 0;font-size:13px;color:#4b5563;">${couponPercent}% OFF em produtos selecionados.</p>
          </div>
          <p style="margin:20px 0 0;font-size:13px;color:#6b7280;line-height:1.6;">
            Se voce nao solicitou esse cadastro, apenas ignore esta mensagem.
          </p>
        </div>
      </div>
    </div>
  `;
}

function buildCouponText(couponCode: string, couponPercent: string): string {
  return `YARA Kids\n\nSeu cupom de boas-vindas chegou!\nCodigo: ${couponCode}\nDesconto: ${couponPercent}% OFF\n\nSe nao foi voce, ignore este e-mail.`;
}
