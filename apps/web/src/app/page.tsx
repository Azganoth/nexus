import { CustomLink } from "@components/CustomLink";
import { Logo } from "@components/Logo";
import profile1 from "@images/Profile1.png";
import Image from "next/image";

export default function Page() {
  return (
    <div className="tablet:p-12 tablet:pb-44 flex flex-col items-center p-8 pb-32">
      <header className="mb-16">
        <Logo variant="icon-and-name" />
      </header>
      <main className="max-tablet:flex-col tablet:gap-8 desktop:w-full desktop:justify-around flex gap-16">
        <article className="desktop:max-w-[550px] flex flex-col gap-16">
          <h1 className="text-center text-3xl font-light">
            Seu universo,
            <br /> em um só lugar.
          </h1>
          <div className="tablet:order-last flex gap-4 self-center">
            <CustomLink
              className="btn bg-purple text-white"
              variant="unstyled"
              href="/"
            >
              Cadastrar
            </CustomLink>
            <CustomLink
              className="btn bg-black text-white"
              variant="unstyled"
              href="/"
            >
              Logar
            </CustomLink>
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
