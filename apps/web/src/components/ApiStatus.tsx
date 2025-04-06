"use client";

import { useEffect, useState } from "react";

const STATUSES = {
  loading: "🔄 Checking...",
  ok: "✅ Healthy",
  error: "❌ Unavailable",
};

export function ApiStatus() {
  const [status, setStatus] = useState<keyof typeof STATUSES>("loading");

  useEffect(() => {
    fetch("/api/status")
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
