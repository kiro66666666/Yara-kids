import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return json({ ok: false, message: "Missing Supabase env." }, 500);
    }

    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
    if (!token) return json({ ok: false, message: "Unauthorized." }, 401);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData?.user) {
      return json({ ok: false, message: "Unauthorized." }, 401);
    }

    const role = authData.user.app_metadata?.["role"] || authData.user.user_metadata?.["role"];
    if (role !== "admin") {
      return json({ ok: false, message: "Forbidden." }, 403);
    }

    const accessToken = (Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN") || "").trim();
    const resendKey = (Deno.env.get("RESEND_API_KEY") || "").trim();

    let mercadoPagoMode: "sandbox" | "production" | "unknown" = "unknown";
    if (accessToken.startsWith("TEST-")) mercadoPagoMode = "sandbox";
    if (accessToken.startsWith("APP_USR-")) mercadoPagoMode = "production";

    let mercadoPagoReachable = false;
    if (accessToken) {
      try {
        const r = await fetch("https://api.mercadopago.com/users/me", {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        mercadoPagoReachable = r.ok;
      } catch {
        mercadoPagoReachable = false;
      }
    }

    const mercadoPagoConfigured = !!accessToken;
    const resendConfigured = !!resendKey;

    return json({
      ok: true,
      mercadoPagoConfigured,
      mercadoPagoMode,
      mercadoPagoReachable,
      resendConfigured,
      message: mercadoPagoConfigured
        ? "Secrets de integração verificados sem expor chaves."
        : "Configure MERCADO_PAGO_ACCESS_TOKEN no Secret do Supabase."
    });
  } catch (error) {
    return json({ ok: false, message: "Erro ao verificar integrações.", detail: String(error) }, 500);
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

