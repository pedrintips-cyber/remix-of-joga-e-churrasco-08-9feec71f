import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, Save, X } from "lucide-react";

interface KitItem {
  id: string;
  category: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  unit: string;
  max_quantity: number;
  sort_order: number;
  active: boolean;
}

const emptyItem: Omit<KitItem, "id"> = {
  category: "Carnes",
  name: "",
  description: "",
  price: 0,
  image_url: "",
  unit: "un",
  max_quantity: 10,
  sort_order: 0,
  active: true,
};

const AdminCustomKitItems = () => {
  const [items, setItems] = useState<KitItem[]>([]);
  const [editing, setEditing] = useState<KitItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Omit<KitItem, "id">>(emptyItem);
  const [loading, setLoading] = useState(false);

  const fetchItems = async () => {
    const { data } = await supabase.from("custom_kit_items").select("*").order("sort_order") as { data: KitItem[] | null };
    if (data) setItems(data);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Nome é obrigatório"); return; }
    setLoading(true);
    try {
      if (editing) {
        const { error } = await supabase.from("custom_kit_items").update(form).eq("id", editing.id);
        if (error) throw error;
        toast.success("Item atualizado!");
      } else {
        const { error } = await supabase.from("custom_kit_items").insert(form);
        if (error) throw error;
        toast.success("Item criado!");
      }
      setEditing(null);
      setCreating(false);
      setForm(emptyItem);
      fetchItems();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este item?")) return;
    const { error } = await supabase.from("custom_kit_items").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Excluído!"); fetchItems(); }
  };

  const startEdit = (item: KitItem) => {
    setEditing(item);
    setCreating(false);
    setForm({ category: item.category, name: item.name, description: item.description, price: item.price, image_url: item.image_url, unit: item.unit, max_quantity: item.max_quantity, sort_order: item.sort_order, active: item.active });
  };

  const update = (field: string, value: any) => setForm((f) => ({ ...f, [field]: value }));

  const showForm = creating || editing;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display text-foreground">Kit Personalizado</h1>
          <p className="text-sm text-muted-foreground">Gerencie os itens disponíveis para o cliente montar seu kit</p>
        </div>
        {!showForm && (
          <button onClick={() => { setCreating(true); setForm(emptyItem); }} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold text-sm hover:bg-primary/90">
            <Plus className="h-4 w-4" /> Novo Item
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3 animate-scale-in">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg text-foreground">{editing ? "Editar Item" : "Novo Item"}</h3>
            <button onClick={() => { setCreating(false); setEditing(null); }} className="p-1 hover:bg-muted rounded-full"><X className="h-4 w-4" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold block mb-1">Nome *</label>
              <input value={form.name} onChange={(e) => update("name", e.target.value)} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground" placeholder="Ex: Picanha Premium" />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1">Categoria</label>
              <input value={form.category} onChange={(e) => update("category", e.target.value)} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground" placeholder="Ex: Carnes, Acompanhamentos" />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1">Preço (R$)</label>
              <input type="number" step="0.01" value={form.price} onChange={(e) => update("price", parseFloat(e.target.value) || 0)} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground" />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1">Unidade</label>
              <input value={form.unit} onChange={(e) => update("unit", e.target.value)} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground" placeholder="un, kg, pacote" />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1">Qtd Máxima</label>
              <input type="number" value={form.max_quantity} onChange={(e) => update("max_quantity", parseInt(e.target.value) || 1)} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground" />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1">Ordem</label>
              <input type="number" value={form.sort_order} onChange={(e) => update("sort_order", parseInt(e.target.value) || 0)} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold block mb-1">Descrição</label>
              <input value={form.description || ""} onChange={(e) => update("description", e.target.value)} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground" placeholder="Descrição curta" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold block mb-1">URL da Imagem</label>
              <input value={form.image_url || ""} onChange={(e) => update("image_url", e.target.value)} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground" placeholder="https://..." />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={form.active} onChange={(e) => update("active", e.target.checked)} className="rounded" />
              <label className="text-sm text-foreground">Ativo</label>
            </div>
          </div>
          <button onClick={handleSave} disabled={loading} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold text-sm hover:bg-primary/90 disabled:opacity-50">
            <Save className="h-4 w-4" /> {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      )}

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 bg-card border border-border rounded-xl p-3">
            {item.image_url ? (
              <img src={item.image_url} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-lg">🥩</div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-foreground text-sm truncate">{item.name}</h4>
                {!item.active && <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">Inativo</span>}
              </div>
              <p className="text-muted-foreground text-xs">{item.category} • R$ {Number(item.price).toFixed(2).replace(".", ",")} / {item.unit}</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => startEdit(item)} className="p-2 hover:bg-muted rounded-lg"><Edit2 className="h-4 w-4 text-muted-foreground" /></button>
              <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-destructive/15 rounded-lg"><Trash2 className="h-4 w-4 text-destructive" /></button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">Nenhum item cadastrado ainda.</p>}
      </div>
    </div>
  );
};

export default AdminCustomKitItems;
