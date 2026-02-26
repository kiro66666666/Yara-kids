import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Body = {
  email?: string;
  name?: string;
};

const DEFAULT_FROM_EMAIL = "YARA Kids <onboarding@resend.dev>";

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
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
    const RESEND_FROM_EMAIL = normalizeFromEmail(Deno.env.get("RESEND_FROM_EMAIL") || DEFAULT_FROM_EMAIL);

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return json({ ok: false, message: "Missing Supabase env." }, 500);
    }

    const body = (await req.json()) as Body;
    const email = String(body.email || "").trim().toLowerCase();
    const name = String(body.name || "Cliente").trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return json({ ok: false, message: "E-mail invalido." }, 400);
    }

    if (!RESEND_API_KEY) {
      return json({ ok: false, message: "Envio de e-mail indisponivel." }, 503);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const key = `${ip}:${email}`;
    const rate = await enforceRateLimit(supabase, {
      bucket: "welcome_email",
      key,
      limit: 5,
      windowMinutes: 60
    });
    if (!rate.allowed) {
      return json({ ok: false, message: "Muitas tentativas. Tente novamente mais tarde." }, 429);
    }

    const safeName = escapeHtml(name || "Cliente");
    const html = `
      <div style="margin:0;padding:24px;background:#f6f7fb;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
        <div style="max-width:580px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e5e7eb;">
          <div style="padding:24px 28px;background:linear-gradient(90deg,#ff69b4,#9b7ede);color:#ffffff;">
            <p style="margin:0;font-size:12px;letter-spacing:1px;font-weight:700;text-transform:uppercase;">YARA Kids</p>
            <h1 style="margin:8px 0 0;font-size:26px;line-height:1.2;">Bem-vindo(a), ${safeName}!</h1>
          </div>
          <div style="padding:28px;">
            <p style="margin:0 0 14px;font-size:15px;line-height:1.7;">Sua conta foi criada com sucesso.</p>
            <p style="margin:0 0 18px;font-size:15px;line-height:1.7;">Agora voce ja pode salvar favoritos, acompanhar pedidos e receber nossas ofertas.</p>
            <a href="https://yara-kids-b48ed.web.app/#/catalogo" style="display:inline-block;padding:12px 20px;border-radius:12px;background:#ff69b4;color:#fff;text-decoration:none;font-weight:700;">
              Ver catalogo
            </a>
            <p style="margin:20px 0 0;font-size:13px;color:#6b7280;line-height:1.6;">
              Se voce nao reconhece este cadastro, ignore este e-mail.
            </p>
          </div>
        </div>
      </div>
    `;

    const sendResult = await sendWithFallback({
      apiKey: RESEND_API_KEY,
      fromEmail: RESEND_FROM_EMAIL,
      toEmail: email,
      html,
      text: `YARA Kids\n\nBem-vindo(a), ${name}!\nSua conta foi criada com sucesso.`
    });

    if (!sendResult.ok) {
      return json({ ok: false, message: "Falha ao enviar e-mail de boas-vindas.", detail: sendResult.detail }, 502);
    }

    return json({ ok: true, status: "mail_sent", message: "E-mail de boas-vindas enviado." });
  } catch (error) {
    return json({ ok: false, message: "Falha inesperada no envio.", detail: String(error) }, 500);
  }
});

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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

type SendWithFallbackArgs = {
  apiKey: string;
  fromEmail: string;
  toEmail: string;
  html: string;
  text: string;
};

type SendWithFallbackResult = {
  ok: boolean;
  detail?: string;
};

async function sendWithFallback(args: SendWithFallbackArgs): Promise<SendWithFallbackResult> {
  const details: string[] = [];
  const fromCandidates = buildFromCandidates(args.fromEmail);

  for (const fromEmail of fromCandidates) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${args.apiKey}`
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [args.toEmail],
        subject: "Bem-vindo(a) a YARA Kids",
        html: args.html,
        text: args.text
      })
    });

    if (response.ok) {
      return { ok: true };
    }

    details.push(`${fromEmail}: ${compactDetail(await response.text())}`);
  }

  return { ok: false, detail: details.join(" | ") };
}

function normalizeFromEmail(raw: string): string {
  const trimmed = String(raw || "").trim().replace(/^["']+|["']+$/g, "");
  return trimmed || DEFAULT_FROM_EMAIL;
}

function buildFromCandidates(preferred: string): string[] {
  if (!preferred || preferred === DEFAULT_FROM_EMAIL) {
    return [DEFAULT_FROM_EMAIL];
  }
  return [preferred, DEFAULT_FROM_EMAIL];
}

function compactDetail(value: string): string {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, 500);
}
