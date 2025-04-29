import { CustomLink } from "$/components/CustomLink";
import { Logo } from "$/components/Logo";
import { Profile } from "$/components/Profile";
import { getProfile } from "$/lib/api";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  try {
    const profile = await getProfile(username);

    return (
      <main className="tablet:p-16 flex min-h-dvh flex-col items-center p-8">
        <Profile profile={profile} />
        <div className="mt-auto pt-16">
          <Logo variant="icon-only" />
        </div>
      </main>
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Private") {
        return (
          <div className="tablet:p-12 flex min-h-dvh flex-col items-center p-8">
            <Logo variant="icon-and-name" />
            <main className="my-auto flex flex-col items-center gap-4">
              <div className="before:bg-medium-grey after:bg-medium-grey flex w-full items-center gap-4 before:h-px before:w-full before:content-[''] after:h-px after:w-full after:content-['']">
                <div className="border-medium-grey rounded-full border p-2">
                  <span className="icon-[fa6-solid--lock] text-md text-medium-grey block"></span>
                </div>
              </div>
              <h1 className="text-center font-bold">Este perfil é privado.</h1>
              <CustomLink className="mt-4 font-bold" href="/">
                Voltar a página inicial
              </CustomLink>
            </main>
          </div>
        );
      }
      if (error.message === "Missing") {
        notFound();
      }
    }

    throw error;
  }
}
