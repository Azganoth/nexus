import { Signup } from "$/components/features/auth/Signup";
import { Link } from "$/components/ui/Link";
import { composeTitle } from "$/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: composeTitle("Crie uma conta"),
  description:
    "Crie sua conta gratuitamente no Nexus e comece a organizar todos os seus links em um só lugar.",
};

export default function Page() {
  return (
    <main className="my-auto w-full max-w-[350px] py-12">
      <h1 className="mb-12 text-center text-xl font-semibold">
        Crie uma conta
      </h1>
      <Signup />
      <div className="mt-8 text-center">
        <span className="text-medium-grey text-sm font-bold">
          Já tem uma conta? <Link href="/login">Faça login!</Link>
        </span>
      </div>
    </main>
  );
}
