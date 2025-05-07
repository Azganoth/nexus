import { SignupForm } from "$/components/form/SignupForm";
import { Link } from "$/components/ui/Link";
import { composeTitle } from "$/lib/helpers";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: composeTitle("Crie uma conta"),
  description:
    "Crie sua conta gratuitamente no Nexus e comece a organizar todos os seus links em um só lugar.",
};

export default function Page() {
  return (
    <main className="tablet:mt-12 mt-8 w-full max-w-[350px]">
      <h1 className="tablet:mb-12 mb-8 text-center text-xl font-bold">
        Crie uma conta
      </h1>
      <SignupForm />
      <div className="mt-8 flex flex-col items-center gap-4">
        <span className="text-medium-grey mt-8 text-sm font-bold">
          Já tem uma conta? <Link href="/login">Faça login!</Link>
        </span>
      </div>
    </main>
  );
}
