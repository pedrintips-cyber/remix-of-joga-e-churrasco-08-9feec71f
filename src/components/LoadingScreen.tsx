import { Flame } from "lucide-react";

const LoadingScreen = () => (
  <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center gap-4">
    <Flame className="h-12 w-12 text-primary animate-pulse" />
    <div className="flex items-center gap-1.5 mt-2">
      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
      <div className="w-2 h-2 rounded-full bg-ember animate-bounce" style={{ animationDelay: "150ms" }} />
      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
    </div>
    <p className="font-display text-lg text-muted-foreground tracking-widest">CARREGANDO...</p>
  </div>
);

export default LoadingScreen;
