import { CustomLink } from "@components/CustomLink";
import { Logo } from "@components/Logo";
import profile1 from "@images/Profile1.png";
import Image from "next/image";

export default function Page() {
  return (
    <div className="p-8 pb-32 flex flex-col items-center tablet:p-12 tablet:pb-44">
      <header className="mb-16">
        <Logo variant="icon-and-name" />
      </header>
      <main className="flex max-tablet:flex-col gap-16 tablet:gap-8 desktop:w-full desktop:justify-around">
        <article className="flex flex-col gap-16 desktop:max-w-[550px]">
          <h1 className="text-3xl text-center font-light">
            Seu universo,
            <br /> em um só lugar.
          </h1>
          <div className="flex gap-4 self-center tablet:order-last">
            <CustomLink
              className="rounded-full px-6 py-4 text-white bg-purple font-bold"
              variant="unstyled"
              href="/"
            >
              Cadastrar
            </CustomLink>
            <CustomLink
              className="rounded-full px-6 py-4 text-white bg-black font-bold"
              variant="unstyled"
              href="/"
            >
              Logar
            </CustomLink>
          </div>
          <ul className="flex flex-col gap-6">
            <li>
              <h3 className="font-bold text-xl">Crie seu perfil</h3>
              <p>
                Monte um perfil com todos os seus links importantes — redes
                sociais, portfólio, contatos e mais — em um só lugar.
              </p>
            </li>
            <li>
              <h3 className="font-bold text-xl">Organize do seu jeito</h3>
              <p>
                Adicione, edite e reorganize seus links, controle visibilidade e
                personalize seu perfil com avatar, nome e bio.
              </p>
            </li>
            <li>
              <h3 className="font-bold text-xl">Compartilhe fácil</h3>
              <p>
                Tenha um link único e curto para facilitar o acesso a tudo o que
                você faz, ideal para freelancers, criadores e devs.
              </p>
            </li>
          </ul>
        </article>
        <Image
          className="shadow-2xl rounded-[3rem] max-desktop:max-w-[311px] self-start"
          src={profile1}
          alt="Example of a profile page."
        />
      </main>
    </div>
  );
}
