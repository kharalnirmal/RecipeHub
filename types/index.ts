export interface Ingredient {
  id: string;
  name: string;
  emoji: string;
  category: "protein" | "vegetable" | "dairy" | "spice" | "grain";
}

export interface Recipe {
  id: string;
  name: string;
  image: string;
  area: string;
  category: string;
  ingredients: string[];
  measures: string[];
  instructions: string;
  youtubeUrl?: string;
}

export interface AIRecipeSuggestion {
  name: string;
  description: string;
  cookTime: string;
  difficulty: "easy" | "medium" | "hard";
  whyItWorks: string;
}

// ============================================================
// GENERICS IN PRACTICE — ApiResponse<T>
//
// PROBLEM WITHOUT GENERICS:
// You'd write: ApiResponseForRecipes, ApiResponseForIngredients,
// ApiResponseForSuggestions... all identical except the data type.
// That's copy-paste code. Bad.
//
// WITH GENERICS:
// One interface, works for any data type.
// ApiResponse<Recipe[]> — T = Recipe[]
// ApiResponse<AIRecipeSuggestion[]> — T = AIRecipeSuggestion[]
// ApiResponse<Ingredient> — T = Ingredient
//
// T is a placeholder. When you USE the interface, you fill in T.
// ============================================================

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

// ─────────────────────────────────────────────────────────────
// WHY: This interface defines exactly what we expect back from
// our AI. We designed it not OpenAI. We tell the AI to match
// this shape via our prompt.
// ─────────────────────────────────────────────────────────────

export interface AIRecipeSuggestion {
  name: string; // recipe name
  description: string; //1-2 senstence description
  cookTime: string; //e.g :"20 minutes"-string not number bacause Ai might say "20-25 minutes"
  difficulty: "easy" | "medium" | "hard";

  whyItWorks: string; // e.g., "Eggs provide protein while cheese
  // adds fat for satiety" — this is the
  // "AI value add" that MealDB can't give us
}
