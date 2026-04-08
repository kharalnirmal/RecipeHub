// app/api/suggest/route.ts
import { NextRequest, NextResponse } from "next/server";
import { geminiModel } from "@/lib/gemini";
import type { AIRecipeSuggestion } from "@/types";

const SYSTEM_PROMPT = `You are a creative chef AI that suggests recipes based on available ingredients.

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
- Return ONLY the JSON object, nothing else`;

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
    const prompt = `${SYSTEM_PROMPT}\n\nI have these ingredients: ${ingredients.join(", ")}. Suggest 3 creative recipes.`;
    // Gemini uses a single prompt string, not a messages array like OpenAI.
    // We combine system prompt + user message into one string.

    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    // .text() extracts the string content from Gemini's response object

    // Clean the response — Gemini sometimes adds ```json ``` even when told not to
    const cleaned = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    // regex replaces: ```json and ``` with empty string
    // .trim() removes leading/trailing whitespace

    const parsed = JSON.parse(cleaned) as { suggestions: AIRecipeSuggestion[] };

    return NextResponse.json({ suggestions: parsed.suggestions });
  } catch (error) {
    console.error("Gemini API error:", error);
    return NextResponse.json(
      { error: "Failed to generate suggestions. Please try again." },
      { status: 500 },
    );
  }
}
