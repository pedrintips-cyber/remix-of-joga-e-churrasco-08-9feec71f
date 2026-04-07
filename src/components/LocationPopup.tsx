import { useState, useEffect } from "react";
import { MapPin, X, Truck } from "lucide-react";

const LocationPopup = () => {
  const [visible, setVisible] = useState(false);
  const [city, setCity] = useState("");

  useEffect(() => {
    if (sessionStorage.getItem("location_shown")) return;
    const getLocation = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        if (data.city) {
          setCity(data.city);
          setVisible(true);
          sessionStorage.setItem("location_shown", "1");
          setTimeout(() => setVisible(false), 6000);
        }
      } catch {}
    };
    setTimeout(getLocation, 2000);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-primary/30 rounded-2xl p-5 max-w-sm w-full shadow-2xl relative animate-scale-in">
        <button onClick={() => setVisible(false)} className="absolute top-3 right-3 p-1.5 hover:bg-muted rounded-full text-muted-foreground">
          <X className="h-4 w-4" />
        </button>
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <MapPin className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-display text-lg text-foreground">Olá, {city}! 🔥</h3>
          <div className="flex items-center gap-2 mt-3 bg-primary/10 border border-primary/20 rounded-xl px-4 py-2.5 w-full">
            <Truck className="h-5 w-5 text-primary shrink-0" />
            <div className="text-left">
              <p className="text-sm font-bold text-primary">Entregamos pra você!</p>
              <p className="text-[11px] text-muted-foreground">Entrega disponível para {city}</p>
            </div>
          </div>
          <button onClick={() => setVisible(false)} className="mt-4 bg-gradient-cta text-primary-foreground px-6 py-2 rounded-xl font-bold text-sm hover:brightness-110 transition-all shadow-cta">
            Ver Carnes 🥩
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationPopup;
