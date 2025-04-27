"use client";

import { ErrorPage } from "$/components/ErrorPage";

export default function Error({
  error: { name, message },
  // reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return ErrorPage({ name, message });
}
