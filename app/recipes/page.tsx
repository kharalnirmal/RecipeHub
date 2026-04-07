import { searchByIngredients } from "@/lib/mealdb";
import RecipeCard from "@/components/RecipeCard";
import Link from "next/link";

interface RecipesPageProps {
  searchParams: Promise<{ ingredients?: string }>;
}

export default async function RecipesPage({ searchParams }: RecipesPageProps) {
  const params = await searchParams;
  const ingredientsParam = params.ingredients ?? "";

  const ingredients = ingredientsParam.split(",").filter(Boolean);
  const recipes = await searchByIngredients(ingredients);

  return (
    <main className="bg-background p-8 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 mb-4 text-text-muted text-sm no-underline"
        >
          ← Back to fridge
        </Link>

        <h1
          className="mt-4 text-4xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {recipes.length > 0
            ? `Found ${recipes.length} recipes 🍳`
            : "No recipes found 😅"}
        </h1>

        <p className="mt-2 text-text-muted">Using: {ingredients.join(", ")}</p>
      </div>

      {/* No results */}
      {recipes.length === 0 && (
        <div className="p-12 max-w-sm text-center card-warm">
          <p className="text-5xl">🤷</p>
          <p
            className="mt-4 mb-2 text-xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Nothing found
          </p>
          <p className="text-text-muted">Try different ingredients</p>
          <Link href="/">
            <button
              className="bg-coral mt-6 px-6 py-3 border-none text-white cursor-pointer"
              style={{
                borderRadius: "var(--radius-full)",
                fontFamily: "var(--font-display)",
              }}
            >
              Try again
            </button>
          </Link>
        </div>
      )}

      {/* Recipe grid */}
      {recipes.length > 0 && (
        <div
          className="gap-6 grid"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          }}
        >
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </main>
  );
}
