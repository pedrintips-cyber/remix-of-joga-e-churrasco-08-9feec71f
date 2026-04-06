import { Save, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminPayments = () => {
  const [gatewayToken, setGatewayToken] = useState("");
  const [gatewayType, setGatewayType] = useState("paradise");
  const [saving, setSaving] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");

  const persistSetting = async (key: string, value: string) => {
    const { data: existingRows, error: selectError } = await supabase
      .from("site_settings")
      .select("id")
      .eq("key", key);

    if (selectError) throw selectError;

    if (existingRows && existingRows.length > 0) {
      const { error: updateError } = await supabase
        .from("site_settings")
        .update({ value })
        .eq("key", key);

      if (updateError) throw updateError;
      return;
    }

    const { error: insertError } = await supabase
      .from("site_settings")
      .insert({ key, value });

    if (insertError) throw insertError;
  };

  useEffect(() => {
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    setWebhookUrl(`https://${projectId}.supabase.co/functions/v1/paradise-webhook`);
    
    const fetch = async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["payment_gateway_token", "payment_gateway_type"]);

      if (error) {
        toast.error("Não foi possível carregar as configurações do gateway.");
        return;
      }

      if (data) {
        data.forEach((s) => {
          if (s.key === "payment_gateway_token") setGatewayToken(s.value || "");
          if (s.key === "payment_gateway_type") setGatewayType(s.value || "paradise");
        });
      }
    };
    fetch();
  }, []);

  const handleSave = async () => {
    if (gatewayType === "paradise" && !gatewayToken.trim()) {
      toast.error("Informe a Secret Key da Paradise antes de salvar.");
      return;
    }

    setSaving(true);

    try {
      await Promise.all([
        persistSetting("payment_gateway_token", gatewayToken.trim()),
        persistSetting("payment_gateway_type", gatewayType),
      ]);

      toast.success("Gateway salvo com sucesso!");
    } catch (error) {
      console.error("Error saving payment gateway settings:", error);
      toast.error("Não foi possível salvar o gateway.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h3 className="font-display text-xl text-foreground">💳 Gateway de Pagamento — Paradise</h3>

        <div>
          <label className="text-xs font-semibold text-foreground block mb-1.5">Tipo de Gateway</label>
          <select value={gatewayType} onChange={(e) => setGatewayType(e.target.value)}
            className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/40">
            <option value="paradise">Paradise (PIX)</option>
            <option value="pix_manual">PIX Manual (WhatsApp)</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-foreground block mb-1.5">Secret Key (X-API-Key)</label>
          <input type="password" value={gatewayToken} onChange={(e) => setGatewayToken(e.target.value)}
            className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/40"
            placeholder="sk_sua_chave_secreta_aqui" />
        </div>

        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 bg-gradient-green text-primary-foreground px-6 py-3 rounded-xl font-bold text-sm hover:brightness-110 transition-all disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl p-5 space-y-3">
        <h4 className="font-display text-lg text-foreground">🔗 URL do Webhook</h4>
        <p className="text-sm text-muted-foreground">Configure esta URL no painel da Paradise para receber notificações de pagamento:</p>
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={webhookUrl}
            className="flex-1 bg-muted border border-border rounded-xl px-4 py-3 text-foreground text-sm font-mono"
          />
          <button
            onClick={() => {
              navigator.clipboard.writeText(webhookUrl);
              toast.success("URL copiada!");
            }}
            className="bg-primary/10 text-primary px-4 py-3 rounded-xl text-sm font-medium hover:bg-primary/20 transition-colors"
          >
            📋 Copiar
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-5 space-y-3">
        <h4 className="font-display text-lg text-foreground">📖 Como configurar</h4>
        <div className="text-sm text-muted-foreground space-y-2">
          <p><strong className="text-foreground">1.</strong> Acesse o painel da Paradise e copie sua Secret Key.</p>
          <p><strong className="text-foreground">2.</strong> Cole acima e salve.</p>
          <p><strong className="text-foreground">3.</strong> Configure a URL do Webhook acima no painel da Paradise.</p>
          <p><strong className="text-foreground">4.</strong> Quando um cliente pagar, o status do pedido será atualizado automaticamente.</p>
          <p className="mt-3 text-xs"><strong className="text-foreground">PIX Manual:</strong> Se não tiver a chave, os pedidos serão enviados via WhatsApp.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminPayments;
