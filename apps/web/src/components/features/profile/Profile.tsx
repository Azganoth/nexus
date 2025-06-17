"use client";

import { Link } from "$/components/ui/Link";
import type {
  AuthenticatedProfile,
  PublicLink,
  PublicProfile,
} from "@repo/shared/contracts";
import {
  AnimatePresence,
  motion,
  stagger,
  type Transition,
  type Variants,
} from "motion/react";
import Image from "next/image";

const avatarVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
  },
};

const avatarTransition: Transition = {
  type: "spring",
  bounce: 0.6,
};

const linkListVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: stagger(0.1),
    },
  },
};

const linkVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -16,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -16,
  },
};

interface ProfileProps {
  profile: PublicProfile;
}

export function Profile({ profile }: ProfileProps) {
  return (
    <section className="flex min-h-[500px] min-w-[300px] max-w-[400px] flex-col items-center">
      <motion.div
        variants={avatarVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        transition={avatarTransition}
      >
        <Image
          className="rounded-full"
          width={128}
          height={128}
          src={profile.avatarUrl}
          alt=""
          priority
        />
      </motion.div>
      <h1 className="mt-3 text-center text-xl font-bold">
        {profile.displayName}
      </h1>
      {profile.bio && (
        <p className="text-comet mt-2 text-center font-semibold">
          {profile.bio}
        </p>
      )}
      <motion.ul
        className="mt-12 w-full space-y-4"
        variants={linkListVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence>
          {profile.links.map((link) => (
            <motion.li key={link.url} variants={linkVariants} layout>
              <Link
                className="rounded-4xl focus:outline-purple bg-charcoal hover:bg-charcoal/90 block px-16 py-4 text-center font-bold tracking-wide text-white transition-all hover:-translate-y-1 hover:shadow-lg focus:-translate-y-1 focus:outline-2"
                href={link.url}
                variant="none"
                newTab
              >
                {link.title}
              </Link>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
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
