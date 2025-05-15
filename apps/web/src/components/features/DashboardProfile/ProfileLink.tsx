import { Link } from "$/components/ui/Link";
import type { AuthenticatedProfile } from "@repo/shared/contracts";
import clsx from "clsx";

interface Props {
  link: AuthenticatedProfile["links"][number];
}

export function ProfileLink({ link }: Props) {
  return (
    <li
      key={link.url}
      className="rounded-4xl flex items-center gap-4 bg-white p-4 shadow-lg"
    >
      <button
        className="text-medium-grey focus-ring cursor-move py-1"
        type="button"
        aria-label="Reordenar link"
      >
        <span className="icon-[ph--dots-six-vertical-bold] block text-2xl"></span>
      </button>
      <div className="min-w-0 grow">
        <div className="flex items-center gap-2">
          <h3 className="font-bold">{link.title}</h3>
          <button
            className="text-dark-grey desktop:block focus-ring hidden hover:text-black"
            type="button"
            aria-label={`Editar título do link: ${link.title}`}
          >
            <span className="icon-[fa6-solid--pen] block"></span>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Link
            className="text-dark-grey hover:text-purple focus-ring truncate !no-underline"
            href={link.url}
            newTab
            aria-label={`Visitar ${link.title} (abre em nova aba)`}
          >
            {link.url.replace(/^https?:\/\//, "")}
          </Link>
          <button
            className="text-dark-grey desktop:block focus-ring hidden hover:text-black"
            type="button"
            aria-label={`Editar URL do link: ${link.title}`}
          >
            <span className="icon-[fa6-solid--pen] block"></span>
          </button>
        </div>
      </div>
      <div
        className="flex items-center gap-4"
        role="group"
        aria-label="Ações do link"
      >
        <button
          className="text-dark-grey focus-ring desktop:hidden hover:text-black"
          type="button"
          aria-label={`Editar link: ${link.title}`}
        >
          <span className="icon-[fa6-solid--pen] block text-lg"></span>
        </button>
        <button
          className="text-dark-grey focus-ring hover:text-black"
          type="button"
          aria-label={
            link.isPublic
              ? `Esconder link: ${link.title}`
              : `Mostrar link: ${link.title}`
          }
        >
          <span
            className={clsx(
              "block text-xl",
              link.isPublic
                ? "icon-[fa6-solid--eye]"
                : "icon-[fa6-solid--eye-slash]",
            )}
          ></span>
        </button>
        <button
          className="text-dark-grey focus-ring hover:text-black"
          type="button"
          aria-label={`Excluir link: ${link.title}`}
        >
          <span className="icon-[fa6-solid--trash] block text-lg"></span>
        </button>
      </div>
    </li>
  );
}
