"use client";

import { ErrorDisplay } from "$/components/ui/ErrorDisplay";
import { useProfile } from "$/hooks/useProfile";
import { useUser } from "$/hooks/useUser";
import { AccountDeletion } from "./AccountDeletion";
import { AccountSettings } from "./AccountSettings";
import { ProfileSettings } from "./ProfileSettings";

export function DashboardSettings() {
  const { user, updateUser, isUserLoading, revalidateUser, userError } =
    useUser();
  const {
    profile,
    updateProfile,
    isProfileLoading,
    profileError,
    revalidateProfile,
  } = useProfile();

  if (isProfileLoading || isUserLoading) {
    return <DashboardSettingsSkeleton />;
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
  if (userError || !user) {
    return (
      <ErrorState
        onRetry={() => {
          revalidateUser();
        }}
      />
    );
  }

  return (
    <section className="desktop:grid-cols-[repeat(2,min(100%,500px))] mx-auto mt-8 grid w-full grid-cols-[min(100%,500px)] justify-center gap-12">
      <ProfileSettings profile={profile} update={updateProfile} />
      <div className="space-y-12">
        <AccountSettings user={user} update={updateUser} />
        <AccountDeletion />
      </div>
    </section>
  );
}

function DashboardSettingsSkeleton() {
  return (
    <section
      className="tablet:flex-row tablet:gap-16 max-tablet:items-center tablet:justify-center mx-auto mt-8 flex w-full flex-col gap-8"
      aria-label="Carregando configurações"
      aria-busy="true"
    >
      {/* ProfileSettings placeholder */}
      <div className="w-full max-w-[500px]">
        <div className="mx-auto mb-6 h-6 w-28 rounded bg-black/20" />
        <div>
          <div className="mb-6 h-10 rounded bg-black/10" />
          <div className="mb-10 h-14 rounded bg-black/10" />
          <div className="mb-10 h-14 rounded bg-black/10" />
          <div className="mb-10 h-[108px] rounded bg-black/10" />
        </div>
      </div>
      {/* AccountSettings placeholder */}
      <div className="w-full max-w-[500px]">
        <div className="mx-auto mb-6 h-6 w-28 rounded bg-black/20" />
        <div>
          <div className="mb-10 h-14 rounded bg-black/10" />
          <div className="mx-auto h-14 w-40 rounded-full bg-black/10" />
        </div>
        {/* Danger zone card */}
        <div className="rounded-4xl bg-red/15 mt-12 animate-pulse p-6 shadow-lg">
          <div className="bg-red/30 mb-2 h-5 w-24 rounded" />
          <div className="bg-red/20 mb-6 h-4 w-40 rounded" />
          <div className="bg-red/30 h-14 w-full rounded-full" />
        </div>
      </div>
    </section>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <section className="my-auto">
      <ErrorDisplay
        title="Não foi possível carregar suas configurações."
        action={
          <button
            className="btn bg-purple focus-ring mt-8 text-white"
            onClick={onRetry}
          >
            Tentar Novamente
          </button>
        }
      />
    </section>
  );
}
