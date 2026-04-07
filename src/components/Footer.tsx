import { Flame, Instagram, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Footer = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["site_name", "instagram_url", "whatsapp_number", "footer_text"]);
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((s) => { map[s.key] = s.value || ""; });
        setSettings(map);
      }
    };
    fetchSettings();
  }, []);

  const siteName = settings.site_name || "Churrasco da Torcida";
  const instagram = settings.instagram_url || "#";
  const whatsapp = settings.whatsapp_number || "";

  return (
    <footer className="py-6 border-t border-border/50 pb-20">
      <div className="container">
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Flame className="h-4 w-4 text-primary" />
            <span className="font-display text-sm text-gradient-fire">{siteName.toUpperCase()}</span>
          </div>
          <div className="flex gap-2">
            {instagram && instagram !== "#" && (
              <a href={instagram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary/20 transition-colors">
                <Instagram className="h-4 w-4 text-muted-foreground" />
              </a>
            )}
            {whatsapp && (
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary/20 transition-colors">
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
              </a>
            )}
          </div>
          <p className="text-muted-foreground text-[10px]">
            © 2026 {siteName} — Todos os direitos reservados
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
