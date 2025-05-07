import { Link } from "$/components/ui/Link";
import { Logo } from "$/components/ui/Logo";
import profile1 from "$/images/Profile1.png";
import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Nexus | Seu universo, em um só lugar",
  description:
    "Seu hub central de links. Organize, compartilhe e simplifique sua presença digital com Nexus.",
};

export default function Page() {
  return (
    <div className="view tablet:pb-44 pb-32">
      <header>
        <Logo variant="icon-and-name" />
      </header>
      <main className="max-tablet:flex-col tablet:gap-8 desktop:w-full desktop:justify-around mt-16 flex gap-16">
        <article className="desktop:max-w-[550px] flex flex-col gap-16">
          <h1 className="text-center text-3xl font-light">
            Seu universo,
            <br /> em um só lugar.
          </h1>
          <div className="tablet:order-last flex gap-4 self-center">
            <Link
              className="btn bg-purple text-white"
              variant="unstyled"
              href="/signup"
            >
              Cadastrar
            </Link>
            <Link
              className="btn bg-black text-white"
              variant="unstyled"
              href="/login"
            >
              Logar
            </Link>
          </div>
          <ul className="flex flex-col gap-6">
            <li>
              <h3 className="text-xl font-bold">Crie seu perfil</h3>
              <p>
                Monte um perfil com todos os seus links importantes — redes
                sociais, portfólio, contatos e mais — em um só lugar.
              </p>
            </li>
            <li>
              <h3 className="text-xl font-bold">Organize do seu jeito</h3>
              <p>
                Adicione, edite e reorganize seus links, controle visibilidade e
                personalize seu perfil com avatar, nome e bio.
              </p>
            </li>
            <li>
              <h3 className="text-xl font-bold">Compartilhe fácil</h3>
              <p>
                Tenha um link único e curto para facilitar o acesso a tudo o que
                você faz, ideal para freelancers, criadores e devs.
              </p>
            </li>
          </ul>
        </article>
        <Image
          className="max-desktop:max-w-[311px] self-start rounded-[3rem] shadow-2xl"
          src={profile1}
          alt="Example of a profile page."
        />
      </main>
    </div>
  );
}
