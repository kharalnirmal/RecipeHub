// components/AIPanel.tsx
// ─────────────────────────────────────────────────────────────
// WHY "use client":
// This component:
//   - Uses useState (React state = client-side)
//   - Uses useEffect/@gsap/react (DOM access = client-side)
//   - Has onClick handlers (events = client-side)
// Any ONE of these forces it to be a Client Component.
// Rule: if it interacts with the user or browser, it's client.
// ─────────────────────────────────────────────────────────────
"use client";

import { useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { AIRecipeSuggestion } from "@/types";

// ─────────────────────────────────────────────────────────────
// PROPS INTERFACE
// This component receives the selected ingredients from parent.
// The parent (page.tsx) owns the selected state — AIPanel
// just reads it and uses it to call the API.
// Why? Because the ingredient grid also needs selected state.
// State lives at the common ancestor. This is "lifting state up."
// ─────────────────────────────────────────────────────────────
interface AIPanelProps {
  selectedIngredients: string[];
  // Array of ingredient NAMES (not IDs), because that's what
  // we send to OpenAI — human-readable names in the prompt.
}

// ─────────────────────────────────────────────────────────────
// CLOCK ICON — inline SVG, no library needed for simple icons
// ─────────────────────────────────────────────────────────────
function ClockIcon() {
  return (
    <svg
      className="w-3 h-3"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

export default function AIPanel({ selectedIngredients }: AIPanelProps) {
  // ─── STATE ────────────────────────────────────────────────
  const [suggestions, setSuggestions] = useState<AIRecipeSuggestion[]>([]);
  // Starts empty. Fills when AI responds.
  // Type: array of AIRecipeSuggestion (our interface from types/index.ts)

  const [loading, setLoading] = useState(false);
  // true while waiting for the API response.
  // Used to show skeleton loaders.

  const [error, setError] = useState<string | null>(null);
  // null = no error. String = error message to display.
  // Pattern: null means "OK", string means "something went wrong"

  // ─── REFS ─────────────────────────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null);
  // useRef for GSAP. We need to target the cards container.
  // Why not useState? Because changing a ref doesn't re-render.
  // GSAP animates DOM elements directly — no React re-render needed.

  // ─── GSAP ANIMATION ───────────────────────────────────────
  useGSAP(
    () => {
      // This runs when `suggestions` changes (because it's in the
      // dependency array below — useGSAP works like useEffect).

      if (suggestions.length === 0) return;
      // No suggestions yet? Nothing to animate.

      // Animate each suggestion card in with a stagger
      gsap.fromTo(
        ".suggestion-card",
        // Target: all elements with class "suggestion-card"
        // GSAP can target CSS selectors, just like querySelector

        { opacity: 0, y: 30, scale: 0.95 },
        // FROM: invisible, 30px below, slightly smaller

        {
          opacity: 1,
          y: 0,
          scale: 1,
          // TO: visible, in position, full size

          duration: 0.5,
          stagger: 0.15,
          // stagger: each card starts animating 0.15s after the previous.
          // Without stagger: all 3 cards animate simultaneously.
          // With stagger: card 1 at 0s, card 2 at 0.15s, card 3 at 0.3s.
          // This "cascade" effect looks much more polished.

          ease: "back.out(1.2)",
          // back.out: overshoots slightly then settles.
          // The "1.2" controls how much it overshoots.
          // Try power2.out for smoother, elastic.out for bouncy.
        },
      );
    },
    { scope: containerRef, dependencies: [suggestions] },
  );
  // scope: only animate elements INSIDE containerRef.
  // This prevents accidentally animating other .suggestion-card
  // elements elsewhere on the page.
  // dependencies: re-run when suggestions changes.

  // ─── API CALL FUNCTION ────────────────────────────────────
  const getSuggestions = async () => {
    // BEGINNER MISTAKE: Calling this directly with fetch in onClick.
    // Better: extract it as a named async function.
    // Why? Easier to read, easier to test, can be called from
    // multiple places if needed.

    if (selectedIngredients.length === 0) return;
    // Guard: don't call API with empty ingredients.
    // The button is disabled too, but defensive programming.

    setLoading(true); // Show skeletons
    setError(null); // Clear any previous error
    setSuggestions([]); // Clear previous suggestions

    try {
      const response = await fetch("/api/suggest", {
        method: "POST",
        // POST because we're sending data in the body

        headers: {
          "Content-Type": "application/json",
          // CRITICAL: Without this header, the server doesn't know
          // the body is JSON. It might treat it as plain text.
          // Always set this header when sending JSON.
        },

        body: JSON.stringify({ ingredients: selectedIngredients }),
        // JSON.stringify converts our JS object to a JSON string.
        // { ingredients: ["eggs", "milk"] } → '{"ingredients":["eggs","milk"]}'
        // fetch() sends strings over the network, not objects.
      });

      // ─── CHECK HTTP STATUS ─────────────────────────────────
      if (!response.ok) {
        // response.ok is true for status 200-299, false for errors.
        // This catches 400, 500, etc.

        const errorData = await response.json();
        // Parse the error response body (our route.ts sends { error: "..." })

        throw new Error(errorData.error || "Something went wrong");
        // Convert to a JS Error so catch block handles it uniformly.
      }

      const data = (await response.json()) as {
        suggestions?: AIRecipeSuggestion[];
      };
      // Parse the success response body.
      // This gives us: { suggestions: [...] }

      setSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);
      // Update state → React re-renders → cards appear → GSAP animates them
    } catch (err) {
      // Catches: network failure, !response.ok throw, JSON parse errors

      const message =
        err instanceof Error ? err.message : "Failed to get suggestions";
      // err could be anything (unknown type in TypeScript).
      // Check if it's an Error object to safely access .message.
      // Fallback to generic message if it's something unexpected.

      setError(message);
    } finally {
      setLoading(false);
      // FINALLY: runs whether try succeeded or catch caught an error.
      // Perfect for cleanup like hiding loading state.
      // Without finally: if error occurs, loading stays true forever.
    }
  };

  // ─── DIFFICULTY BADGE COLOR ───────────────────────────────
  const difficultyColor = (difficulty: AIRecipeSuggestion["difficulty"]) => {
    // AIRecipeSuggestion['difficulty'] = access the type of the
    // 'difficulty' property from the interface. This is a TypeScript
    // "indexed access type." It equals 'easy' | 'medium' | 'hard'.
    // Better than writing it out manually — stays in sync with interface.

    const colors = {
      easy: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
      medium:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
      hard: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
    };
    return colors[difficulty];
    // Object lookup is cleaner than if/else chains for this pattern.
  };

  // ─── RENDER ───────────────────────────────────────────────
  return (
    <div className="space-y-4" ref={containerRef}>
      {/* ── Header + Button ─────────────────────────────── */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-semibold text-xl">AI Suggestions</h2>
          <p className="text-muted-foreground text-sm">
            {/* text-muted-foreground = shadcn CSS variable.
                Automatically adapts to dark/light mode.
                This is WHY shadcn uses CSS variables. */}
            Powered by Gemini
          </p>
        </div>

        <Button
          onClick={getSuggestions}
          disabled={selectedIngredients.length === 0 || loading}
          // Disabled when: no ingredients selected, OR currently loading.
          // Prevents double-clicks and empty API calls.
          className="gap-2"
        >
          {loading ? (
            <>
              {/* Spinner SVG while loading */}
              <svg
                className="w-4 h-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Thinking...
            </>
          ) : (
            <>✨ Ask AI</>
          )}
        </Button>
      </div>

      {/* ── Selected Ingredients Preview ────────────────── */}
      {selectedIngredients.length > 0 && (
        // Conditional render: only show if ingredients selected
        <div className="flex flex-wrap gap-2">
          {selectedIngredients.map((ingredient) => (
            <Badge key={ingredient} variant="secondary">
              {ingredient}
            </Badge>
          ))}
        </div>
      )}

      {/* ── Error State ─────────────────────────────────── */}
      {error && (
        <div className="bg-destructive/10 p-4 border border-destructive/50 rounded-lg">
          {/* border-destructive = shadcn's red color variable.
              Works in dark mode automatically. */}
          <p className="text-destructive text-sm">{error}</p>
          <button
            onClick={getSuggestions}
            className="mt-2 text-destructive text-xs underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* ── Loading State: Skeletons ─────────────────────── */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            // Render 3 skeleton cards while waiting.
            // [1,2,3].map() is just an array to iterate over.
            // The values (1,2,3) are only used as keys.
            <Card key={i} className="p-4">
              <Skeleton className="mb-2 w-2/3 h-5" />
              {/* Skeleton = shadcn animated gray placeholder */}
              <Skeleton className="mb-1 w-full h-4" />
              <Skeleton className="mb-3 w-4/5 h-4" />
              <div className="flex gap-2">
                <Skeleton className="w-16 h-6" />
                <Skeleton className="w-20 h-6" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── Suggestions ─────────────────────────────────── */}
      {!loading && suggestions.length > 0 && (
        <div className="space-y-4">
          {suggestions.map((suggestion, index) => (
            <Card
              key={index}
              // index as key is acceptable here because:
              // 1. The list is static (not reordered/filtered)
              // 2. AI suggestions don't have unique IDs
              // In dynamic lists (todos, products): ALWAYS use unique IDs.

              className="overflow-hidden suggestion-card"
              // "suggestion-card" class = GSAP target selector
              // This is the class useGSAP animates with fromTo()
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-base leading-snug">
                    {suggestion.name}
                  </CardTitle>
                  <Badge className={difficultyColor(suggestion.difficulty)}>
                    {suggestion.difficulty}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Description */}
                <p className="text-muted-foreground text-sm">
                  {suggestion.description}
                </p>

                {/* Cook time */}
                <div className="flex items-center gap-1 text-muted-foreground text-sm">
                  <ClockIcon />
                  <span>{suggestion.cookTime}</span>
                </div>

                {/* Why it works — the AI value-add */}
                <div className="bg-muted/50 p-3 rounded-md">
                  <p className="mb-1 font-medium text-foreground text-xs">
                    💡 Why it works
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {suggestion.whyItWorks}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── Empty State ──────────────────────────────────── */}
      {!loading && suggestions.length === 0 && !error && (
        <div className="py-12 text-muted-foreground text-center">
          <div className="mb-3 text-4xl">🤖</div>
          <p className="text-sm">
            Select ingredients and ask AI for creative recipe ideas
          </p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// REAL DEV THINKING: What would I add in production?
//
// 1. Rate limiting: prevent one user from spamming the API
//    (middleware or an in-memory counter)
//
// 2. Caching: same ingredients → same suggestions → cache for
//    5 minutes instead of calling OpenAI again
//    (Redis, or even Next.js unstable_cache)
//
// 3. Zod validation: validate the AI response shape at runtime,
//    not just with TypeScript casting
//
// 4. Abort controller: if user clicks "Ask AI" again before
//    the first request completes, cancel the first one
//    const controller = new AbortController()
//    fetch(url, { signal: controller.signal })
//
// These are interview-quality talking points.
// ─────────────────────────────────────────────────────────────
