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

export default function Loading() {
  return (
    <div className="bg-background min-h-screen">
      {/* Header Section Skeleton */}
      <div className="bg-surface px-4 sm:px-8 py-6 sm:py-8 border-border border-b">
        <div className="mx-auto max-w-7xl">
          {/* Back link skeleton */}
          <Skeleton className="mb-6 w-28 h-4" />

          {/* Title and subtitle skeletons */}
          <Skeleton className="mb-3 w-64 h-8 sm:h-10" />
          <Skeleton className="w-80 h-5" />
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-8 py-8">
        <div className="mx-auto max-w-7xl">
          {/* Filter Controls Skeleton */}
          <div className="gap-4 grid grid-cols-1 sm:grid-cols-3 mb-8">
            <div>
              <Skeleton className="mb-2 w-16 h-4" />
              <Skeleton className="w-full h-10" />
            </div>
            <div>
              <Skeleton className="mb-2 w-20 h-4" />
              <Skeleton className="w-full h-10" />
            </div>
            <div>
              <Skeleton className="w-32 h-10" />
            </div>
          </div>

          {/* Recipe card grid skeletons */}
          <div
            className="gap-4 sm:gap-6 grid"
            style={{
              gridTemplateColumns:
                "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
            }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col overflow-hidden"
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-lg)",
                }}
              >
                {/* Image skeleton */}
                <Skeleton className="w-full h-48" />

                {/* Content skeleton */}
                <div className="flex flex-col flex-1 gap-3 p-4">
                  {/* Title skeleton */}
                  <Skeleton className="w-3/4 h-5" />

                  {/* Badges skeleton */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Skeleton className="w-20 h-7" />
                    <Skeleton className="w-24 h-7" />
                  </div>

                  {/* Matched ingredients skeleton */}
                  <div className="mt-auto pt-2 border-border border-t">
                    <Skeleton className="mb-2 w-16 h-3" />
                    <div className="flex flex-wrap gap-1">
                      <Skeleton className="w-20 h-6" />
                      <Skeleton className="w-16 h-6" />
                      <Skeleton className="w-14 h-6" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
// This is called a "skeleton screen" and it's much better UX
// than a spinner because users can see the page structure
// before the data arrives.
