import { Truck, Beef, Flame, ShieldCheck } from "lucide-react";

const items = [
  { icon: Beef, title: "Cortes Premium", desc: "Seleção nobre" },
  { icon: Flame, title: "Brasa Perfeita", desc: "Pronto pra grelha" },
  { icon: Truck, title: "Entrega Rápida", desc: "No seu endereço" },
  { icon: ShieldCheck, title: "Qualidade", desc: "Garantia total" },
];

const Differentials = () => (
  <section className="py-4 md:py-8">
    <div className="container">
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {items.map((item) => (
          <div key={item.title} className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <item.icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-xs text-foreground leading-tight">{item.title}</h3>
              <p className="text-muted-foreground text-[9px]">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Differentials;
