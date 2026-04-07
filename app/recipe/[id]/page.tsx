import { getRecipeById } from "@/lib/mealdb";
import { Link } from "lucide-react";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}
const RecipeDetailPage = async ({ params }: PageProps) => {
  const { id } = await params;

  const recipe = await getRecipeById(id);

  // Step 3: handle not found
  // notFound() is a Next.js function
  // It renders the nearest not-found.tsx
  // If you don't have one, Next.js shows its default 404
  if (!recipe) notFound();

  return (
    <main className="bg-background min-h-screen">
      {/* Hero image — full width at top */}
      <div className="relative w-full" style={{ height: "40vh" }}>
        <img
          src={recipe.image}
          alt={recipe.name}
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
            href="/recipes"
            className="inline-block mb-4 text-sm no-underline"
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
        className="gap-8 grid mx-auto p-8"
        style={{
          maxWidth: "1100px",
          gridTemplateColumns: "1fr 2fr",
        }}
      >
        {/* LEFT — Ingredients */}
        <div>
          <div className="p-6 card-warm">
            <h2
              className="mb-4 text-2xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Ingredients 🧺
            </h2>

            {/* ingredients and measures are parallel arrays
                ingredients[0] pairs with measures[0]
                same index = same ingredient */}
            <ul className="flex flex-col gap-3">
              {recipe.ingredients.map((ingredient, index) => (
                <li
                  key={ingredient}
                  className="flex justify-between items-center py-2"
                  style={{ borderBottom: "1px solid var(--color-border)" }}
                >
                  <span
                    className="font-medium"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {ingredient}
                  </span>
                  <span
                    className="text-sm"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {recipe.measures[index]}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* RIGHT — Instructions + YouTube */}
        <div className="flex flex-col gap-6">
          {/* Instructions */}
          <div className="p-6 card-warm">
            <h2
              className="mb-4 text-2xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Instructions 👨‍🍳
            </h2>

            {/* Split instructions by newline into steps
                filter(Boolean) removes empty lines
                Some instructions have \r\n or just \n */}
            {recipe.instructions
              .split(/\r?\n/)
              .filter(Boolean)
              .map((step, index) => (
                <div key={index} className="flex gap-4 mb-4">
                  {/* Step number */}
                  <span
                    className="flex flex-shrink-0 justify-center items-center rounded-full w-8 h-8 font-medium text-white text-sm"
                    style={{ background: "var(--color-coral)" }}
                  >
                    {index + 1}
                  </span>
                  <p style={{ color: "var(--color-text-secondary)" }}>{step}</p>
                </div>
              ))}
          </div>

          {/* YouTube — only shows if recipe has a video */}
          {/* This is called conditional rendering */}
          {recipe.youtubeUrl && (
            <div className="p-6 card-warm">
              <h2
                className="mb-4 text-2xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Watch It Being Made 🎬
              </h2>

              {/* Convert YouTube watch URL to embed URL
                  youtube.com/watch?v=ABC → youtube.com/embed/ABC
                  Browsers need embed format for iframes */}
              <div
                className="relative rounded-lg w-full overflow-hidden"
                style={{ paddingTop: "56.25%" }}
                // 56.25% = 16:9 aspect ratio
                // padding-top trick: makes div maintain ratio
                // as width changes (responsive video)
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
        </div>
      </div>
    </main>
  );
};

export default RecipeDetailPage;
