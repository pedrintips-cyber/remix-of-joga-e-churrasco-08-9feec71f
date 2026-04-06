import { useMemo, useState } from "react";
import { ArrowLeft, Send, Loader2, MapPinned, CreditCard, ShieldCheck } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  onBack: () => void;
}

const brazilStates = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
  "SP", "SE", "TO",
];

const inputClassName = "w-full bg-muted border border-border rounded-xl px-3.5 py-3 text-foreground text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/40 outline-none transition-shadow";

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const formatCpf = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

const formatZip = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
};

const CheckoutForm = ({ onBack }: Props) => {
  const { items, total, clearCart, toggleCart } = useCart();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    document: "",
    zip: "",
    street: "",
    number: "",
    neighborhood: "",
    complement: "",
    city: "",
    state: "",
    reference: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [pixData, setPixData] = useState<{ qr_code: string; qr_code_base64: string } | null>(null);

  const fullAddress = useMemo(() => {
    const firstLine = `${form.street}, ${form.number}${form.complement ? `, ${form.complement}` : ""}`;
    const secondLine = `${form.neighborhood} - ${form.city}/${form.state}`;
    const thirdLine = `CEP ${form.zip}`;

    return [
      firstLine.trim(),
      secondLine.trim(),
      thirdLine.trim(),
      form.reference ? `Referência: ${form.reference}` : "",
    ]
      .filter(Boolean)
      .join(" | ");
  }, [form]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Save order to DB
      const orderItems = items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity }));
      const { data: order, error } = await supabase.from("orders").insert({
        customer_name: form.name,
        customer_phone: form.phone,
        customer_address: fullAddress,
        customer_email: form.email || null,
        customer_document: form.document || null,
        payment_method: "pix",
        items: orderItems,
        total,
        status: "pending",
      }).select().single();

      if (error) throw error;

      if (!order) throw new Error("Pedido não criado corretamente.");

      const { data: fnData, error: fnError } = await supabase.functions.invoke("paradise-create-transaction", {
        body: {
          order_id: order.id,
          amount: total,
          description: `Pedido #${order.id.slice(0, 8)}`,
          customer: {
            name: form.name,
            phone: form.phone,
            email: form.email,
            document: form.document,
          },
        },
      });

      if (fnError) throw fnError;
      if (!fnData?.success || !fnData?.qr_code) throw new Error("Não foi possível gerar o PIX no momento.");

      setPixData({ qr_code: fnData.qr_code, qr_code_base64: fnData.qr_code_base64 });
      toast.success("PIX gerado! Escaneie o QR Code para pagar.");
    } catch (err: any) {
      toast.error("Erro ao processar pedido: " + (err.message || "Tente novamente"));
    } finally {
      setSubmitting(false);
    }
  };

  const update = (field: keyof typeof form, value: string) => setForm((f) => ({ ...f, [field]: value }));

  // Show PIX QR Code screen
  if (pixData) {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="bg-card border border-border rounded-2xl p-5 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-display text-2xl text-foreground mb-1">Pague via PIX</h3>
            <p className="text-sm text-muted-foreground">Escaneie o QR Code abaixo ou copie o código para concluir seu pedido.</p>
          </div>
          {pixData.qr_code_base64 && (
            <img src={pixData.qr_code_base64} alt="QR Code PIX" className="mx-auto w-52 h-52 rounded-2xl border border-border bg-background p-3" />
          )}
          {pixData.qr_code && (
            <div className="space-y-3">
              <div className="bg-muted/60 border border-border rounded-xl p-3 text-left">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Código PIX copia e cola</p>
                <p className="text-xs text-foreground break-all">{pixData.qr_code}</p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(pixData.qr_code);
                  toast.success("Código PIX copiado!");
                }}
                className="w-full bg-gradient-green text-primary-foreground py-3 rounded-full font-bold text-sm hover:brightness-110 transition-all"
              >
                📋 Copiar Código PIX
              </button>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Após o pagamento, seu pedido será confirmado automaticamente.
          </p>
          <button
            onClick={() => { clearCart(); toggleCart(); }}
            className="mt-4 text-sm text-primary hover:underline"
          >
            Fechar
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
      <button type="button" onClick={onBack} className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-xs mb-1 transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Voltar
      </button>

      <div className="bg-card border border-border rounded-2xl p-4 space-y-3 animate-scale-in">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-xl text-foreground leading-none">Checkout rápido e seguro</h3>
            <p className="text-sm text-muted-foreground mt-1">Preencha seus dados e gere o PIX para pagar na hora.</p>
          </div>
        </div>
        <div className="bg-primary/10 border border-primary/20 rounded-xl px-3 py-2 flex items-center gap-2 text-sm text-foreground">
          <CreditCard className="h-4 w-4 text-primary" />
          <span>Pagamento disponível: <strong className="text-primary">somente PIX</strong></span>
        </div>
      </div>

      <section className="bg-card border border-border rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-secondary/20 text-secondary-foreground flex items-center justify-center">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-display text-xl text-foreground leading-none">Seus dados</h4>
            <p className="text-xs text-muted-foreground mt-1">Essas informações ajudam na confirmação do pedido.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-foreground block mb-1">Nome completo</label>
            <input required maxLength={100} type="text" value={form.name} onChange={(e) => update("name", e.target.value)} className={inputClassName} placeholder="Seu nome completo" />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Telefone</label>
            <input required type="tel" value={form.phone} onChange={(e) => update("phone", formatPhone(e.target.value))} className={inputClassName} placeholder="(00) 00000-0000" />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">CPF</label>
            <input type="text" value={form.document} onChange={(e) => update("document", formatCpf(e.target.value))} className={inputClassName} placeholder="000.000.000-00" />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-foreground block mb-1">Email</label>
            <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className={inputClassName} placeholder="seu@email.com" />
          </div>
        </div>
      </section>

      <section className="bg-card border border-border rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <MapPinned className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-display text-xl text-foreground leading-none">Endereço de entrega</h4>
            <p className="text-xs text-muted-foreground mt-1">Preencha cada campo certinho para evitar erro na entrega.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">CEP</label>
            <input required type="text" value={form.zip} onChange={(e) => update("zip", formatZip(e.target.value))} className={inputClassName} placeholder="00000-000" />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Número</label>
            <input required type="text" value={form.number} onChange={(e) => update("number", e.target.value)} className={inputClassName} placeholder="123" />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-foreground block mb-1">Rua / Avenida</label>
            <input required type="text" value={form.street} onChange={(e) => update("street", e.target.value)} className={inputClassName} placeholder="Rua, avenida ou travessa" />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Bairro</label>
            <input required type="text" value={form.neighborhood} onChange={(e) => update("neighborhood", e.target.value)} className={inputClassName} placeholder="Seu bairro" />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Complemento</label>
            <input type="text" value={form.complement} onChange={(e) => update("complement", e.target.value)} className={inputClassName} placeholder="Apto, bloco, casa" />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Cidade</label>
            <input required type="text" value={form.city} onChange={(e) => update("city", e.target.value)} className={inputClassName} placeholder="Sua cidade" />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Estado</label>
            <select required value={form.state} onChange={(e) => update("state", e.target.value)} className={inputClassName}>
              <option value="">Selecione</option>
              {brazilStates.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-foreground block mb-1">Ponto de referência</label>
            <input type="text" value={form.reference} onChange={(e) => update("reference", e.target.value)} className={inputClassName} placeholder="Ex.: perto da praça, portão azul" />
          </div>
        </div>
      </section>

      <div className="bg-card rounded-xl p-3 border border-border">
        <h4 className="font-semibold text-foreground text-sm mb-2">Resumo</h4>
        {items.map((i) => (
          <div key={i.id} className="flex justify-between text-xs text-muted-foreground py-0.5">
            <span>{i.quantity}x {i.name}</span>
            <span>R$ {(i.price * i.quantity).toFixed(2).replace(".", ",")}</span>
          </div>
        ))}
        <div className="flex justify-between font-bold text-foreground text-sm border-t border-border mt-2 pt-2">
          <span>Total</span>
          <span className="text-brasil-yellow">R$ {total.toFixed(2).replace(".", ",")}</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-gradient-green text-primary-foreground py-3.5 rounded-full font-extrabold text-base flex items-center justify-center gap-2 hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-50"
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {submitting ? "Gerando PIX..." : "Gerar PIX do Pedido"}
      </button>
    </form>
  );
};

export default CheckoutForm;
