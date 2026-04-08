"use client";

import IngredientGrid from "@/components/IngredientGrid";
import { useEffect, useState, useRef } from "react";
import LoadingScreen from "@/components/LoadingScreen";
import dynamic from "next/dynamic";
import Image from "next/image";
import AIPanel from "@/components/AIPanel";
import { getIngredientById } from "@/lib/ingredients";
import type { FridgeHandle } from "@/components/Fridge";

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
  const [showAiPanel, setShowAiPanel] = useState(false);
  const fridgeRef = useRef<FridgeHandle>(null);
  const categoryLegend = [
    { label: "Protein", color: "var(--color-coral)" },
    { label: "Vegetable", color: "var(--color-mint)" },
    { label: "Dairy", color: "#f6efe2" },
    { label: "Spice", color: "var(--color-amber)" },
    { label: "Grain", color: "var(--color-peach)" },
  ];

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
    const wasSelected = selected.includes(id);
    setSelected((prev) =>
      wasSelected ? prev.filter((i) => i !== id) : [...prev, id],
    );

    // Open fridge door when selecting new items
    if (!wasSelected && fridgeRef.current) {
      fridgeRef.current.openDoor();
    }
  }

  const selectedIngredientNames = selected
    .map((id) => getIngredientById(id)?.name)
    .filter((name): name is string => Boolean(name));

  if (loading === null) {
    return null;
  }

  return loading ? (
    <LoadingScreen onComplete={handleLoadingComplete} />
  ) : (
    <main className="relative bg-background min-h-screen overflow-hidden">
      <div
        className="-top-24 -left-20 absolute rounded-full w-72 h-72 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(255,179,71,0.24) 0%, rgba(255,179,71,0) 70%)",
        }}
      />
      <div
        className="-right-20 bottom-20 absolute rounded-full w-80 h-80 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(107,203,119,0.18) 0%, rgba(107,203,119,0) 70%)",
        }}
      />

      <div className="relative mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 w-full max-w-[1380px]">
        <header className="relative bg-surface/95 shadow-[0_12px_36px_rgba(45,31,14,0.08)] mb-6 md:mb-8 p-5 md:p-7 border border-border rounded-[26px] overflow-hidden">
          <div
            className="top-0 right-0 absolute w-56 h-56 -translate-y-12 translate-x-12"
            style={{
              background:
                "radial-gradient(circle, rgba(255,107,107,0.15) 0%, rgba(255,107,107,0) 72%)",
            }}
          />

          <p className="font-medium text-text-muted text-xs uppercase tracking-[0.12em]">
            your kitchen, today
          </p>
          <h1 className="mt-2 max-w-3xl text-text-primary text-3xl md:text-5xl leading-tight">
            Cook with what you already have
          </h1>
          <p className="mt-3 max-w-2xl text-text-secondary text-sm md:text-base">
            Open the fridge, pick your ingredients, and jump straight to recipe
            ideas without overthinking dinner.
          </p>

          <div className="mt-4 pt-3 border-border/70 border-t">
            <p className="text-text-muted text-xs">
              {selected.length} ingredient{selected.length === 1 ? "" : "s"}{" "}
              currently selected
            </p>
          </div>
        </header>

        <section className="flex xl:flex-row flex-col xl:items-start gap-5 md:gap-6">
          <div className="w-full xl:w-[57%]">
            <div className="bg-background/95 shadow-[0_10px_24px_rgba(45,31,14,0.06)] p-3 border border-border rounded-[24px]">
              <div className="flex sm:flex-row flex-col justify-between sm:items-center gap-3 mb-3 px-1">
                <div>
                  <p className="font-medium text-text-secondary text-sm">
                    Live fridge view
                  </p>
                  <p className="text-text-muted text-xs">
                    Click fridge door to open and inspect selected items
                  </p>
                </div>
              </div>
              <div className="card-warm">
                <Fridge ref={fridgeRef} selectedIds={selected} />
              </div>
            </div>
          </div>

          <div className="w-full xl:w-[43%]">
            <div className="bg-background/95 shadow-[0_10px_24px_rgba(45,31,14,0.06)] p-3 border border-border rounded-[24px]">
              <IngredientGrid selected={selected} onToggle={handleToggle} />
            </div>
          </div>
        </section>
      </div>

      <div className="right-5 sm:right-7 bottom-5 sm:bottom-7 z-30 fixed">
        <button
          type="button"
          onClick={() => setShowAiPanel(true)}
          aria-label="Open AI features"
          className="group relative flex justify-center items-center rounded-full size-16 overflow-hidden hover:scale-105 active:scale-95 transition-transform duration-200"
          style={{
            background:
              "linear-gradient(135deg, var(--color-coral), var(--color-peach))",
            boxShadow: "0 14px 30px rgba(255, 107, 107, 0.34)",
          }}
        >
          <span className="absolute inset-0 border border-white/35 rounded-full" />
          <Image
            src="/ai.png"
            alt="AI"
            width={32}
            height={32}
            className="z-10 relative"
          />
        </button>
      </div>

      {showAiPanel && (
        <>
          <button
            type="button"
            aria-label="Close AI panel"
            className="z-40 fixed inset-0 bg-black/35"
            onClick={() => setShowAiPanel(false)}
          />

          <div className="right-0 bottom-0 left-0 z-50 fixed mx-auto p-3 w-full max-w-[920px]">
            <div className="bg-background shadow-[0_-12px_30px_rgba(45,31,14,0.14)] p-4 border border-border md:rounded-2xl rounded-t-2xl max-h-[72vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-3">
                <p className="font-medium text-text-secondary text-sm">
                  AI Recipe Assistant
                </p>
                <button
                  type="button"
                  onClick={() => setShowAiPanel(false)}
                  className="bg-surface px-3 py-1 border border-border rounded-lg text-text-secondary text-xs"
                >
                  Close
                </button>
              </div>

              <AIPanel selectedIngredients={selectedIngredientNames} />
            </div>
          </div>
        </>
      )}
    </main>
  );
};

export default page;
