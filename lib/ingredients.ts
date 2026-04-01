// ============================================================
// lib/ingredients.ts
//
// WHY IN lib/ NOT components/?
// This is data, not UI. It doesn't render anything.
// lib/ = logic and data. components/ = visual pieces.
//
// WHY NOT HARDCODE IN THE COMPONENT?
// If you put this array inside IngredientGrid.tsx:
// 1. You can't reuse it elsewhere (AIPanel might need it)
// 2. The component file gets huge and hard to read
// 3. Harder to update ingredients without touching UI code
// Separation of concerns = each file has one job.
// ============================================================

import { Ingredient } from "@/types";

// ============================================================
// EXPORT PATTERN EXPLANATION:
//
// export const INGREDIENTS = [...]
//
// "export" — makes it importable in other files
// "const" — this array never gets reassigned (it's a constant)
// "INGREDIENTS" — ALL_CAPS convention for constant data arrays
//               Real devs use this to signal: "this never changes"
// ": Ingredient[]" — TypeScript: this is an array of Ingredients
//                    If any object is missing a required field,
//                    TypeScript errors immediately.
// ============================================================

export const INGREDIENTS: Ingredient[] = [
  // ── PROTEINS ──────────────────────────────────────────────
  // Why first? Proteins are usually the main ingredient.
  // User will likely select these first.
  {
    id: "chicken", // id: use kebab-case, lowercase, no spaces
    name: "Chicken", //     Used in API calls and as React key
    emoji: "🍗",
    category: "protein",
  },
  {
    id: "beef",
    name: "Beef",
    emoji: "🥩",
    category: "protein",
  },
  {
    id: "salmon",
    name: "Salmon",
    emoji: "🐟",
    category: "protein",
  },
  {
    id: "eggs",
    name: "Eggs",
    emoji: "🥚",
    category: "protein",
  },
  {
    id: "tofu",
    name: "Tofu",
    emoji: "🫘",
    category: "protein",
  },

  // ── VEGETABLES ────────────────────────────────────────────
  {
    id: "tomato",
    name: "Tomato",
    emoji: "🍅",
    category: "vegetable",
  },
  {
    id: "onion",
    name: "Onion",
    emoji: "🧅",
    category: "vegetable",
  },
  {
    id: "garlic",
    name: "Garlic",
    emoji: "🧄",
    category: "vegetable",
  },
  {
    id: "potato",
    name: "Potato",
    emoji: "🥔",
    category: "vegetable",
  },
  {
    id: "spinach",
    name: "Spinach",
    emoji: "🥬",
    category: "vegetable",
  },
  {
    id: "bell-pepper",
    name: "Bell Pepper",
    emoji: "🫑",
    category: "vegetable",
  },
  {
    id: "carrot",
    name: "Carrot",
    emoji: "🥕",
    category: "vegetable",
  },

  // ── DAIRY ─────────────────────────────────────────────────
  {
    id: "cheese",
    name: "Cheese",
    emoji: "🧀",
    category: "dairy",
  },
  {
    id: "butter",
    name: "Butter",
    emoji: "🧈",
    category: "dairy",
  },
  {
    id: "milk",
    name: "Milk",
    emoji: "🥛",
    category: "dairy",
  },
  {
    id: "cream",
    name: "Heavy Cream",
    emoji: "🫙",
    category: "dairy",
  },
  {
    id: "yogurt",
    name: "Yogurt",
    emoji: "🍶",
    category: "dairy",
  },

  // ── SPICES ────────────────────────────────────────────────
  {
    id: "cumin",
    name: "Cumin",
    emoji: "🌿",
    category: "spice",
  },
  {
    id: "chili",
    name: "Chili",
    emoji: "🌶️",
    category: "spice",
  },
  {
    id: "turmeric",
    name: "Turmeric",
    emoji: "🟡",
    category: "spice",
  },
  {
    id: "ginger",
    name: "Ginger",
    emoji: "🫚",
    category: "spice",
  },

  // ── GRAINS ────────────────────────────────────────────────
  {
    id: "rice",
    name: "Rice",
    emoji: "🍚",
    category: "grain",
  },
  {
    id: "pasta",
    name: "Pasta",
    emoji: "🍝",
    category: "grain",
  },
  {
    id: "bread",
    name: "Bread",
    emoji: "🍞",
    category: "grain",
  },
];

// ============================================================
// HELPER: Get ingredients by category
//
// WHY EXPORT THIS TOO?
// IngredientGrid needs to display ingredients grouped by category.
// Instead of filtering in the component (mixing logic with UI),
// we provide a helper here.
//
// Real dev pattern: data file provides both the data AND
// the utility functions to work with that data.
// ============================================================

export function getIngredientsByCategory(
  category: Ingredient["category"],
): Ingredient[] {
  return INGREDIENTS.filter((ingredient) => ingredient.category === category);
}

// ============================================================
// HELPER: Get ingredient by ID
//
// WHY: When user selects by ID, we often need the full object.
// This pattern (find by ID) appears in EVERY real project.
// ============================================================

export function getIngredientById(id: string): Ingredient | undefined {
  // .find() returns the first match or undefined if not found
  // That's why return type is "Ingredient | undefined"
  return INGREDIENTS.find((ingredient) => ingredient.id === id);
}

// ============================================================
// CONSTANT: All unique categories
//
// WHY: IngredientGrid will render category tabs/sections.
// Instead of hardcoding ['protein', 'vegetable', ...] in the
// component, we derive it from the type. This is called
// "deriving constants from types" — if you add a new category
// to the type, you update one place.
// ============================================================

export const INGREDIENT_CATEGORIES: Ingredient["category"][] = [
  "protein",
  "vegetable",
  "dairy",
  "spice",
  "grain",
];
