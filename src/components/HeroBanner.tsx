import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Banner {
  id: string;
  image_url: string;
  title: string;
  subtitle: string | null;
  cta_text: string | null;
  cta_link: string | null;
  sort_order: number;
}

const HeroBanner = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);
  const [touchStart, setTouchStart] = useState(0);

  useEffect(() => {
    const fetchBanners = async () => {
      const { data } = await supabase.from("banners").select("*").eq("active", true).order("sort_order");
      if (data && data.length > 0) setBanners(data);
    };
    fetchBanners();
  }, []);

  const next = useCallback(() => setCurrent((c) => (c + 1) % (banners.length || 1)), [banners.length]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + (banners.length || 1)) % (banners.length || 1)), [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [next, banners.length]);

  if (banners.length === 0) return null;

  return (
    <section id="inicio" className="relative w-full h-[200px] md:h-[380px] lg:h-[440px] overflow-hidden mt-12 md:mt-14">
      {banners.map((banner, i) => (
        <div
          key={banner.id}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}
        >
          <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" width={1920} height={1080} loading={i === 0 ? "eager" : "lazy"} />
        </div>
      ))}

      <div
        className="relative z-10 h-full"
        onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
        onTouchEnd={(e) => {
          const d = touchStart - e.changedTouches[0].clientX;
          if (Math.abs(d) > 50) d > 0 ? next() : prev();
        }}
      />

      {banners.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-1 top-1/2 -translate-y-1/2 z-20 bg-background/40 p-1 rounded-full">
            <ChevronLeft className="h-4 w-4 text-foreground" />
          </button>
          <button onClick={next} className="absolute right-1 top-1/2 -translate-y-1/2 z-20 bg-background/40 p-1 rounded-full">
            <ChevronRight className="h-4 w-4 text-foreground" />
          </button>
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-20 flex gap-1">
            {banners.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)} className={`h-1 rounded-full transition-all duration-300 ${i === current ? "bg-primary w-4" : "bg-foreground/25 w-1"}`} />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default HeroBanner;
