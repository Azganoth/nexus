import { ProfileShare } from "$/components/ui/ProfileShare";
import type { AuthenticatedProfile } from "@repo/shared/contracts";
import { useState } from "react";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileLinkList } from "./ProfileLinkList";
import { ProfileModalAddLink } from "./ProfileModalAddLink";
import type { UpdateProfileData } from "$/hooks/useProfile";

interface Props {
  profile: AuthenticatedProfile;
  revalidateProfile: () => void;
  updateProfile: (updateData: UpdateProfileData) => Promise<void>;
}

export function ProfileDashboard({ profile, revalidateProfile, updateProfile }: Props) {
  const [isAddLinkModalOpen, setIsAddLinkModalOpen] = useState(false);

  return (
    <section className="flex w-full flex-col items-center">
      <ProfileShare
        className="desktop:hidden mt-8"
        username={profile.username}
      />
      <ProfileHeader profile={profile} updateProfile={updateProfile} />
      <button
        className="btn bg-purple focus-ring mt-12 text-white"
        type="button"
        aria-label="Adicionar novo link ao perfil"
        onClick={() => {
          setIsAddLinkModalOpen(true);
        }}
      >
        Adicionar link
      </button>
      <ProfileLinkList
        links={profile.links}
        onDelete={revalidateProfile}
        onEdit={revalidateProfile}
      />
      <ProfileModalAddLink
        isOpen={isAddLinkModalOpen}
        onClose={() => {
          setIsAddLinkModalOpen(false);
        }}
        onAdd={revalidateProfile}
      />
    </section>
  );
}
