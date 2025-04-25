import { CustomLink } from "@components/CustomLink";
import { SignupForm } from "@components/SignupForm";

export default function Page() {
  return (
    <main className="tablet:mt-12 mt-8 w-full max-w-[350px]">
      <h1 className="tablet:mb-12 mb-8 text-center text-xl font-bold">
        Crie uma conta
      </h1>
      <SignupForm />
      <div className="mt-8 flex flex-col items-center gap-4">
        <span className="text-medium-grey mt-8 text-sm font-bold">
          Já tem uma conta? <CustomLink href="/login">Faça login!</CustomLink>
        </span>
      </div>
    </main>
  );
}
