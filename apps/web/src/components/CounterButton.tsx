"use client";

import { useState } from "react";

export function CounterButton() {
  const [count, setCount] = useState(0);

  return (
    <button
      className="px-4 py-2 bg-neutral-950 hover:bg-neutral-900 text-white rounded-lg 
                 transition-all duration-200 transform active:scale-95"
      onClick={() => setCount((c) => c + 1)}
    >
      Clicks: {count}
    </button>
  );
}
