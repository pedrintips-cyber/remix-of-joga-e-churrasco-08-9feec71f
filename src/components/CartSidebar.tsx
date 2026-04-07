import { X, Plus, Minus, Trash2, Flame } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import CheckoutForm from "./CheckoutForm";

const CartSidebar = () => {
  const { items, isOpen, isCheckout, toggleCart, removeItem, updateQuantity, total, openCheckout, closeCheckout } = useCart();

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-background/70 backdrop-blur-sm z-50" onClick={toggleCart} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-background border-l border-border z-50 flex flex-col animate-fade-in">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-display text-xl text-foreground flex items-center gap-2">
            <Flame className="h-5 w-5 text-primary" />
            {isCheckout ? "Finalizar Pedido" : "Meu Pedido"}
          </h2>
          <button onClick={toggleCart} className="p-1.5 hover:bg-muted rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {isCheckout ? (
          <CheckoutForm onBack={closeCheckout} />
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Flame className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p className="font-medium">Carrinho vazio</p>
                  <p className="text-xs mt-1">Escolha seus cortes favoritos!</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-3 bg-card rounded-xl p-3 border border-border">
                    {item.image && <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover" />}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground text-sm truncate">{item.name}</h4>
                      <p className="text-primary font-display text-base leading-none mt-0.5">
                        R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:bg-muted rounded-md">
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="font-bold text-foreground w-5 text-center text-sm">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:bg-muted rounded-md">
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => removeItem(item.id)} className="ml-auto p-1 hover:bg-destructive/15 rounded-md text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-border p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="font-display text-2xl text-primary">
                    R$ {total.toFixed(2).replace(".", ",")}
                  </span>
                </div>
                <button
                  onClick={openCheckout}
                  className="w-full bg-gradient-cta text-primary-foreground py-3.5 rounded-xl font-extrabold text-base shadow-cta hover:brightness-110 transition-all active:scale-[0.98]"
                >
                  Finalizar Pedido →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default CartSidebar;
