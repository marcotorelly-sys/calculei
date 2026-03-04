// Supabase Edge Function — Webhook do Mercado Pago
// Recebe IPN do Mercado Pago e ativa Premium para o email do pagador
//
// Deploy: supabase functions deploy mercadopago-webhook
// Variáveis de ambiente necessárias:
//   MERCADO_PAGO_ACCESS_TOKEN — Token de acesso do Mercado Pago
//
// URL do webhook para configurar no Mercado Pago:
//   https://<SUPABASE_PROJECT_REF>.supabase.co/functions/v1/mercadopago-webhook

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('[webhook] Recebido:', JSON.stringify(body));

    // Mercado Pago envia diferentes tipos de notificação
    // Para pagamentos: type = "payment", data.id = payment_id
    if (body.type !== 'payment' && body.action !== 'payment.created' && body.action !== 'payment.updated') {
      return new Response(JSON.stringify({ ok: true, msg: 'Tipo ignorado' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const paymentId = body.data?.id;
    if (!paymentId) {
      return new Response(JSON.stringify({ error: 'Sem payment ID' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Buscar detalhes do pagamento na API do Mercado Pago
    const mpToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
    if (!mpToken) {
      console.error('[webhook] MERCADO_PAGO_ACCESS_TOKEN não configurado');
      return new Response(JSON.stringify({ error: 'Config error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const paymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { 'Authorization': `Bearer ${mpToken}` },
    });

    if (!paymentRes.ok) {
      console.error('[webhook] Erro ao buscar pagamento:', paymentRes.status);
      return new Response(JSON.stringify({ error: 'MP API error' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payment = await paymentRes.json();
    console.log('[webhook] Pagamento:', payment.id, payment.status, payment.payer?.email);

    // Só processar pagamentos aprovados
    if (payment.status !== 'approved') {
      return new Response(JSON.stringify({ ok: true, msg: 'Pagamento não aprovado', status: payment.status }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extrair email do pagador
    const email = payment.payer?.email?.toLowerCase()?.trim();
    if (!email) {
      console.error('[webhook] Pagamento sem email do pagador');
      return new Response(JSON.stringify({ error: 'Sem email' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Conectar ao Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Calcular expiração (30 dias a partir de agora)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Upsert premium_users — se já existe, atualiza a expiração
    const { error: dbError } = await supabase
      .from('premium_users')
      .upsert({
        email,
        payment_id: String(paymentId),
        mp_status: payment.status,
        amount: payment.transaction_amount,
        created_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
      }, {
        onConflict: 'email',
      });

    if (dbError) {
      console.error('[webhook] Erro DB:', dbError);
      return new Response(JSON.stringify({ error: 'DB error', details: dbError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[webhook] Premium ativado para ${email} até ${expiresAt.toISOString()}`);

    return new Response(JSON.stringify({
      ok: true,
      email,
      expires_at: expiresAt.toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('[webhook] Erro:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
