import { ShoppingCart, Flame } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

const Header = () => {
  const { toggleCart, totalItems } = useCart();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border/50">
      <div className="container flex items-center justify-between h-12 md:h-14">
        <a href="#inicio" className="flex items-center gap-1.5">
          <Flame className="h-5 w-5 text-primary" />
          <span className="font-display text-lg md:text-xl text-gradient-fire leading-none tracking-wide">CHURRASCO DA TORCIDA</span>
        </a>

        <button onClick={toggleCart} className="relative p-2 hover:bg-muted rounded-full transition-colors">
          <ShoppingCart className="h-5 w-5 text-foreground" />
          {totalItems > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[9px] font-bold w-4.5 h-4.5 min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center animate-scale-in">
              {totalItems}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
