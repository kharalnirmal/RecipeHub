"use client";

import Fridge from "@/components/Fridge";
import IngredientGrid from "@/components/IngredientGrid";
import { useState } from "react";
import LoadingScreen from "@/components/LoadingScreen";

const page = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [selected, setSelected] = useState<string[]>([]);
  function handleToggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }

  return loading ? (
    <LoadingScreen onComplete={() => setLoading(false)} />
  ) : (
    <main className="w-full min-h-screen">
      <div className="flex justify-center items-center">
        <div className="">
          <Fridge />
        </div>
        <div className="">
          <IngredientGrid selected={selected} onToggle={handleToggle} />
        </div>
      </div>
    </main>
  );
};

export default page;
