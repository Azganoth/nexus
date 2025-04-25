import { CustomLink } from "@components/CustomLink";
import { LoginForm } from "@components/LoginForm";

export default function Page() {
  return (
    <main className="tablet:mt-12 mt-8 w-full max-w-[350px]">
      <h1 className="tablet:mb-12 mb-8 text-center text-xl font-bold">
        Acesse a sua conta
      </h1>
      <LoginForm />
      <div className="mt-8 flex flex-col items-center gap-4">
        <CustomLink className="text-sm font-bold" href="/forgot-password">
          Esqueceu a senha?
        </CustomLink>
        <span className="text-medium-grey text-sm font-bold">
          Não tem uma conta?{" "}
          <CustomLink href="/signup">Cadastre-se agora!</CustomLink>
        </span>
      </div>
    </main>
  );
}
