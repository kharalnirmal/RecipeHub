import { getRecipeById } from "@/lib/mealdb";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}
const RecipeDetailPage = async ({ params, searchParams }: PageProps) => {
  const { id } = await params;
  const { from } = await searchParams;

  const recipe = await getRecipeById(id);
  const safeBackHref = from?.startsWith("/") ? from : "/recipes";

  // Step 3: handle not found
  // notFound() is a Next.js function
  // It renders the nearest not-found.tsx
  // If you don't have one, Next.js shows its default 404
  if (!recipe) notFound();

  return (
    <main className="bg-background min-h-screen">
      {/* Hero image — full width at top */}
      <div className="relative w-full" style={{ height: "40vh" }}>
        <Image
          src={recipe.image}
          alt={recipe.name}
          width={1000}
          height={1000}
          className="w-full h-full object-cover"
        />
        {/* Dark gradient over image so text is readable */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.7))",
          }}
        />

        {/* Recipe name on top of image */}
        <div className="bottom-0 left-0 absolute p-8">
          <Link
            href={safeBackHref}
            className="inline-block bg-coral-light mb-4 px-5 py-3 rounded-xl text-sm no-underline"
            style={{ color: "rgba(255,255,255,0.7)" }}
          >
            ← Back to recipes
          </Link>
          <h1
            className="text-white text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {recipe.name}
          </h1>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="bg-coral text-white pill">🌍 {recipe.area}</span>
            <span className="bg-coral text-white pill">
              🍽️ {recipe.category}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        className="gap-6 lg:gap-8 grid grid-cols-1 lg:grid-cols-2 mx-auto p-4 sm:p-8"
        style={{ maxWidth: "1180px" }}
      >
        {/* LEFT — Video + Ingredients */}
        <div className="flex flex-col gap-6 h-full">
          {recipe.youtubeUrl && (
            <div className="p-5 sm:p-6 h-full card-warm">
              <h2
                className="mb-4 text-2xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Watch It Being Made 🎬
              </h2>

              <div
                className="relative rounded-lg w-full overflow-hidden"
                style={{ paddingTop: "56.25%" }}
              >
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={recipe.youtubeUrl.replace("watch?v=", "embed/")}
                  title={recipe.name}
                  allowFullScreen
                />
              </div>
            </div>
          )}

          <div className="p-5 sm:p-6 h-full card-warm">
            <h2
              className="mb-4 text-2xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Ingredients 🧺
            </h2>

            {/* ingredients and measures are parallel arrays
                ingredients[0] pairs with measures[0]
                same index = same ingredient */}
            <ul className="flex flex-wrap gap-3">
              {recipe.ingredients.map((ingredient, index) => (
                <li
                  key={ingredient}
                  className="inline-flex items-center gap-2 px-4 py-2"
                  style={{
                    background: "var(--color-surface-raised)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <span className="font-medium text-text-primary">
                    {ingredient}
                  </span>
                  {recipe.measures[index] && (
                    <span className="text-text-muted text-sm whitespace-nowrap">
                      ({recipe.measures[index]})
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* RIGHT — Instructions */}
        <div className="p-5 sm:p-6 h-full min-h-130 card-warm">
          <h2
            className="mb-4 text-2xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Instructions 👨‍🍳
          </h2>

          {/* Split instructions by newline into steps
              filter(Boolean) removes empty lines
              Some instructions have \r\n or just \n */}
          <div className="space-y-4">
            {recipe.instructions
              .split(/\r?\n/)
              .filter(Boolean)
              .map((step, index) => (
                <div key={index} className="flex gap-4">
                  {/* Step number */}
                  <span
                    className="flex justify-center items-center rounded-full w-8 h-8 font-medium text-white text-sm shrink-0"
                    style={{ background: "var(--color-coral)" }}
                  >
                    {index + 1}
                  </span>
                  <p style={{ color: "var(--color-text-secondary)" }}>{step}</p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default RecipeDetailPage;
