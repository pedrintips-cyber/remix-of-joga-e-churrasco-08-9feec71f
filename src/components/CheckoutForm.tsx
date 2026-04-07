import { useMemo, useState } from "react";
import { ArrowLeft, Send, Loader2, CreditCard } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  onBack: () => void;
}

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const inputClassName = "w-full bg-muted border border-border rounded-xl px-3.5 py-3 text-foreground text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/40 outline-none transition-shadow";

const CheckoutForm = ({ onBack }: Props) => {
  const { items, total, clearCart, toggleCart } = useCart();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    street: "",
    number: "",
    neighborhood: "",
    city: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [pixData, setPixData] = useState<{ qr_code: string; qr_code_base64: string } | null>(null);

  const fullAddress = useMemo(() => {
    return `${form.street}, ${form.number} - ${form.neighborhood}, ${form.city}`;
  }, [form]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const orderItems = items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity }));
      const { data: order, error } = await supabase.from("orders").insert({
        customer_name: form.name,
        customer_phone: form.phone,
        customer_address: fullAddress,
        payment_method: "pix",
        items: orderItems,
        total,
        status: "pending",
      }).select().single();

      if (error) throw error;
      if (!order) throw new Error("Pedido não criado.");

      const { data: fnData, error: fnError } = await supabase.functions.invoke("paradise-create-transaction", {
        body: {
          order_id: order.id,
          amount: total,
          description: `Pedido #${order.id.slice(0, 8)}`,
          customer: { name: form.name, phone: form.phone },
        },
      });

      if (fnError) throw fnError;
      if (!fnData?.success || !fnData?.qr_code) throw new Error("Não foi possível gerar o PIX.");

      setPixData({ qr_code: fnData.qr_code, qr_code_base64: fnData.qr_code_base64 });
      toast.success("PIX gerado!");
    } catch (err: any) {
      toast.error("Erro: " + (err.message || "Tente novamente"));
    } finally {
      setSubmitting(false);
    }
  };

  const update = (field: keyof typeof form, value: string) => setForm((f) => ({ ...f, [field]: value }));

  if (pixData) {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="bg-card border border-border rounded-2xl p-5 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-display text-2xl text-foreground mb-1">Pague via PIX</h3>
            <p className="text-sm text-muted-foreground">Escaneie o QR Code ou copie o código.</p>
          </div>
          {pixData.qr_code_base64 && (
            <img src={pixData.qr_code_base64} alt="QR Code PIX" className="mx-auto w-48 h-48 rounded-2xl border border-border bg-background p-2" />
          )}
          {pixData.qr_code && (
            <div className="space-y-3">
              <div className="bg-muted/60 border border-border rounded-xl p-3 text-left">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Código PIX</p>
                <p className="text-xs text-foreground break-all">{pixData.qr_code}</p>
              </div>
              <button
                onClick={() => { navigator.clipboard.writeText(pixData.qr_code); toast.success("Copiado!"); }}
                className="w-full bg-gradient-cta text-primary-foreground py-3 rounded-xl font-bold text-sm hover:brightness-110 transition-all"
              >
                📋 Copiar Código PIX
              </button>
            </div>
          )}
          <button onClick={() => { clearCart(); toggleCart(); }} className="mt-4 text-sm text-primary hover:underline">
            Fechar
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-3">
      <button type="button" onClick={onBack} className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-xs mb-1">
        <ArrowLeft className="h-3.5 w-3.5" /> Voltar
      </button>

      <div className="space-y-3">
        <div>
          <label className="text-xs font-semibold text-foreground block mb-1">Nome</label>
          <input required maxLength={100} type="text" value={form.name} onChange={(e) => update("name", e.target.value)} className={inputClassName} placeholder="Seu nome" />
        </div>
        <div>
          <label className="text-xs font-semibold text-foreground block mb-1">Telefone</label>
          <input required type="tel" value={form.phone} onChange={(e) => update("phone", formatPhone(e.target.value))} className={inputClassName} placeholder="(00) 00000-0000" />
        </div>
      </div>

      <div className="space-y-3 mt-2">
        <h4 className="font-display text-base text-foreground">Endereço</h4>
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2">
            <input required type="text" value={form.street} onChange={(e) => update("street", e.target.value)} className={inputClassName} placeholder="Rua / Avenida" />
          </div>
          <div>
            <input required type="text" value={form.number} onChange={(e) => update("number", e.target.value)} className={inputClassName} placeholder="Nº" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input required type="text" value={form.neighborhood} onChange={(e) => update("neighborhood", e.target.value)} className={inputClassName} placeholder="Bairro" />
          <input required type="text" value={form.city} onChange={(e) => update("city", e.target.value)} className={inputClassName} placeholder="Cidade" />
        </div>
      </div>

      <div className="bg-card rounded-xl p-3 border border-border mt-2">
        <h4 className="font-semibold text-foreground text-xs mb-2">Resumo</h4>
        {items.map((i) => (
          <div key={i.id} className="flex justify-between text-[11px] text-muted-foreground py-0.5">
            <span>{i.quantity}x {i.name}</span>
            <span>R$ {(i.price * i.quantity).toFixed(2).replace(".", ",")}</span>
          </div>
        ))}
        <div className="flex justify-between font-bold text-foreground text-sm border-t border-border mt-2 pt-2">
          <span>Total</span>
          <span className="text-primary">R$ {total.toFixed(2).replace(".", ",")}</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-gradient-cta text-primary-foreground py-3.5 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-50 shadow-cta"
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {submitting ? "Gerando PIX..." : "Gerar PIX e Pagar"}
      </button>
    </form>
  );
};

export default CheckoutForm;
