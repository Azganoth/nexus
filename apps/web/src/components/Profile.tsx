import { CustomLink } from "$/components/CustomLink";
import profileAvatar from "$/images/Profile.webp";
import type { Profile } from "$/lib/api";
import Image from "next/image";

export interface ProfileProps {
  profile: Profile;
}

export function Profile({ profile }: ProfileProps) {
  return (
    <section className="flex max-w-[400px] flex-col items-center">
      <Image
        className="rounded-full"
        width={128}
        height={128}
        src={profileAvatar}
        alt=""
      />
      <h1 className="mt-3 text-center text-xl font-bold">{profile.name}</h1>
      {profile.bio && (
        <p className="text-dark-grey mt-2 text-center font-bold">
          {profile.bio}
        </p>
      )}
      <ul className="mt-12 flex w-full flex-col gap-5">
        {profile.links.map((link) => (
          <li key={link.url}>
            <CustomLink
              className="rounded-4xl focus:outline-purple block bg-black px-16 py-4 text-center font-bold tracking-wide text-white hover:bg-black/90 focus:outline-2"
              href={link.url}
              variant="unstyled"
              newTab
            >
              {link.title}
            </CustomLink>
          </li>
        ))}
      </ul>
    </section>
  );
}
