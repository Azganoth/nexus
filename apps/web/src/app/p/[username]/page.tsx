import { Profile } from "$/components/features/profile/Profile";
import { Icon } from "$/components/ui/Icon";
import { Link } from "$/components/ui/Link";
import { Logo } from "$/components/ui/Logo";
import { apiClient } from "$/lib/apiClient";
import { ApiError } from "$/lib/errors";
import { composeTitle } from "$/lib/utils";
import type { PublicProfile } from "@repo/shared/contracts";
import clsx from "clsx";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

const getProfile = cache(async (username: string) => {
  try {
    const profile = await apiClient.get<PublicProfile>(`/profiles/${username}`);
    return profile;
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.code === "NOT_FOUND") {
        notFound();
      }
      if (error.code === "PRIVATE_PROFILE") {
        return error;
      }
    }

    throw error;
  }
});

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username } = await params;
  const result = await getProfile(username);

  if (result instanceof ApiError) {
    return {
      title: composeTitle("Perfil privado"),
      robots: { index: false, follow: false },
    };
  }

  const { avatarUrl, displayName, bio, seoTitle, seoDescription } = result;
  const title = seoTitle ?? displayName;
  const description = seoDescription ?? bio ?? "";

  return {
    title: composeTitle(title),
    description,
    openGraph: {
      title,
      description,
      images: [{ url: avatarUrl }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [avatarUrl],
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { username } = await params;
  const result = await getProfile(username);

  if (result instanceof ApiError) {
    return (
      <div className="view">
        <header>
          <Logo className="mx-auto" variant="icon-and-name" />
        </header>
        <main className="my-auto flex flex-col items-center gap-4">
          <div
            className={clsx(
              "flex w-full max-w-64 items-center gap-4",
              "before:bg-slate before:h-px before:w-full before:content-['']",
              "after:bg-slate after:h-px after:w-full after:content-['']",
            )}
          >
            <div className="border-slate rounded-full border p-2">
              <Icon className="icon-[fa6-solid--lock] text-md text-slate" />
            </div>
          </div>
          <h1 className="text-center font-bold">Este perfil é privado.</h1>
          <Link className="mt-4 font-bold" href="/">
            Voltar a página inicial
          </Link>
        </main>
      </div>
    );
  }

  return (
    <main className="tablet:p-16 flex min-h-dvh flex-col items-center p-8">
      <Profile profile={result} />
      <div className="mt-auto pt-16">
        <Logo variant="icon-only" />
      </div>
    </main>
  );
}
