"use client";
import Fridge from "@/components/Fridge";
import LoadingScreen from "@/components/LoadingScreen";
import { useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(true);
  return (
    <>
      {loading && <LoadingScreen onComplete={() => setLoading(false)} />}
      <main className="flex flex-col justify-center items-center gap-4 p-8 min-h-screen">
        <h1 className="text-gradient text-5xl">What's in your fridge?</h1>
        <p
          style={{
            color: "var(--color-text-secondary)",
            fontSize: "var(--text-lg)",
          }}
        >
          Pick your ingredients. We'll find the recipe.
        </p>
        <div
          className="p-6 card-warm"
          style={{ maxWidth: "300px", width: "100%" }}
        >
          <p style={{ fontFamily: "var(--font-display)" }}>
            This is Fraunces — our display font 🍳
          </p>
          <p style={{ color: "var(--color-text-muted)", marginTop: "8px" }}>
            This is Plus Jakarta Sans — our body font
          </p>
          <Fridge />
        </div>
      </main>
    </>
  );
}
