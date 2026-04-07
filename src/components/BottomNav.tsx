import { Beef, Wine, Wrench } from "lucide-react";

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "carnes", label: "Carnes", icon: Beef },
  { id: "bebidas", label: "Bebidas", icon: Wine },
  { id: "personalizado", label: "Monte seu Kit", icon: Wrench },
];

const BottomNav = ({ activeTab, onTabChange }: Props) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-lg border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-14">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className={`h-5 w-5 ${isActive ? "text-primary" : ""}`} />
              <span className={`text-[10px] font-semibold ${isActive ? "text-primary" : ""}`}>{tab.label}</span>
              {isActive && <div className="w-1 h-1 rounded-full bg-primary mt-0.5" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
