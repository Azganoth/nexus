import type { UpdateProfileData } from "$/hooks/useProfile";
import type { AuthenticatedProfile } from "@repo/shared/contracts";
import { useState } from "react";
import { ProfileAvatar } from "./ProfileAvatar";
import { ProfileModalEditProfile } from "./ProfileModalEditProfile";

interface Props {
  profile: AuthenticatedProfile;
  updateProfile: (updateData: UpdateProfileData) => Promise<void>;
}

export function ProfileHeader({ profile, updateProfile }: Props) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <div className="mt-8 grid w-full grid-cols-[auto_1fr_auto] items-center gap-4">
      <ProfileAvatar
        currentUrl={profile.avatarUrl}
        updateProfile={updateProfile}
      />
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
