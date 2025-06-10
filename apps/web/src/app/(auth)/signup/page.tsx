import { Link } from "$/components/ui/Link";
import { composeTitle } from "$/lib/utils";
import type { Metadata } from "next";
import { Signup } from "./components/Signup";

export const metadata: Metadata = {
  title: composeTitle("Crie uma conta"),
  description:
    "Crie sua conta gratuitamente no Nexus e comece a organizar todos os seus links em um só lugar.",
};

export default function Page() {
  return (
    <main className="m-auto w-full max-w-[350px] py-12">
      <h1 className="mb-12 text-center text-xl font-semibold">
        Crie uma conta
      </h1>
      <Signup />
      <div className="mt-8 flex flex-col items-center gap-4">
        <span className="text-slate text-sm font-bold">
          Já tem uma conta? <Link href="/login">Faça login!</Link>
        </span>
      </div>
    </main>
  );
}
