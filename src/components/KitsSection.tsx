import { useEffect, useState, useRef } from "react";
import { ShoppingCart, ChevronRight, Users } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";

interface Category {
  id: string;
  name: string;
  sort_order: number;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  serves: number | null;
  tag: string | null;
  category_id: string | null;
  sort_order: number;
}

interface Props {
  filterCategory?: string;
  onViewAll?: () => void;
}

const KitsSection = ({ filterCategory, onViewAll }: Props) => {
  const { addItem } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: cats }, { data: prods }] = await Promise.all([
        supabase.from("categories").select("*").eq("active", true).order("sort_order"),
        supabase.from("products").select("*").eq("active", true).order("sort_order"),
      ]);
      if (cats) setCategories(cats);
      if (prods) setProducts(prods);
    };
    fetchData();
  }, []);

  if (categories.length === 0 && products.length === 0) return null;

  const filteredCategories = filterCategory === "bebidas"
    ? categories.filter(c => c.name.toLowerCase().includes("bebida"))
    : filterCategory === "carnes"
    ? categories.filter(c => !c.name.toLowerCase().includes("bebida"))
    : categories;

  return (
    <section id="kits" className="py-4 md:py-10">
      <div className="space-y-6">
        {filteredCategories.map((cat) => {
          const catProducts = products.filter((p) => p.category_id === cat.id);
          if (catProducts.length === 0) return null;

          return (
            <CategoryRow
              key={cat.id}
              category={cat}
              products={catProducts}
              addItem={addItem}
            />
          );
        })}

        {onViewAll && (
          <div className="container">
            <button
              onClick={onViewAll}
              className="w-full py-3 rounded-xl border border-border bg-card text-foreground font-display text-sm flex items-center justify-center gap-2 hover:bg-muted transition-colors"
            >
              Ver Todos os Produtos <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

const CategoryRow = ({ category, products, addItem }: { category: Category; products: Product[]; addItem: any }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div>
      <div className="container flex items-center justify-between mb-2">
        <h2 className="font-display text-lg md:text-2xl text-foreground">{category.name.toUpperCase()}</h2>
        <span className="text-xs text-muted-foreground">{products.length} itens</span>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pl-4 pr-4 pb-2 snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products.map((product) => (
          <ProductCard key={product.id} product={product} addItem={addItem} />
        ))}
      </div>
    </div>
  );
};

const ProductCard = ({ product, addItem }: { product: Product; addItem: any }) => (
  <div className="snap-start shrink-0 w-[160px] md:w-[220px] bg-card rounded-xl overflow-hidden border border-border hover:border-primary/40 transition-all group">
    <div className="relative overflow-hidden">
      {product.image_url ? (
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-28 md:h-40 object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-28 md:h-40 bg-muted flex items-center justify-center text-muted-foreground text-3xl">🥩</div>
      )}
      {product.tag && (
        <span className="absolute top-1.5 left-1.5 bg-primary/90 text-primary-foreground px-2 py-0.5 rounded-full text-[9px] font-bold">
          {product.tag}
        </span>
      )}
    </div>
    <div className="p-2.5">
      <h3 className="font-display text-sm md:text-base text-foreground leading-tight truncate">{product.name}</h3>
      {product.description && (
        <p className="text-muted-foreground text-[10px] mt-0.5 line-clamp-1">{product.description}</p>
      )}
      {product.serves && (
        <div className="flex items-center gap-1 mt-1 text-muted-foreground text-[9px]">
          <Users className="h-2.5 w-2.5" />
          <span>{product.serves} pessoas</span>
        </div>
      )}
      <div className="mt-2 pt-2 border-t border-border/50">
        <span className="font-display text-base md:text-lg text-primary block leading-none">
          R$ {Number(product.price).toFixed(2).replace(".", ",")}
        </span>
        <button
          onClick={() => addItem({ id: product.id, name: product.name, price: Number(product.price), image: product.image_url || "" })}
          className="w-full flex items-center justify-center gap-1 bg-gradient-cta text-primary-foreground mt-2 py-2 rounded-lg font-bold text-[11px] hover:brightness-110 active:scale-95 transition-all shadow-cta"
        >
          <ShoppingCart className="h-3 w-3" />
          Adicionar
        </button>
      </div>
    </div>
  </div>
);

export default KitsSection;
