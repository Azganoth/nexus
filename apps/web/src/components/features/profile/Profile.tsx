import { Link } from "$/components/ui/Link";
import type {
  AuthenticatedProfile,
  PublicLink,
  PublicProfile,
} from "@repo/shared/contracts";
import Image from "next/image";

interface ProfileProps {
  profile: PublicProfile;
}

export function Profile({ profile }: ProfileProps) {
  return (
    <section className="flex min-h-[500px] min-w-[300px] max-w-[400px] flex-col items-center">
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
        <p className="text-comet mt-2 text-center font-semibold">
          {profile.bio}
        </p>
      )}
      <ul className="mt-12 w-full space-y-4">
        {profile.links.map((link, index) => (
          <li
            key={link.url}
            className="animate-fade-in-slide-up"
            style={{ animationDelay: `${index * 200}ms` }}
          >
            <Link
              className="rounded-4xl focus:outline-purple bg-charcoal hover:bg-charcoal/90 block px-16 py-4 text-center font-bold tracking-wide text-white transition-all hover:-translate-y-1 hover:shadow-lg focus:-translate-y-1 focus:outline-2"
              href={link.url}
              variant="none"
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
