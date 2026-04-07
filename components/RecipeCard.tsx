"use client";

import Link from "next/link";
import type { Recipe } from "@/types";

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Link href={`/recipe/${recipe.id}`} className="no-underline">
      <div className="overflow-hidden cursor-pointer card-warm">
        {/* Image */}
        <div className="relative w-full" style={{ paddingTop: "60%" }}>
          <img
            src={recipe.image}
            alt={recipe.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex flex-col gap-3 p-4">
          <h3
            className="text-text-primary text-lg"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {recipe.name}
          </h3>

          <div className="flex flex-wrap gap-2">
            <span className="bg-surface-raised text-text-secondary pill">
              🌍 {recipe.area}
            </span>
            <span className="bg-surface-raised text-text-secondary pill">
              🍽️ {recipe.category}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
