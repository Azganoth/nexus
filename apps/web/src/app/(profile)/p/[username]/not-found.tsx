import { ErrorDisplay } from "$/components/ui/ErrorDisplay";
import { Logo } from "$/components/ui/Logo";
import { composeTitle } from "$/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: composeTitle("Perfil não encontrado"),
};

export default function NotFound() {
  return (
    <div className="view">
      <header>
        <Logo className="mx-auto" variant="icon-and-name" />
      </header>
      <main className="my-auto">
        <ErrorDisplay title="Perfil não encontrado" />
      </main>
    </div>
  );
}
