import { NextRequest, NextResponse } from "next/server";
import openai from "@/lib/openai";
import type { AIRecipeSuggestion } from "@/types";

// ─────────────────────────────────────────────────────────────
// THE SYSTEM PROMPT — This is where prompt engineering lives.
// Read every sentence and understand WHY it's written this way.
// ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a creative chef AI that suggests recipes based on available ingredients.

You must respond with only a valid JSON object. NO Markdown , no BackTicks,NO explanation , no extra text,

{
"suggestions":[
  {
 "name":"Recipe Name",
 "description" : "One to two sentence description of dish ",
 "cookTime":"20 Minutes",
 "difficulty":"easy",
 "whyItWorks":"Explanation of why these ingredients work well together."
   }
]
}
Rules:
- Suggest exactly 3 recipes
- difficulty must be exactly one of: easy, medium, hard
- cookTime should be a string like "20 minutes" or "1 hour"
- whyItWorks should mention the specific ingredients provided
- All recipes must be achievable with ONLY the listed ingredients plus common pantry staples (salt, pepper, oil, water)
- Do not suggest recipes requiring major missing ingredients`;

// ─────────────────────────────────────────────────────────────
// WHY IS THE SYSTEM PROMPT A CONSTANT OUTSIDE THE FUNCTION?
// It's the same every time — no reason to recreate it on
// each request. Small optimization, but also cleaner code.
// Real devs keep prompts in constants or separate files so
// they're easy to find and update.
// ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  //------------ step - 1 : Parse the incoming request body -----------
  let ingredients: string[];

  try {
    const body = await request.json();
    ingredients = body.ingredients;

    if (
      !ingredients ||
      !Array.isArray(ingredients) ||
      ingredients.length === 0
    ) {
      //defensive program : Never trust  what the browser sends
      //what is soeone  sedn : {} or {ingredients:"eggs"} or {}?
      //we check that ingredients exists is an arraY ADN ISNT EMPTY

      return NextResponse.json(
        { error: "ingredients must be non-empty array" },
        { status: 400 },
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  // --------- step-2 : call openai -------------------

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      // Low temperature = consistent JSON structure.
      // Higher temperature = more creative recipes but riskier JSON.
      // We prioritize reliability over creativity here.
      response_format: { type: "json_object" },
      // JSON MODE — This is crucial.
      // This tells OpenAI to GUARANTEE valid JSON in the response.
      // Without this, even with prompt instructions, you can get
      // malformed JSON occasionally (especially under load).
      // With this: the response will ALWAYS be parseable.
      // Note: Only works with gpt-4o-mini and gpt-4o.
      max_tokens: 1000,
      // Maximum tokens in the RESPONSE (not counting input).
      // 3 recipe suggestions ≈ 300-500 tokens. 1000 is safe buffer.
      // Setting this prevents runaway costs if something goes wrong.

      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
          // System prompt sets the AI's "personality" and rules.
          // It's sent EVERY request — the model has no memory
          // between calls. Each call starts fresh.
        },
        {
          role: "user",
          content: `I have these ingredients: ${ingredients.join(",")}.Suggest 3 creative recipes I can make.`,
          // Template literal builds the user message dynamically.
          // ["eggs", "milk", "cheese"].join(', ') → "eggs, milk, cheese"
          //
          // REAL DEV THINKING: Should you list ingredients as
          // a numbered list or comma-separated?
          // Either works. Comma-separated is shorter (fewer tokens).
        },
      ],
    });

    //---- Step-3 : eXTRACT THE RESPOSNE TEXT   ----------------
    const content = completion.choices[0]?.message?.content;
    // completion.choices is an array because OpenAI can return
    // multiple completions (n parameter). We always want choices[0].
    //
    // Optional chaining (?.) because theoretically choices could
    // be empty (rare, but defensive coding). If any step is null,
    // the whole expression returns undefined instead of throwing.
    if (!content) {
      // This shouldn't happen with json_object mode, but always check
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 500 },
        // 500 = Internal Server Error (our server had a problem)
      );
    }

    // ─── STEP 4: Parse the JSON response ────────────────────

    const parsed = JSON.parse(content) as { suggestions: AIRecipeSuggestion };
    // content is a STRING (OpenAI returns text, even in JSON mode)
    // JSON.parse() converts the string to a JavaScript object.
    //
    // "as { suggestions: AIRecipeSuggestion[] }" is TYPE CASTING.
    // WARNING: This doesn't validate the data at runtime.
    // It just tells TypeScript "trust me, this is the shape."
    //
    // In production, you'd use a validation library (Zod) to
    // actually verify the shape. For a portfolio project,
    // our prompt is strict enough that this is acceptable.

    // ─── STEP 5: Return the response to the browser ─────────
    return NextResponse.json({
      suggestions: parsed.suggestions,
      // Send just the array of suggestions.
      // The browser's fetch call will receive this.
    });
  } catch (error) {
    // This catches OpenAI API errors:
    //   - Network failure
    //   - API key invalid/expired
    //   - Rate limit exceeded
    //   - OpenAI servers down
    //   - JSON.parse failure (malformed response)

    console.error("OpenAI API error:", error);
    // console.error goes to your Vercel function logs.
    // Never expose the raw error to the client (could leak internals).

    return NextResponse.json(
      { error: "Failed to generate suggestions. Please try again." },
      { status: 500 },
    );
    // User-friendly message. The real error is in logs.
  }
}
