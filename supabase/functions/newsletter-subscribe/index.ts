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
        subject: "Bem-vinda Ã  newsletter da YARA Kids",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto;">
            <h2 style="color:#FF69B4; margin-bottom: 12px;">Cadastro confirmado! ??</h2>
            <p style="font-size:15px; color:#334155; line-height:1.6;">
              Obrigada por se cadastrar na newsletter da <strong>YARA Kids</strong>.
            </p>
            <p style="font-size:15px; color:#334155; line-height:1.6;">
              VocÃª vai receber ofertas secretas, novidades e mimos especiais em primeira mÃ£o.
            </p>
            <p style="font-size:13px; color:#64748B; margin-top:24px;">
              Se vocÃª nÃ£o fez esse cadastro, basta ignorar este e-mail.
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
      message: "InscriÃ§Ã£o confirmada! Verifique seu e-mail."
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

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json"
    }
  });
}

