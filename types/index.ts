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
