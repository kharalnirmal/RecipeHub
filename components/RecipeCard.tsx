"use client";

import Link from "next/link";
import type { Recipe } from "@/types";

interface RecipeCardProps {
  recipe: Recipe;
  matchedIngredients?: string[];
  backHref?: string;
}

export default function RecipeCard({
  recipe,
  matchedIngredients = [],
  backHref,
}: RecipeCardProps) {
  // Find which ingredients in the recipe match the search ingredients
  const matched = matchedIngredients
    .map((searchIng) =>
      recipe.ingredients.find(
        (recipeIng) => recipeIng.toLowerCase() === searchIng.toLowerCase(),
      ),
    )
    .filter(Boolean) as string[];

  const matchPercentage =
    matchedIngredients.length > 0
      ? Math.round((matched.length / matchedIngredients.length) * 100)
      : 0;

  const detailHref = backHref
    ? {
        pathname: `/recipe/${recipe.id}`,
        query: { from: backHref },
      }
    : `/recipe/${recipe.id}`;

  return (
    <Link href={detailHref} className="no-underline">
      <article
        className="flex flex-col hover:shadow-lg active:shadow-md h-full overflow-hidden transition-all duration-200 cursor-pointer"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
        }}
      >
        {/* Image container */}
        <div
          className="relative bg-surface-raised w-full"
          style={{ paddingTop: "60%" }}
        >
          <img
            src={recipe.image}
            alt={recipe.name}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />

          {/* Match Badge */}
          {matchPercentage > 0 && (
            <div
              className="top-3 right-3 absolute backdrop-blur-sm px-3 py-1 rounded-full font-bold text-white text-xs"
              style={{
                backgroundColor:
                  matchPercentage === 100
                    ? "var(--color-mint)"
                    : "var(--color-amber)",
              }}
            >
              {matchPercentage}% match
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 gap-3 p-4">
          {/* Title */}
          <h3
            className="font-semibold text-text-primary text-base sm:text-lg line-clamp-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {recipe.name}
          </h3>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <span
              className="px-3 py-1.5 text-text-secondary text-xs"
              style={{
                backgroundColor: "var(--color-surface-raised)",
                borderRadius: "var(--radius-full)",
              }}
            >
              🌍 {recipe.area}
            </span>
            <span
              className="px-3 py-1.5 text-text-secondary text-xs"
              style={{
                backgroundColor: "var(--color-surface-raised)",
                borderRadius: "var(--radius-full)",
              }}
            >
              🍽️ {recipe.category}
            </span>
          </div>

          {/* Matched ingredients */}
          {matched.length > 0 && (
            <div className="mt-auto pt-2 border-border border-t">
              <p className="mb-2 font-medium text-text-secondary text-xs">
                ✓ Matched:
              </p>
              <div className="flex flex-wrap gap-1">
                {matched.slice(0, 3).map((ingredient, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 rounded text-white text-xs"
                    style={{
                      backgroundColor: "var(--color-mint-dark)",
                    }}
                  >
                    {ingredient}
                  </span>
                ))}
                {matched.length > 3 && (
                  <span
                    className="px-2 py-1 rounded text-white text-xs"
                    style={{
                      backgroundColor: "var(--color-text-muted)",
                    }}
                  >
                    +{matched.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
