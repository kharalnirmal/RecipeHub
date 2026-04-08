// app/not-found.tsx
// ─────────────────────────────────────────────────────────────
// WHY: Shown when notFound() is called or a route doesn't exist.
// In Next.js App Router, you call notFound() from a Server
// Component to trigger this page:
//
//   import { notFound } from 'next/navigation'
//   const recipe = await getRecipeById(id)
//   if (!recipe) notFound()  ← triggers this file
//
// Also shown automatically for URLs that don't match any route.
// ─────────────────────────────────────────────────────────────

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="space-y-4 p-6 max-w-md text-center">
        <div className="text-8xl">🥺</div>
        <h1 className="font-bold text-4xl">404</h1>
        <h2 className="font-semibold text-xl">Recipe not found</h2>
        <p className="text-muted-foreground text-sm">
          That recipe might have been removed or the link is incorrect.
        </p>
        <Button asChild>
          <Link href="/">← Back to Fridge</Link>
        </Button>
        {/* asChild: shadcn Button renders the Link as the button element.
            Without asChild: you'd get a <button> wrapping an <a>.
            That's invalid HTML. asChild merges them correctly. */}
      </div>
    </div>
  );
}
