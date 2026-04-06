import { useEffect } from "react";
import Header from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import KitsSection from "@/components/KitsSection";
import Differentials from "@/components/Differentials";
import DrinksSection from "@/components/DrinksSection";
import UrgencySection from "@/components/UrgencySection";
import CartSidebar from "@/components/CartSidebar";
import Footer from "@/components/Footer";
import LocationPopup from "@/components/LocationPopup";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  // Load Facebook Pixel dynamically from settings
  useEffect(() => {
    const loadPixel = async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "facebook_pixel_id")
        .maybeSingle();

      if (error || !data?.value) return;

      if (data?.value) {
        const script = document.createElement("script");
        script.innerHTML = `
          !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
          n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
          (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
          fbq('init','${data.value}');fbq('track','PageView');
        `;
        document.head.appendChild(script);
      }
    };
    loadPixel();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroBanner />
      <KitsSection />
      <Differentials />
      <DrinksSection />
      <UrgencySection />
      <CartSidebar />
      <Footer />
      <LocationPopup />
    </div>
  );
};

export default Index;
