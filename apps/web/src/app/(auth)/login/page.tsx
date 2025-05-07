import { LoginForm } from "$/components/form/LoginForm";
import { Link } from "$/components/ui/Link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nexus - Login",
  description:
    "Acesse sua conta no Nexus para gerenciar e compartilhar seus links.",
};

export default function Page() {
  return (
    <main className="tablet:mt-12 mt-8 w-full max-w-[350px]">
      <h1 className="tablet:mb-12 mb-8 text-center text-xl font-bold">
        Acesse a sua conta
      </h1>
      <LoginForm />
      <div className="mt-8 flex flex-col items-center gap-4">
        <Link className="text-sm font-bold" href="/forgot-password">
          Esqueceu a senha?
        </Link>
        <span className="text-medium-grey text-sm font-bold">
          Não tem uma conta? <Link href="/signup">Cadastre-se agora!</Link>
        </span>
      </div>
    </main>
  );
}
