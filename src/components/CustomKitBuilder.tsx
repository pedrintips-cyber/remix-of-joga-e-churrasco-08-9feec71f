import { useEffect, useState, useMemo } from "react";
import { Plus, Minus, ShoppingCart, Flame } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface KitItem {
  id: string;
  category: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  unit: string;
  max_quantity: number;
}

const CustomKitBuilder = () => {
  const { addItem } = useCart();
  const [items, setItems] = useState<KitItem[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("custom_kit_items")
        .select("*")
        .eq("active", true)
        .order("sort_order");
      if (data) setItems(data as KitItem[]);
    };
    fetch();
  }, []);

  const categories = useMemo(() => {
    const cats = [...new Set(items.map((i) => i.category))];
    return cats;
  }, [items]);

  const updateQty = (id: string, delta: number, max: number) => {
    setQuantities((prev) => {
      const current = prev[id] || 0;
      const next = Math.max(0, Math.min(max, current + delta));
      return { ...prev, [id]: next };
    });
  };

  const selectedItems = useMemo(() => {
    return items.filter((i) => (quantities[i.id] || 0) > 0);
  }, [items, quantities]);

  const kitTotal = useMemo(() => {
    return selectedItems.reduce((sum, i) => sum + i.price * (quantities[i.id] || 0), 0);
  }, [selectedItems, quantities]);

  const handleAddKit = () => {
    if (selectedItems.length === 0) {
      toast.error("Selecione pelo menos um item pro seu kit!");
      return;
    }

    const kitName = `Kit Personalizado (${selectedItems.length} itens)`;
    const kitId = `custom-kit-${Date.now()}`;

    addItem({
      id: kitId,
      name: kitName,
      price: kitTotal,
      image: "",
    });

    setQuantities({});
    toast.success("Kit adicionado ao carrinho! 🔥");
  };

  if (items.length === 0) {
    return (
      <section className="py-8">
        <div className="container text-center">
          <Flame className="h-12 w-12 mx-auto text-primary/20 mb-3" />
          <h2 className="font-display text-xl text-foreground mb-1">Monte Seu Kit</h2>
          <p className="text-muted-foreground text-sm">Em breve disponível! Estamos preparando os melhores cortes pra você montar seu kit perfeito.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-4 md:py-8">
      <div className="container">
        <div className="text-center mb-4">
          <h2 className="font-display text-2xl md:text-3xl text-gradient-fire">MONTE SEU KIT</h2>
          <p className="text-muted-foreground text-xs mt-1">Escolha os cortes e quantidades. Faça do seu jeito!</p>
        </div>

        <div className="space-y-5">
          {categories.map((cat) => {
            const catItems = items.filter((i) => i.category === cat);
            return (
              <div key={cat}>
                <h3 className="font-display text-base md:text-lg text-foreground mb-2 flex items-center gap-2">
                  <span className="w-1 h-5 bg-primary rounded-full" />
                  {cat.toUpperCase()}
                </h3>
                <div className="space-y-2">
                  {catItems.map((item) => {
                    const qty = quantities[item.id] || 0;
                    return (
                      <div
                        key={item.id}
                        className={`flex items-center gap-3 bg-card rounded-xl p-3 border transition-all ${
                          qty > 0 ? "border-primary/50 bg-primary/5" : "border-border"
                        }`}
                      >
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                        ) : (
                          <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center text-lg shrink-0">🥩</div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-foreground text-sm truncate">{item.name}</h4>
                          {item.description && <p className="text-muted-foreground text-[10px] truncate">{item.description}</p>}
                          <p className="text-primary font-display text-sm mt-0.5">
                            R$ {Number(item.price).toFixed(2).replace(".", ",")} / {item.unit}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => updateQty(item.id, -1, item.max_quantity)}
                            className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center hover:bg-primary/20 transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center font-bold text-foreground text-sm">{qty}</span>
                          <button
                            onClick={() => updateQty(item.id, 1, item.max_quantity)}
                            className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center hover:bg-primary/20 transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Kit Summary */}
        {selectedItems.length > 0 && (
          <div className="mt-5 bg-card border border-primary/30 rounded-xl p-4 animate-scale-in">
            <h4 className="font-display text-base text-foreground mb-2">Seu Kit</h4>
            <div className="space-y-1">
              {selectedItems.map((i) => (
                <div key={i.id} className="flex justify-between text-xs text-muted-foreground">
                  <span>{quantities[i.id]}x {i.name}</span>
                  <span>R$ {(i.price * quantities[i.id]).toFixed(2).replace(".", ",")}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-bold text-foreground text-sm border-t border-border mt-2 pt-2">
              <span>Total do Kit</span>
              <span className="text-primary font-display text-lg">R$ {kitTotal.toFixed(2).replace(".", ",")}</span>
            </div>
            <button
              onClick={handleAddKit}
              className="w-full mt-3 bg-gradient-cta text-primary-foreground py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-cta hover:brightness-110 active:scale-[0.98] transition-all"
            >
              <ShoppingCart className="h-4 w-4" />
              Adicionar Kit ao Carrinho
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default CustomKitBuilder;
