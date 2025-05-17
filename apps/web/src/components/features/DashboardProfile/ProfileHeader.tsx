import type { UpdateProfileData } from "$/hooks/useProfile";
import type { AuthenticatedProfile } from "@repo/shared/contracts";
import Image from "next/image";
import { useState } from "react";
import { ProfileModalEditProfile } from "./ProfileModalEditProfile";

interface Props {
  profile: AuthenticatedProfile;
  updateProfile: (updateData: UpdateProfileData) => Promise<void>;
}

export function ProfileHeader({ profile, updateProfile }: Props) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
        <h2 className="truncate font-bold">{profile.displayName}</h2>
        {profile.bio && (
          <p className="text-dark-grey line-clamp-2 text-xs font-bold">
            {profile.bio}
          </p>
        )}
      </div>
      <button
        className="text-dark-grey focus-ring hover:text-black"
        type="button"
        aria-label="Editar detalhes do perfil"
        onClick={() => setIsEditModalOpen(true)}
      >
        <span className="icon-[fa6-solid--pen] block text-lg"></span>
      </button>
      <ProfileModalEditProfile
        profile={profile}
        updateProfile={updateProfile}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  );
}
