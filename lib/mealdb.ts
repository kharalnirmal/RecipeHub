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

  const ingredient: string[] = [];
  const measures: string[] = [];

  for (let i = 1; i <= 20; i++) {
    const ingredient = raw[`strIngredients${i}`];
    const measure = raw[`strMeasure${i}`];
  }
}
