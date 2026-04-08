"use client";

import IngredientGrid from "@/components/IngredientGrid";
import { useEffect, useState } from "react";
import LoadingScreen from "@/components/LoadingScreen";
import AIPanel from "@/components/AIPanel";
import dynamic from "next/dynamic";

const Fridge = dynamic(() => import("@/components/Fridge"), {
  ssr: false,
  // THREE.JS CANNOT RUN ON THE SERVER.
  // It needs window, document, WebGL — none exist in Node.js.
  // ssr: false = only render this component in the browser.
  // Without this, Next.js tries to server-render it → crash.

  loading: () => (
    <div className="bg-muted rounded-xl w-full h-[400px] animate-pulse" />
    // Show a placeholder while Three.js loads.
    // Without this: blank space until JS downloads.
    // With this: smooth gray placeholder → fridge appears.
  ),
});

const page = () => {
  const [loading, setLoading] = useState<boolean | null>(null);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    const hasSeenLoader =
      window.sessionStorage.getItem("fridgeai-home-loader-seen") === "1";
    setLoading(!hasSeenLoader);
  }, []);

  const handleLoadingComplete = () => {
    window.sessionStorage.setItem("fridgeai-home-loader-seen", "1");
    setLoading(false);
  };

  function handleToggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }

  if (loading === null) {
    return null;
  }

  return loading ? (
    <LoadingScreen onComplete={handleLoadingComplete} />
  ) : (
    <main className="bg-background w-full min-h-screen">
      <section className="gap-6 grid grid-cols-1 xl:grid-cols-12 mx-auto px-4 md:px-6 py-6 md:py-8 w-full max-w-[1400px]">
        <div className="xl:col-span-5">
          <div className="p-3 md:p-4 card-warm">
            <Fridge />
          </div>
        </div>

        <div className="xl:col-span-4">
          <div className="p-4 md:p-5 card-warm">
            <IngredientGrid selected={selected} onToggle={handleToggle} />
          </div>
        </div>

        <div className="xl:col-span-3">
          <div className="p-4 md:p-5 card-warm">
            <AIPanel selectedIngredients={selected} />
          </div>
        </div>
      </section>
    </main>
  );
};

export default page;
