"use client";

import { API_URL } from "@lib/constants";
import { useEffect, useState } from "react";

const STATUSES = {
  loading: "🔄 Checking...",
  ok: "✅ Healthy",
  error: "❌ Unavailable",
};

export function ApiStatus() {
  const [status, setStatus] = useState<keyof typeof STATUSES>("loading");

  useEffect(() => {
    fetch(`${API_URL}/status`)
      .then((res) => (res.ok ? setStatus("ok") : setStatus("error")))
      .catch(() => setStatus("error"));
  }, []);

  return (
    <div data-testid="api-status" className="p-2">
      <span className="font-bold">API: </span>
      {STATUSES[status]}
    </div>
  );
}
