import { searchByIngredients } from "@/lib/mealdb";
import RecipeCard from "@/components/RecipeCard";
import Link from "next/link";
import { Metadata } from "next";

// ── Page-specific metadata ─────────────────────────────────
export const metadata: Metadata = {
  title: "Recipe Results",
  description: "Recipes found based on your ingredients.",
};

interface RecipesPageProps {
  searchParams: Promise<{
    ingredients?: string;
  }>;
}

export default async function RecipesPage({ searchParams }: RecipesPageProps) {
  const params = await searchParams;
  const ingredientsParam = params.ingredients ?? "";

  const ingredients = ingredientsParam.split(",").filter(Boolean);
  const recipes = await searchByIngredients(ingredients);
  const backHref = ingredientsParam
    ? `/recipes?ingredients=${ingredientsParam}`
    : "/";

  return (
    <main className="bg-background min-h-screen">
      {/* Header Section */}
      <div className="bg-surface px-4 sm:px-8 py-6 sm:py-8 border-border border-b">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-white/80 shadow-sm hover:shadow-md mb-6 px-4 py-2 border border-border hover:border-coral rounded-full focus:outline-none focus:ring-2 focus:ring-coral focus:ring-offset-2 font-medium text-text-secondary hover:text-coral text-sm no-underline transition-all hover:-translate-y-0.5 duration-200"
          >
            <span aria-hidden="true">←</span>
            <span>Back to home</span>
          </Link>

          <div>
            <h1
              className="mb-2 text-text-primary text-3xl sm:text-4xl md:text-5xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {recipes.length > 0
                ? `${recipes.length} Recipe${recipes.length !== 1 ? "s" : ""} Found`
                : "No recipes found"}
            </h1>
            <p className="text-text-muted text-sm sm:text-base">
              Using:{" "}
              <span className="font-medium text-text-secondary">
                {ingredients.join(", ")}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-8 py-8">
        <div className="mx-auto max-w-7xl">
          {/* No results state */}
          {recipes.length === 0 ? (
            <div className="flex flex-col justify-center items-center py-12 sm:py-20">
              <div
                className="p-8 sm:p-12 rounded-2xl w-full max-w-md text-center"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-surface) 0%, var(--color-surface-raised) 100%)",
                  border: "2px solid var(--color-border)",
                }}
              >
                <p className="mb-4 text-5xl sm:text-6xl">🤷</p>
                <h2
                  className="mb-3 text-text-primary text-xl sm:text-2xl"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  No recipes match
                </h2>
                <p className="mb-8 text-text-muted text-sm sm:text-base">
                  Try searching with different ingredients. The more ingredients
                  you add, the more options you'll find!
                </p>
                <Link href="/" className="no-underline">
                  <button
                    className="bg-coral hover:bg-coral-dark px-6 py-3 border-none w-full font-medium text-white text-sm sm:text-base transition-colors cursor-pointer"
                    style={{
                      borderRadius: "var(--radius-full)",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    Try different ingredients
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Recipe grid */}
              <div
                className="gap-4 sm:gap-6 grid"
                role="list"
                style={{
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
                }}
              >
                {recipes.map((recipe) => (
                  <div key={recipe.id} role="listitem">
                    <RecipeCard
                      recipe={recipe}
                      matchedIngredients={ingredients}
                      backHref={backHref}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
