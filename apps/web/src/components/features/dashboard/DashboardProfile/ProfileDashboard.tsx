import { ProfileShare } from "$/components/features/profile/ProfileShare";
import { toast } from "$/components/ui/Toast";
import type { UpdateProfileData } from "$/hooks/useProfile";
import type { AuthenticatedProfile } from "@repo/shared/contracts";
import { useState } from "react";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileLinkList } from "./ProfileLinkList";
import { AddLinkModal } from "./modals/AddLinkModal";

interface ProfileDashboardProps {
  profile: AuthenticatedProfile;
  revalidateProfile: () => void;
  updateProfile: (updateData: UpdateProfileData) => Promise<void>;
  updateLinkOrder: (orderedIds: number[]) => Promise<void>;
  updateLinkVisibility: (linkId: number, isPublic: boolean) => Promise<void>;
}

export function ProfileDashboard({
  profile,
  revalidateProfile,
  updateProfile,
  updateLinkOrder,
  updateLinkVisibility,
}: ProfileDashboardProps) {
  const [isAddLinkModalOpen, setIsAddLinkModalOpen] = useState(false);

  const handleReorderLinks = async (orderedIds: number[]) => {
    try {
      await updateLinkOrder(orderedIds);
    } catch (error) {
      console.error("Failed to reorder links:", error);
      toast.error("Reordenação dos links falhou, tente novamente.");
    }
  };

  const handleToggleVisibility = async (
    linkId: number,
    currentVisibility: boolean,
  ) => {
    try {
      await updateLinkVisibility(linkId, !currentVisibility);
    } catch (error) {
      console.error("Failed to toggle link visibility:", error);
      toast.error(
        "Alteração de visibilidade para o link falhou, tente novamente.",
      );
    }
  };

  return (
    <section className="flex w-full flex-col items-center pb-32">
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
        onToggleVisibility={handleToggleVisibility}
        onReorder={handleReorderLinks}
      />
      <AddLinkModal
        isOpen={isAddLinkModalOpen}
        onClose={() => {
          setIsAddLinkModalOpen(false);
        }}
        onAdd={revalidateProfile}
      />
    </section>
  );
}
