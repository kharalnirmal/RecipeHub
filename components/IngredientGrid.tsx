"use client";

import { useState } from "react";
import { INGREDIENTS } from "@/lib/ingredients";
import { Button } from "@/components/ui/button";
import type { Ingredient } from "@/types";
import clsx from "clsx";
import { INGREDIENT_CATEGORIES } from "@/lib/ingredients";
import { useRouter } from "next/navigation";

interface IngredientGridProps {
  selected: string[];
  onToggle: (id: string) => void;
}

export default function IngredientGrid({
  selected,
  onToggle,
}: IngredientGridProps) {
  const [activeCategory, setActiveCategory] = useState("protein");

  const visibleIngredients = INGREDIENTS.filter(
    (ing) => ing.category === activeCategory,
  );

  const selectedInCategory = visibleIngredients.filter((value) =>
    selected.includes(value.id),
  ).length;

  const tabClick = (tab: Ingredient["category"]) => {
    setActiveCategory(tab);
  };

  //for find recipie button

  const router = useRouter();

  const handleFindRecipes = () => {
    if (selected.length === 0) return;
    const params = new URLSearchParams();
    params.set("ingredients", selected.join(","));
    router.push("/recipes?" + params.toString());
  };

  return (
    <div className="space-y-4">
      <div className="animate-fade-in">
        <p className="font-medium text-text-secondary text-xs uppercase tracking-[0.12em]">
          Pick & Mix
        </p>
        <h2 className="mt-2 font-display text-text-primary text-2xl">
          Build your basket
        </h2>
        <p className="mt-1.5 text-text-secondary text-sm">
          Choose what you have, then find matching recipes.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 animate-fade-in [animation-delay:100ms]">
        {INGREDIENT_CATEGORIES.map((tab, idx) => {
          const isActiveTab = activeCategory === tab;
          return (
            <Button
              key={tab}
              onClick={() => tabClick(tab)}
              className={clsx(
                "px-3.5 py-1.5 border rounded-full font-medium text-xs capitalize transition-all duration-300",
                isActiveTab
                  ? "border-coral bg-coral text-white shadow-[0_4px_12px_rgba(255,107,107,0.24)] hover:shadow-[0_6px_16px_rgba(255,107,107,0.32)]"
                  : "border-border bg-background text-text-secondary hover:bg-surface hover:border-border/80 hover:shadow-[0_2px_6px_rgba(45,31,14,0.04)]",
              )}
              style={{
                animationDelay: `${idx * 50}ms`,
              }}
            >
              {tab}
            </Button>
          );
        })}
      </div>

      <div className="bg-surface/60 p-4 border border-border rounded-[18px] transition-all animate-fade-in duration-300 [animation-delay:150ms]">
        <div className="flex justify-between items-center mb-4 pb-3 border-border/40 border-b">
          <p className="font-medium text-text-secondary text-xs uppercase tracking-wide">
            {activeCategory}
          </p>
          <p className="font-medium text-text-muted text-xs">
            <span className="font-semibold text-coral">
              {selectedInCategory}
            </span>{" "}
            selected
          </p>
        </div>

        <div className="gap-2.5 grid grid-cols-2 sm:grid-cols-3 min-h-[320px] sm:min-h-[250px]">
          {visibleIngredients.map((value, idx) => {
            const isSelected = selected.includes(value.id);
            return (
              <button
                onClick={() => onToggle(value.id)}
                className={clsx(
                  "group relative flex flex-col items-start gap-1.5 px-3.5 py-3 border rounded-[14px] text-left transition-all duration-300 ease-out",
                  isSelected
                    ? "border-coral bg-coral/12 shadow-[0_4px_12px_rgba(255,107,107,0.18)] hover:shadow-[0_6px_16px_rgba(255,107,107,0.24)] hover:scale-105"
                    : "border-border bg-background hover:bg-surface hover:border-border/60 hover:shadow-[0_4px_12px_rgba(45,31,14,0.06)]",
                )}
                key={value.id}
                type="button"
                style={{
                  animation: `slideInUp 0.4s ease-out ${idx * 30}ms both`,
                }}
              >
                <span className="inline-block text-lg leading-none group-hover:scale-110 transition-transform duration-300">
                  {value.emoji}
                </span>
                <span
                  className={clsx(
                    "font-medium text-xs leading-snug",
                    isSelected
                      ? "text-coral-dark group-hover:text-coral"
                      : "text-text-secondary group-hover:text-text-primary",
                  )}
                >
                  {value.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <Button
        variant={"default"}
        disabled={selected.length === 0}
        className={clsx(
          "rounded-[14px] w-full h-11 font-medium text-white transition-all duration-300 ease-out",
          selected.length === 0
            ? "bg-text-muted/20 text-text-muted cursor-not-allowed"
            : "bg-coral hover:bg-coral-dark hover:shadow-[0_8px_20px_rgba(255,107,107,0.28)] active:scale-95",
        )}
        onClick={handleFindRecipes}
      >
        {selected.length === 0
          ? "Select ingredients to continue"
          : `Find ${selected.length} ingredient recipe${selected.length > 1 ? "s" : ""}`}
      </Button>

      <p className="text-[11px] text-text-muted text-center leading-relaxed">
        ✨ Tip: mix a protein + vegetable + spice for better recipe matches.
      </p>
    </div>
  );
}
