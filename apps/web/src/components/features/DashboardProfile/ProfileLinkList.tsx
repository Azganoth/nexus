import type { AuthenticatedProfile } from "@repo/shared/contracts";
import { ProfileLink } from "./ProfileLink";

interface Props {
  links: AuthenticatedProfile["links"];
}

export function ProfileLinkList({ links }: Props) {
  if (links.length === 0) {
    return (
      <div
        className="mt-16 flex flex-col items-center"
        role="status"
        aria-live="polite"
      >
        <span
          className="icon-[fa6-solid--link-slash] text-4xl text-black/50"
          aria-hidden="true"
        ></span>
        <h3 className="mt-8 text-lg font-semibold">Nenhum link adicionado</h3>
        <p className="text-sm">Adicione seu primeiro link!</p>
      </div>
    );
  }

  return (
    <ul
      className="desktop:max-w-[600px] mt-8 flex w-full max-w-[500px] flex-col gap-8 pb-32"
      aria-label="Lista de links do perfil"
    >
      {links.map((link) => (
        <ProfileLink key={link.id} link={link} />
      ))}
    </ul>
  );
}
