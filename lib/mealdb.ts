interface RawMeal {
  idMeal: string;
  strMeal: string;
  strCategory?: string;
  strArea?: string;
  strInstruction?: string;
  strMealThumb: string;
  strYoutube?: string;
  [key: string]: string | undefined;
}

interface RawSearchResponse {
  meals: RawMeal[] | null;
  // when no result found it return null not []
}

//---- Base URL ---------------
//oneplace for the base url
//if it ever changes - updates here only

const BASE = "www.themealdb.com/api/json/v1/1";

//--- TransForm Function-----------------
// converts raw  theMealDB meal => our recipe type
// Private Function - only used inside this file

import type { Recipe } from "@/types";

function transformMeal(raw: RawMeal): Recipe {
  //Extract INgredients and measure
  //the mealDb stores Them as strIngredient!....strINgredients20
  //we loop ad collect non-empty ones

  const ingredients: string[] = [];
  const measures: string[] = [];

  for (let i = 1; i <= 20; i++) {
    const ingredient = raw[`strIngredients${i}`];
    const measure = raw[`strMeasure${i}`];

    if (ingredient && ingredient.trim() !== "") {
      ingredients.push(ingredient.trim());
      measures.push(measure?.trim() ?? "");
    }
  }

  return {
    id: raw.idMeal,
    name: raw.strMeal,
    image: raw.strMealThumb,
    area: raw.strArea ?? "Unknown",
    category: raw.strCategory ?? "Unknown",
    ingredients,
    measures,
    instructions: raw.strInstructions ?? "",
    youtubeUrl: raw.strYoutube ?? undefined,
  };
}

// ── SEARCH BY INGREDIENTS ────────────────────────────────
// Takes array of ingredient names
// Returns array of matching recipes
// Used by: recipes/page.tsx

export async function searchByIngredients(
  ingredients: string[],
): Promise<Recipe[]> {
  if (ingredients.length === 0) return [];

  try {
    //sEARCH BY First ingredients
    const response = await fetch(`${BASE}/filter.php?i=${ingredients[0]}`);

    // Check if response is ok (status 200-299)
    // fetch() doesn't throw on 404 — we check manually
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data: RawSearchResponse = await response.json();

    if (!data.meals) return [];

    const fullMeals = await Promise.all(
      data.meals.slice(0, 12).map((meal) => getRecipeById(meal.idMeal)),
    );

    // filter(Boolean) removes any null results
    // (getRecipeById returns null if fetch fails)
    return fullMeals.filter(Boolean) as Recipe[];
  } catch (error) {
    console.error("searchByIngredients failed:", error);
    return [];
    // return empty array on error — never crash the page
  }
}

// ── GET RECIPE BY ID ─────────────────────────────────────
// Takes a meal ID string
// Returns full Recipe or null if not found
// Used by: recipe/[id]/page.tsx AND searchByIngredients above

export async function getRecipeById(id: string): Promise<Recipe | null> {
  try {
    const response = await fetch(`${BASE}/lookup.php?i=${id}`);

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data: RawSearchResponse = await response.json();

    // lookup returns null if ID doesn't exist
    if (!data.meals || data.meals.length === 0) return null;

    // transform raw → our Recipe type
    return transformMeal(data.meals[0]);
  } catch (error) {
    console.error("getRecipeById failed:", error);
    return null;
  }
}
