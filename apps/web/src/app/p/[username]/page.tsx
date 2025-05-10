import { Profile } from "$/components/features/Profile";
import { Link } from "$/components/ui/Link";
import { Logo } from "$/components/ui/Logo";
import { composeTitle } from "$/lib/utils";
import { apiClient } from "$/services/apiClient";
import { ApiError } from "$/services/errors";
import type { PublicProfile } from "@repo/shared/contracts";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

const getProfile = cache(async (username: string) => {
  try {
    return apiClient.get<PublicProfile>(`/profiles/${username}`);
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

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
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

export default async function Page({ params }: Props) {
  const { username } = await params;
  const result = await getProfile(username);

  if (result instanceof ApiError) {
    return (
      <div className="view">
        <header>
          <Logo variant="icon-and-name" />
        </header>
        <main className="my-auto flex flex-col items-center gap-4">
          <div className="before:bg-medium-grey after:bg-medium-grey flex w-full items-center gap-4 before:h-px before:w-full before:content-[''] after:h-px after:w-full after:content-['']">
            <div className="border-medium-grey rounded-full border p-2">
              <span className="icon-[fa6-solid--lock] text-md text-medium-grey block"></span>
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
