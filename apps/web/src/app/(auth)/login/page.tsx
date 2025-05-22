import { Login } from "$/components/features/auth/Login";
import { Link } from "$/components/ui/Link";
import { composeTitle } from "$/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: composeTitle("Acesse a sua conta"),
  description:
    "Acesse sua conta no Nexus para gerenciar e compartilhar seus links.",
};

export default function Page() {
  return (
    <main className="my-auto w-full max-w-[350px] py-12">
      <h1 className="mb-12 text-center text-xl font-semibold">
        Acesse a sua conta
      </h1>
      <Login />
      <div className="mt-8 grid gap-4 text-center">
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
