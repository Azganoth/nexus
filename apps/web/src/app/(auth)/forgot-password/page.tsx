import { ForgotPassword } from "$/components/features/auth/ForgotPassword";
import { composeTitle } from "$/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: composeTitle("Recupere a sua conta"),
  description: "Recupere o acesso à sua conta Nexus.",
};

export default function Page() {
  return (
    <main className="m-auto w-full max-w-[350px] py-12">
      <h1 className="mb-12 text-center text-xl font-semibold">
        Recupere sua conta
      </h1>
      <ForgotPassword />
    </main>
  );
}
