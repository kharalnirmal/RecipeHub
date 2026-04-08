// app/api/suggest/route.ts
import { NextRequest, NextResponse } from "next/server";
import { geminiModel } from "@/lib/gemini";
import type { AIRecipeSuggestion } from "@/types";

const SYSTEM_PROMPT = `You are a practical chef assistant.

You MUST respond with ONLY a valid JSON object. No markdown. No backticks. No explanation. No extra text before or after.

The JSON must match this exact structure:
{
  "suggestions": [
    {
      "name": "Recipe Name",
      "description": "One to two sentence description.",
      "cookTime": "20 minutes",
      "difficulty": "easy",
      "whyItWorks": "Why these ingredients work well together."
    }
  ]
}

Rules:
- Suggest exactly 3 recipes
- difficulty must be exactly: easy, medium, or hard
- cookTime must be a string like "20 minutes"
- All recipes must use ONLY the listed ingredients plus basic pantry staples
- Keep names realistic and avoid invented ingredients
- Return ONLY the JSON object, nothing else`;

function extractJsonObject(raw: string): string {
  const cleaned = raw
    .replace(/```json\n?/gi, "")
    .replace(/```\n?/g, "")
    .trim();

  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");

  if (first === -1 || last === -1 || last <= first) {
    throw new Error("No JSON object found in model response");
  }

  return cleaned.slice(first, last + 1);
}

function normalizeSuggestions(input: unknown): AIRecipeSuggestion[] {
  if (!Array.isArray(input)) return [];

  const validDifficulty = new Set(["easy", "medium", "hard"]);

  return input
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const obj = item as Record<string, unknown>;

      const difficulty = String(obj.difficulty ?? "").toLowerCase();
      if (!validDifficulty.has(difficulty)) return null;

      const name = String(obj.name ?? "").trim();
      const description = String(obj.description ?? "").trim();
      const cookTimeRaw = String(obj.cookTime ?? "").trim();
      const whyItWorks = String(obj.whyItWorks ?? "").trim();

      if (!name || !description || !whyItWorks) return null;

      const cookTime = /minute/i.test(cookTimeRaw)
        ? cookTimeRaw
        : `${cookTimeRaw || "20"} minutes`;

      return {
        name,
        description,
        cookTime,
        difficulty: difficulty as AIRecipeSuggestion["difficulty"],
        whyItWorks,
      };
    })
    .filter((item): item is AIRecipeSuggestion => item !== null)
    .slice(0, 3);
}

function buildFallbackSuggestions(ingredients: string[]): AIRecipeSuggestion[] {
  const top = ingredients.slice(0, 4);
  const lead = top[0] ?? "ingredients";
  const second = top[1] ?? "pantry staples";
  const third = top[2] ?? "herbs";

  const templates: AIRecipeSuggestion[] = [
    {
      name: `${lead} Skillet Toss`,
      description:
        "A quick one-pan meal that focuses on your selected ingredients with pantry spices.",
      cookTime: "20 minutes",
      difficulty: "easy",
      whyItWorks: `${lead} and ${second} create a balanced base with good texture and flavor.`,
    },
    {
      name: `Savory ${lead} Bowl`,
      description:
        "A warm, layered bowl-style recipe that combines protein, vegetables, and simple seasoning.",
      cookTime: "25 minutes",
      difficulty: "easy",
      whyItWorks: `Using ${lead}, ${second}, and ${third} gives a complete and comforting combination.`,
    },
    {
      name: `${lead} & ${second} Stir-Fry`,
      description:
        "A fast stir-fry approach that keeps ingredients fresh and avoids overcooking.",
      cookTime: "18 minutes",
      difficulty: "medium",
      whyItWorks: `${lead} pairs naturally with ${second}, and high heat builds flavor quickly.`,
    },
  ];

  return templates;
}

export async function POST(request: NextRequest) {
  let ingredients: string[];

  try {
    const body = await request.json();
    ingredients = body.ingredients;
    if (
      !ingredients ||
      !Array.isArray(ingredients) ||
      ingredients.length === 0
    ) {
      return NextResponse.json(
        { error: "ingredients must be a non-empty array" },
        { status: 400 },
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  try {
    const normalizedIngredients = ingredients
      .map((i) => String(i).trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 12);

    if (normalizedIngredients.length === 0) {
      return NextResponse.json(
        { error: "No valid ingredients provided" },
        { status: 400 },
      );
    }

    const prompt = `${SYSTEM_PROMPT}\n\nI have these ingredients: ${normalizedIngredients.join(", ")}. Suggest 3 practical recipes.`;
    // Gemini uses a single prompt string, not a messages array like OpenAI.
    // We combine system prompt + user message into one string.

    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    // .text() extracts the string content from Gemini's response object

    const jsonText = extractJsonObject(text);
    const parsed = JSON.parse(jsonText) as { suggestions?: unknown };
    const suggestions = normalizeSuggestions(parsed.suggestions);

    if (suggestions.length === 0) {
      return NextResponse.json({
        suggestions: buildFallbackSuggestions(normalizedIngredients),
        fallback: true,
      });
    }

    if (suggestions.length < 3) {
      const fillers = buildFallbackSuggestions(normalizedIngredients).slice(
        0,
        3 - suggestions.length,
      );
      return NextResponse.json({ suggestions: [...suggestions, ...fillers] });
    }

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Gemini API error:", error);
    const safeIngredients = (ingredients ?? [])
      .map((i) => String(i).trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 12);

    return NextResponse.json({
      suggestions: buildFallbackSuggestions(safeIngredients),
      fallback: true,
    });
  }
}
