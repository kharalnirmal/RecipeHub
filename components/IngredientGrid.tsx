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
    <div className="mx-auto container">
      {INGREDIENT_CATEGORIES.map((tab) => {
        const isActiveTab = activeCategory === tab;
        return (
          <Button
            key={tab}
            onClick={() => tabClick(tab)}
            className={clsx(
              "px-4 py-2",
              isActiveTab && "bg-coral text-white",
              !isActiveTab && "bg-surface text-text-muted",
            )}
          >
            {tab}
          </Button>
        );
      })}

      {visibleIngredients.map((value) => {
        const isSelected = selected.includes(value.id);
        return (
          <Button
            onClick={() => onToggle(value.id)}
            variant={"default"}
            className={clsx(
              "px-5 py-2",
              isSelected && "bg-coral text-white",
              !isSelected && "bg-surface text-text-muted",
            )}
            key={value.id}
          >
            {value.name}
            {value.emoji}
          </Button>
        );
      })}

      <Button
        variant={"default"}
        className={clsx("bg-coral w-full text-white")}
        onClick={handleFindRecipes}
      >
        {selected.length === 0
          ? "Select ingredients First"
          : `Find recipes(${selected.length})`}
      </Button>
    </div>
  );
}
