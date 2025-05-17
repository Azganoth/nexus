"use client";

import {
  getFromAuthenticatedProfile,
  Profile,
} from "$/components/features/Profile";
import { ErrorDisplay } from "$/components/ui/ErrorDisplay";
import { ProfileShare } from "$/components/ui/ProfileShare";
import { useProfile } from "$/hooks/useProfile";
import { ProfileDashboard } from "./ProfileDashboard";

export function DashboardProfile() {
  const {
    profile,
    isProfileLoading,
    profileError,
    revalidateProfile,
    updateProfile,
    updateLinkOrder,
    updateLinkVisibility,
  } = useProfile();

  if (isProfileLoading) {
    return <ProfileSkeleton />;
  }

  if (profileError || !profile) {
    return (
      <ErrorState
        onRetry={() => {
          revalidateProfile();
        }}
      />
    );
  }

  return (
    <div className="flex gap-16">
      <ProfileDashboard
        profile={profile}
        revalidateProfile={revalidateProfile}
        updateProfile={updateProfile}
        updateLinkOrder={updateLinkOrder}
        updateLinkVisibility={updateLinkVisibility}
      />
      <div className="max-desktop:hidden flex flex-col">
        <ProfileShare className="mt-8" username={profile.username} />
        <div
          className="mt-8 min-w-[400px] rounded-[3rem] p-8 shadow-xl ring-4 ring-black"
          inert
        >
          <Profile profile={getFromAuthenticatedProfile(profile)} />
        </div>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <section
      className="flex w-full flex-col items-center"
      aria-label="Carregando perfil"
      aria-busy="true"
    >
      {/* ProfileShare placeholder */}
      <div className="mt-8 h-10 w-60 animate-pulse rounded-full bg-black/10" />
      {/* ProfileHeader placeholder */}
      <div className="mt-8 grid w-full max-w-[500px] grid-cols-[auto_1fr_auto] items-center gap-4">
        <div className="h-16 w-16 animate-pulse rounded-full bg-black/10" />
        <div className="space-y-2">
          <div className="h-5 w-32 animate-pulse rounded bg-black/10" />
          <div className="h-3 w-48 animate-pulse rounded bg-black/10" />
        </div>
        <div className="h-8 w-8 animate-pulse rounded-full bg-black/10" />
      </div>
      {/* Add link button placeholder */}
      <div className="btn mt-12 h-14 w-44 animate-pulse rounded-full bg-black/10" />
      {/* Link cards placeholder */}
      <div className="mt-8 flex w-full max-w-[500px] flex-col gap-8">
        <div className="h-20 w-full animate-pulse rounded-[2rem] bg-black/10 shadow-xl" />
        <div className="h-20 w-full animate-pulse rounded-[2rem] bg-black/10 shadow-xl" />
      </div>
    </section>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <section className="my-auto">
      <ErrorDisplay
        title="Não foi possível carregar seu perfil."
        action={
          <button
            className="btn bg-purple focus-ring mt-8 text-white"
            onClick={onRetry}
            aria-label="Tentar carregar perfil novamente"
          >
            Tentar Novamente
          </button>
        }
      ></ErrorDisplay>
    </section>
  );
}
