import { Link } from "$/components/ui/Link";
import { Logo } from "$/components/ui/Logo";
import type { Metadata } from "next";
import { FeatureList } from "./components/FeatureList";
import { ProfileShowcase } from "./components/ProfileShowcase";

export const metadata: Metadata = {
  title: "Nexus | Seu universo, em um só lugar",
  description:
    "Seu hub central de links. Organize, compartilhe e simplifique sua presença digital com Nexus.",
};

export default function Page() {
  return (
    <div className="view tablet:pb-44 pb-32">
      <header>
        <Logo className="mx-auto" variant="icon-and-name" />
      </header>
      <main className="max-tablet:flex-col tablet:gap-8 desktop:w-full desktop:justify-around mt-16 flex gap-16">
        <article className="desktop:max-w-[550px] flex flex-col gap-16">
          <h1 className="text-center text-3xl font-light">
            Seu universo,
            <br /> em um só lugar.
          </h1>
          <div className="tablet:order-last flex gap-4 self-center">
            <Link
              className="btn from-purple to-fuchsia hover:from-purple/90 hover:to-fuchsia/90 before:from-purple before:to-fuchsia before:-z-1 relative bg-gradient-to-br text-white before:absolute before:inset-0 before:animate-pulse before:rounded-full before:bg-gradient-to-br before:blur-md before:content-['']"
              variant="none"
              href="/signup"
            >
              Cadastrar
            </Link>
            <Link
              className="btn bg-charcoal hover:bg-charcoal/90 text-white"
              variant="none"
              href="/login"
            >
              Logar
            </Link>
          </div>
          <FeatureList />
        </article>
        <ProfileShowcase />
      </main>
    </div>
  );
}
