import { useState } from "react";
import { VariantGallery } from "./components/variant-gallery";
import { MainMenu } from "./components/main-menu";
import { LanguageProvider } from "./contexts/LanguageContext";

export default function App() {
  const [view, setView] = useState<"gallery" | "prototype">("prototype");

  return (
    <LanguageProvider>
      <div className="size-full relative">
        <div className="fixed top-4 right-4 z-50 flex gap-2">
          <button 
            onClick={() => setView("gallery")}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
              view === "gallery" 
                ? "bg-white text-black shadow-lg" 
                : "bg-black/80 text-white/70 hover:text-white border border-white/20 backdrop-blur-md"
            }`}
          >
            Gallery
          </button>
          <button 
            onClick={() => setView("prototype")}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
              view === "prototype" 
                ? "bg-white text-black shadow-lg" 
                : "bg-black/80 text-white/70 hover:text-white border border-white/20 backdrop-blur-md"
            }`}
          >
            Prototype
          </button>
        </div>

        {view === "gallery" ? (
          <VariantGallery />
        ) : (
          <MainMenu />
        )}
      </div>
    </LanguageProvider>
  );
}