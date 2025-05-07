import { TokenVerification } from "$/components/features/auth/ResetPasswordToken";
import { ResetPasswordForm } from "$/components/form/ResetPasswordForm";
import { composeTitle } from "$/lib/helpers";
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
    <main className="tablet:mt-12 mt-8 h-full w-full max-w-[350px]">
      <h1 className="tablet:mb-12 mb-8 text-center text-xl font-bold">
        Redefina sua senha
      </h1>
      <Suspense
        fallback={
          <span className="-translate-1/2 text-medium-grey icon-[svg-spinners--3-dots-move] fixed left-1/2 top-1/2 text-2xl"></span>
        }
      >
        <TokenVerification token={token}>
          <ResetPasswordForm token={token} />
        </TokenVerification>
      </Suspense>
    </main>
  );
}
