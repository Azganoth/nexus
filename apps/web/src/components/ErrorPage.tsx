import { CustomLink } from "$/components/CustomLink";
import { Logo } from "$/components/Logo";
import clsx from "clsx";

export interface ErrorPageProps {
  name: string;
  message?: string;
}

export function ErrorPage({ name, message }: ErrorPageProps) {
  return (
    <div className="tablet:p-12 flex h-dvh flex-col items-center p-8">
      <Logo variant="icon-and-name" />
      <main className="my-auto flex flex-col items-center gap-4">
        <h1 className={clsx("font-bold", message ? "text-4xl" : "text-xl")}>
          {name}
        </h1>
        {message && (
          <p className="whitespace-pre-line text-center font-bold">{message}</p>
        )}
        <CustomLink className="mt-4 font-bold" href="/">
          Voltar a página inicial
        </CustomLink>
      </main>
    </div>
  );
}
