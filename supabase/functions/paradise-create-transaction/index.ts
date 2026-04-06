import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { order_id, customer, amount, description } = body;

    if (!order_id || !customer || !amount) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get Paradise API key from site_settings
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: setting, error: settingsError } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "payment_gateway_token")
      .maybeSingle();

    if (settingsError) {
      return new Response(JSON.stringify({ error: "Could not load payment gateway settings" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = setting?.value;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Payment gateway not configured" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create transaction on Paradise
    const paradiseRes = await fetch("https://multi.paradisepags.com/api/v1/transaction.php", {
      method: "POST",
      headers: {
        "X-API-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Convert to cents
        description: description || "Pedido Churrasco da Torcida",
        reference: order_id,
        source: "api_externa",
        customer: {
          name: customer.name,
          email: customer.email || "cliente@churrascodatorcida.com",
          phone: customer.phone.replace(/\D/g, ""),
          document: customer.document || "00000000000",
        },
      }),
    });

    if (!paradiseRes.ok) {
      const paradiseError = await paradiseRes.text();

      return new Response(JSON.stringify({ error: "Failed to reach Paradise gateway", details: paradiseError }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const paradiseData = await paradiseRes.json();

    if (paradiseData.status === "success" || paradiseData.qr_code) {
      // Update order with paradise transaction_id
      await supabase
        .from("orders")
        .update({
          status: "pending",
          paradise_transaction_id: paradiseData.transaction_id ?? null,
        })
        .eq("id", order_id);

      return new Response(JSON.stringify({
        success: true,
        qr_code: paradiseData.qr_code,
        qr_code_base64: paradiseData.qr_code_base64,
        transaction_id: paradiseData.transaction_id,
        amount: paradiseData.amount,
        expires_at: paradiseData.expires_at,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      return new Response(JSON.stringify({ error: "Failed to create transaction", details: paradiseData }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
