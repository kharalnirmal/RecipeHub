// app/error.tsx
// ─────────────────────────────────────────────────────────────
// WHY: Catches runtime errors that happen during rendering.
// Like a try/catch wrapped around your entire page tree.
// If any Server Component throws, this file shows instead.
//
// MUST be "use client" — Next.js requires this.
// Error boundaries in React only work client-side.
// ─────────────────────────────────────────────────────────────
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  // error: the actual Error object that was thrown
  // digest: Next.js's server-generated error ID for logs
  // The & means "Error AND this extra optional property"

  reset: () => void;
  // reset: function provided by Next.js that re-renders
  // the page from scratch. Like a "try again" for React.
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to your error tracking service here.
    // In production: Sentry, LogRocket, Datadog, etc.
    // For now: console is fine.
    console.error("Page error:", error);
  }, [error]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="space-y-4 p-6 max-w-md text-center">
        <div className="text-6xl">🔧</div>
        <h2 className="font-bold text-2xl">Something went wrong</h2>
        <p className="text-muted-foreground text-sm">
          {error.message || "An unexpected error occurred."}
        </p>
        <div className="flex justify-center gap-3">
          <Button onClick={reset} variant="default">
            Try again
          </Button>
          <Button
            onClick={() => (window.location.href = "/")}
            variant="outline"
          >
            Go home
          </Button>
        </div>
      </div>
    </div>
  );
}

// SCOPE: This catches errors in the current segment and below.
// app/error.tsx → catches errors in all pages
// app/recipes/error.tsx → catches errors only in /recipes
// More specific files take priority.
