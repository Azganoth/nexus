import { ProfileShare } from "$/components/ui/ProfileShare";
import type { AuthenticatedProfile } from "@repo/shared/contracts";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileLinkList } from "./ProfileLinkList";

interface Props {
  profile: AuthenticatedProfile;
}

export function ProfileDashboard({ profile }: Props) {
  return (
    <section className="flex w-full flex-col items-center">
      <ProfileShare
        className="desktop:hidden mt-8"
        username={profile.username}
      />
      <ProfileHeader profile={profile} />
      <button
        className="btn bg-purple focus-ring mt-12 text-white"
        type="button"
        aria-label="Adicionar novo link ao perfil"
      >
        Adicionar link
      </button>
      <ProfileLinkList links={profile.links} />
    </section>
  );
}
