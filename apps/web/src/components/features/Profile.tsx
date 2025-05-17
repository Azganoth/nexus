import { Link } from "$/components/ui/Link";
import type {
  AuthenticatedProfile,
  PublicLink,
  PublicProfile,
} from "@repo/shared/contracts";
import Image from "next/image";

interface Props {
  profile: PublicProfile;
}

export function Profile({ profile }: Props) {
  return (
    <section className="flex max-w-[400px] flex-col items-center">
      <Image
        className="rounded-full"
        width={128}
        height={128}
        src={profile.avatarUrl}
        alt=""
        priority
      />
      <h1 className="mt-3 text-center text-xl font-bold">
        {profile.displayName}
      </h1>
      {profile.bio && (
        <p className="text-dark-grey mt-2 text-center font-bold">
          {profile.bio}
        </p>
      )}
      <ul className="mt-12 flex w-full flex-col gap-5">
        {profile.links.map((link) => (
          <li key={link.url}>
            <Link
              className="rounded-4xl focus:outline-purple block bg-black px-16 py-4 text-center font-bold tracking-wide text-white hover:bg-black/90 focus:outline-2"
              href={link.url}
              variant="unstyled"
              newTab
            >
              {link.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export const getFromAuthenticatedProfile = ({
  id,
  username,
  avatarUrl,
  displayName,
  bio,
  seoDescription,
  seoTitle,
  links,
}: AuthenticatedProfile): PublicProfile => ({
  id,
  username,
  avatarUrl,
  displayName,
  bio,
  seoDescription,
  seoTitle,
  links: links
    .filter((link) => link.isPublic)
    .map<PublicLink>(({ id, title, url, displayOrder }) => ({
      id,
      title,
      url,
      displayOrder,
    })),
});
