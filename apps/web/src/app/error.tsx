"use client";

import { ErrorDisplay } from "$/components/ui/ErrorDisplay";
import { Logo } from "$/components/ui/Logo";

export default function Error({
  error,
  // reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="view">
      <header>
        <Logo className="mx-auto" variant="icon-and-name" />
      </header>
      <main className="my-auto">
        <ErrorDisplay title={error.message} />
      </main>
    </div>
  );
}
