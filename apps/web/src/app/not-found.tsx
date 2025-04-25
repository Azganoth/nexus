import { CustomLink } from "@components/CustomLink";
import { Logo } from "@components/Logo";
import "@styles/globals.css";

export default function Page() {
  return (
    <div className="tablet:p-12 flex h-dvh flex-col items-center p-8">
      <Logo variant="icon-and-name" />
      <main className="my-auto flex max-w-[350px] flex-col items-center gap-8">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-center font-bold">
          Essa página se perdeu no universo.
          <br />O link pode estar errado ou não existe mais.
        </p>
        <CustomLink className="font-bold" href="/">
          Voltar a página inicial
        </CustomLink>
      </main>
    </div>
  );
}
