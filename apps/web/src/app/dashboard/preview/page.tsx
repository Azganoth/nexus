import { Profile } from "$/components/features/profile/Profile";
import { ProfileShare } from "$/components/features/profile/ProfileShare";
import { apiClient } from "$/lib/apiClient";
import { getAuth } from "$/lib/auth/server";
import { composeTitle } from "$/lib/utils";
import type { AuthenticatedProfile } from "@repo/shared/contracts";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: composeTitle("Pré-visualização do Perfil"),
  description: "Veja como seu perfil aparece para outros usuários no Nexus.",
};

export default async function Page() {
  const auth = (await getAuth())!; // NOTE: Layout already checks auth state.
  const profile = await apiClient.get<AuthenticatedProfile>("/profiles/me", {
    headers: {
      Authorization: `Bearer ${auth.accessToken}`,
    },
  });

  return (
    <main className="mt-8 flex flex-col items-center gap-8">
      <ProfileShare username={profile.username} />
      <div className="rounded-[3rem] p-8 shadow-xl ring-4 ring-black">
        <Profile profile={profile} />
      </div>
    </main>
  );
}
