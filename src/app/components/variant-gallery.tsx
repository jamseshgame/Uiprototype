import { useState } from "react";
import { MainMenu } from "./main-menu";

export function VariantGallery() {
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);

  const variants = [
    { name: "Main Menu", component: <MainMenu />, colors: "from-indigo-950 to-purple-950" },
  ];

  if (selectedVariant !== null) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-8">
        <button
          onClick={() => setSelectedVariant(null)}
          className="mb-6 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
        >
          ← Back
        </button>
        <div className="transform scale-90">
          {variants[selectedVariant].component}
        </div>
        <p className="mt-6 text-white text-xl">{variants[selectedVariant].name}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-black text-white text-center mb-3">VR Results Screen Variants</h1>
        <p className="text-gray-400 text-center mb-12">24 unique color palettes and font styles - Click any variant to view full size</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {variants.map((variant, index) => (
            <div
              key={index}
              onClick={() => setSelectedVariant(index)}
              className="group relative rounded-2xl overflow-hidden border-2 border-gray-800 hover:border-gray-600 transition-all hover:scale-105 cursor-pointer"
            >
              <div className="transform scale-[0.4] origin-top-left w-[320%] h-[320%] pointer-events-none">
                {variant.component}
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/60 backdrop-blur-sm">
                <div className={`h-2 rounded-full bg-gradient-to-r ${variant.colors} mb-2`} />
                <p className="text-white font-black">{variant.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}