"use client";

import { API_URL } from "@lib/constants";
import { useEffect, useState } from "react";

export function Visitors() {
  const [visits, setVisits] = useState(0);

  useEffect(() => {
    fetch(`${API_URL}/visit`, { method: "POST" })
      .then((res) => res.json())
      .then((data) => setVisits(data.visits));
  }, []);

  return (
    <div className="py-2 px-4 bg-green-400 rounded-lg font-bold">
      {visits} visitors!
    </div>
  );
}
