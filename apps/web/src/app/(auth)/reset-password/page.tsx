import { ResetPassword } from "$/components/features/auth/ResetPassword";
import { TokenVerification } from "$/components/features/auth/ResetPasswordToken";
import { Icon } from "$/components/ui/Icon";
import { composeTitle } from "$/lib/utils";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: composeTitle("Redefina a sua senha"),
  description: "Crie uma nova senha para sua conta",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ token: string | string[] | undefined }>;
}) {
  const token = (await searchParams).token;
  if (typeof token !== "string") {
    throw new Error("Token de redefinição de senha inválido ou ausente.");
  }

  return (
    <main className="m-auto w-full max-w-[350px] py-12">
      <Suspense
        fallback={
          <div className="grid place-items-center gap-4">
            <p className="text-xl font-bold">Verificando token...</p>
            <Icon className="text-medium-grey icon-[svg-spinners--3-dots-move] text-2xl" />
          </div>
        }
      >
        <TokenVerification token={token}>
          <>
            <h1 className="mb-12 text-center text-xl font-semibold">
              Redefina sua senha
            </h1>
            <ResetPassword token={token} />
          </>
        </TokenVerification>
      </Suspense>
    </main>
  );
}
