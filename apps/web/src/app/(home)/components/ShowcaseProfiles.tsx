import { Link } from "$/components/ui/Link";
import { apiClient } from "$/lib/apiClient";
import type { PublicProfile } from "@repo/shared/contracts";
import Image from "next/image";

export const ShowcaseProfiles = async () => {
  const profiles = await apiClient.get<PublicProfile[]>("/profiles/showcase");

  if (!profiles) {
    return null;
  }

  return (
    <section className="mt-32">
      <h2 className="mb-16 text-center text-3xl font-light">
        Um universo de possibilidades.
      </h2>
      <ul className="tablet:grid-cols-3 flex flex-wrap justify-center gap-12">
        {profiles.map((profile) => (
          <li key={profile.id} className="tablet:max-w-[400px] w-full">
            <Link
              href={`/p/${profile.username}`}
              className="rounded-4xl block h-full cursor-pointer border border-black/10 p-6 shadow-lg transition-transform duration-300 hover:scale-105"
              variant="none"
              newTab
            >
              <div className="flex items-center gap-4">
                <Image
                  src={profile.avatarUrl}
                  alt={`Avatar for ${profile.displayName}`}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
                <div>
                  <h3 className="font-bold">{profile.displayName}</h3>
                  <p className="text-sm">@{profile.username}</p>
                </div>
              </div>
              <p className="text-comet mt-4 text-sm">{profile.bio}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};
