import { ErrorDisplay } from "$/components/ui/ErrorDisplay";
import { Logo } from "$/components/ui/Logo";

export default function NotFound() {
  return (
    <div className="view tablet:pb-44 pb-32">
      <header>
        <Logo variant="icon-and-name" />
      </header>
      <main className="my-auto">
        <ErrorDisplay title="Perfil não encontrado" />
      </main>
    </div>
  );
}
