import { ForgotPasswordForm } from "$/components/form/ForgotPasswordForm";
import { Link } from "$/components/ui/Link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nexus - Recuperar Conta",
  description: "Recupere o acesso à sua conta Nexus.",
};

export default function Page() {
  return (
    <main className="tablet:mt-12 mt-8 w-full max-w-[350px]">
      <h1 className="tablet:mb-12 mb-8 text-center text-xl font-bold">
        Recupere sua conta
      </h1>
      <ForgotPasswordForm />
      <div className="mt-8 flex flex-col items-center gap-4">
        <span className="text-center text-sm font-bold">
          Não tem uma conta? <Link href="/signup">Cadastre-se agora!</Link>
        </span>
      </div>
    </main>
  );
}
