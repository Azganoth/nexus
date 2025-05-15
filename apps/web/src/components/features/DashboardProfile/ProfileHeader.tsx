import type { AuthenticatedProfile } from "@repo/shared/contracts";
import Image from "next/image";

interface Props {
  profile: AuthenticatedProfile;
}

export function ProfileHeader({ profile }: Props) {
  const changePicture = () => {
    // TODO: Implement file upload logic
  };

  return (
    <div className="mt-8 grid w-full grid-cols-[auto_1fr_auto] items-center gap-4">
      <button
        className="focus-ring focus-visible:ring-purple group relative overflow-hidden rounded-full"
        type="button"
        onClick={changePicture}
        aria-label="Alterar avatar do perfil"
      >
        <Image
          width={64}
          height={64}
          src={profile.avatarUrl}
          alt={`Avatar de ${profile.displayName}`}
        />
        <div className="absolute inset-0 grid place-items-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          <span className="icon-[fa6-solid--pen] block text-lg text-white"></span>
        </div>
      </button>
      <div className="min-w-0">
        <div className="flex items-center gap-4">
          <h2 className="truncate font-bold">{profile.displayName}</h2>
          <button
            className="text-dark-grey desktop:block focus-ring hidden hover:text-black"
            type="button"
            aria-label={`Editar nome de exibição: ${profile.displayName}`}
          >
            <span className="icon-[fa6-solid--pen] block"></span>
          </button>
        </div>
        {profile.bio && (
          <div className="flex items-center gap-4">
            <p className="text-dark-grey line-clamp-2 text-xs font-bold">
              {profile.bio}
            </p>
            <button
              className="desktop:block text-dark-grey focus-ring hidden hover:text-black"
              type="button"
              aria-label="Editar biografia"
            >
              <span className="icon-[fa6-solid--pen] block text-sm"></span>
            </button>
          </div>
        )}
      </div>
      <button
        className="text-dark-grey focus-ring desktop:hidden hover:text-black"
        type="button"
        aria-label="Editar detalhes do perfil"
      >
        <span className="icon-[fa6-solid--pen] block text-lg"></span>
      </button>
    </div>
  );
}
