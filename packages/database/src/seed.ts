import bcrypt from "bcrypt";
import { prisma, type ConsentLog, type Role } from ".";

const users: {
  email: string;
  password: string;
  name: string;
  role: Role;
  consents: { type: ConsentLog["type"]; granted: boolean }[];
  profile: {
    username: string;
    displayName: string;
    avatarUrl: string;
    bio?: string;
    seoTitle?: string;
    seoDescription?: string;
    isPublic?: boolean;
    links: {
      title: string;
      url: string;
      displayOrder: number;
      isPublic?: boolean;
    }[];
  };
}[] = [
  {
    email: "alice@example.com",
    password: "password123",
    name: "Alice Ferreira",
    role: "USER",
    consents: [
      { type: "TERMS_OF_SERVICE", granted: true },
      { type: "PRIVACY_POLICY", granted: true },
      { type: "NECESSARY_COOKIES", granted: true },
      { type: "ANALYTICS_COOKIES", granted: true },
      { type: "THIRD_PARTY_COOKIES", granted: true },
    ],
    profile: {
      username: "alice",
      displayName: "Alice Ferreira",
      avatarUrl:
        "https://pub-f4942703ba94414ab97ca08e29bff222.r2.dev/20250529_0104_Cosplay%20as%20Akali_01jwd39tvhex09ep5908b2q9yt.webp",
      bio: "Professional cosplayer specializing in anime and game characters. Crafting detailed costumes since 2015.",
      seoTitle: "Alice's Cosplay Creations",
      seoDescription:
        "Professional cosplayer showcasing elaborate costume builds and convention appearances",
      links: [
        {
          title: "Instagram",
          url: "https://instagram.com/alice.cosplay",
          displayOrder: 1,
        },
        {
          title: "TikTok",
          url: "https://tiktok.com/@alice.cosplay",
          displayOrder: 3,
        },
        {
          title: "Con Schedule",
          url: "https://alicecosplay.com/events",
          displayOrder: 5,
        },
        {
          title: "Patreon",
          url: "https://patreon.com/alicecosplay",
          displayOrder: 2,
        },
        {
          title: "Commission Info",
          url: "https://alicecosplay.com/commissions",
          displayOrder: 4,
        },
      ],
    },
  },
  {
    email: "sarah@example.com",
    password: "password123",
    name: "Sarah Johnson",
    role: "USER",
    consents: [
      { type: "TERMS_OF_SERVICE", granted: true },
      { type: "PRIVACY_POLICY", granted: true },
      { type: "NECESSARY_COOKIES", granted: true },
    ],
    profile: {
      username: "sarah_creator",
      displayName: "Sarah J",
      avatarUrl:
        "https://pub-f4942703ba94414ab97ca08e29bff222.r2.dev/sarah.webp",
      bio: "Digital artist and photographer creating vibrant works",
      seoTitle: "Sarah's Creative Portfolio",
      seoDescription: "Explore Sarah's artwork and photography projects",
      links: [
        {
          title: "Portfolio",
          url: "https://sarahs-art.com",
          displayOrder: 1,
        },
        {
          title: "Instagram",
          url: "https://instagram.com/sarah.art",
          displayOrder: 2,
        },
        {
          title: "Shop",
          url: "https://etsy.com/shop/sarahcreates",
          displayOrder: 3,
        },
      ],
    },
  },
  {
    email: "mike@example.com",
    password: "mikepass456",
    name: "Mike Chen",
    role: "USER",
    consents: [
      { type: "TERMS_OF_SERVICE", granted: true },
      { type: "PRIVACY_POLICY", granted: true },
      { type: "NECESSARY_COOKIES", granted: true },
      { type: "ANALYTICS_COOKIES", granted: false },
      { type: "THIRD_PARTY_COOKIES", granted: false },
    ],
    profile: {
      username: "mike_tech",
      displayName: "Mike C",
      avatarUrl: "https://ui-avatars.com/api/?name=Mike+Chen",
      bio: "Software engineer and tech blogger sharing knowledge",
      links: [
        {
          title: "GitHub",
          url: "https://github.com/mike-tech",
          displayOrder: 1,
        },
        {
          title: "Blog",
          url: "https://mikestechblog.com",
          displayOrder: 3,
        },
        {
          title: "Twitter",
          url: "https://twitter.com/mike_tech",
          displayOrder: 2,
        },
      ],
    },
  },
  {
    email: "alex@example.com",
    password: "alexpass789",
    name: "Alex Wong",
    role: "USER",
    consents: [
      { type: "TERMS_OF_SERVICE", granted: true },
      { type: "PRIVACY_POLICY", granted: true },
    ],
    profile: {
      username: "alex_fitness",
      displayName: "Alex W",
      avatarUrl: "https://ui-avatars.com/api/?name=Alex+Wong",
      bio: "Certified personal trainer and nutrition coach",
      seoTitle: "Alex's Fitness Journey",
      seoDescription: "Workout plans and nutrition guides",
      links: [],
    },
  },
  {
    email: "jasmine@example.com",
    password: "jasminepass",
    name: "Jasmine Lee",
    role: "USER",
    consents: [],
    profile: {
      username: "jasmine_travels",
      displayName: "Jasmine L",
      avatarUrl: "https://ui-avatars.com/api/?name=Jasmine+Lee",
      bio: "Travel blogger exploring hidden gems worldwide",
      seoTitle: "Jasmine's Travel Adventures",
      seoDescription: "Discover off-the-beaten-path destinations",
      isPublic: false,
      links: [
        {
          title: "Blog",
          url: "https://jasmine-travels.com",
          displayOrder: 2,
        },
        {
          title: "Travel Tips",
          url: "https://jasmine-travels.com/tips",
          displayOrder: 1,
          isPublic: false,
        },
      ],
    },
  },
];

(async () => {
  try {
    for (const { email, password, name, role, consents, profile } of users) {
      await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
          email,
          password: await bcrypt.hash(password, 10),
          name,
          role,
          consentLogs: {
            createMany: {
              data: consents.map(({ type, granted }) => ({
                type: type,
                action: granted ? "GRANT" : "REVOKE",
              })),
            },
          },
          profile: {
            create: {
              username: profile.username,
              displayName: profile.displayName,
              avatarUrl: profile.avatarUrl,
              bio: profile.bio,
              seoTitle: profile.seoTitle,
              seoDescription: profile.seoDescription,
              isPublic: profile.isPublic,
              links: {
                create: profile.links.map((link) => ({
                  title: link.title,
                  url: link.url,
                  displayOrder: link.displayOrder,
                  isPublic: link.isPublic,
                })),
              },
            },
          },
        },
      });

      console.log(`Created user: ${name} (${email})`);
    }

    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
