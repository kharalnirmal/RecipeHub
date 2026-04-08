// app/loading.tsx
// ─────────────────────────────────────────────────────────────
// WHY: Next.js shows this automatically while a page is loading.
// Specifically: while Server Components are fetching data.
//
// HOW it works:
// Next.js wraps every page in an automatic <Suspense> boundary.
// loading.tsx is the fallback for that boundary.
// You don't import this anywhere — Next.js handles it.
//
// No "use client" needed — this is a Server Component.
// It renders immediately (no data fetching in here).
// ─────────────────────────────────────────────────────────────

import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="mx-auto px-4 py-8 container">
      {/* Page title skeleton */}
      <Skeleton className="mb-2 w-48 h-8" />
      <Skeleton className="mb-8 w-64 h-4" />

      {/* Recipe card grid skeletons */}
      <div className="gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          // Array.from({ length: 6 }) creates [undefined × 6]
          // We don't care about values, just need 6 iterations.
          // Alternative: [1,2,3,4,5,6].map() — same result.
          <Card key={i} className="overflow-hidden">
            <Skeleton className="w-full h-48" />
            <div className="space-y-2 p-4">
              <Skeleton className="w-3/4 h-5" />
              <Skeleton className="w-1/2 h-4" />
              <div className="flex gap-2 pt-1">
                <Skeleton className="w-16 h-6" />
                <Skeleton className="w-20 h-6" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// REAL DEV NOTE:
// Make your loading state LOOK LIKE your actual page.
// Same grid, same card shape, same proportions.
// This is called a "skeleton screen" and it's much better UX
// than a spinner because users can see the page structure
// before the data arrives.
