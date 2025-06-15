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
      username: "__alice",
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

  // Showcase profiles
  {
    email: "alex.riley.dev@example.com",
    password: "password123",
    name: "Alex Riley",
    role: "USER",
    consents: [
      { type: "TERMS_OF_SERVICE", granted: true },
      { type: "PRIVACY_POLICY", granted: true },
    ],
    profile: {
      username: "__pixel_dev",
      displayName: "Alex Riley",
      avatarUrl:
        "https://pub-f4942703ba94414ab97ca08e29bff222.r2.dev/avatars/1216843b-6c01-4161-b120-0d2b8f7357cd/290582426e394d5bdb299b1cb6da7a6b843498c17a21f92328c801c28f26fd68.webp",
      bio: "Full-stack developer crafting open-source tools. Turning coffee into clean code and building in public.",
      links: [
        {
          title: "GitHub",
          url: "https://github.com/__pixel_dev",
          displayOrder: 1,
        },
        {
          title: "Technical Blog",
          url: "https://__pixel_dev.blog",
          displayOrder: 2,
        },
        {
          title: "LinkedIn",
          url: "https://linkedin.com/in/__pixel_dev",
          displayOrder: 3,
        },
        {
          title: "Buy Me a Coffee",
          url: "https://buymeacoffee.com/__pixel_dev",
          displayOrder: 4,
        },
      ],
    },
  },
  {
    email: "cassie.wu.art@example.com",
    password: "password123",
    name: "Cassandra Wu",
    role: "USER",
    consents: [
      { type: "TERMS_OF_SERVICE", granted: true },
      { type: "PRIVACY_POLICY", granted: true },
    ],
    profile: {
      username: "__artemis_art",
      displayName: 'Cassandra "Cassie" Wu',
      avatarUrl:
        "https://pub-f4942703ba94414ab97ca08e29bff222.r2.dev/avatars/1216843b-6c01-4161-b120-0d2b8f7357cd/dd6369000900aa57a9b85fa9582b25bb8196e95bb5c30f2171fa2ec81cc94b01.webp",
      bio: "Illustrator & VTuber exploring digital realms. Join my streams for live art sessions and chaos!",
      links: [
        {
          title: "Twitch",
          url: "https://twitch.tv/__artemis_art",
          displayOrder: 1,
        },
        {
          title: "ArtStation Portfolio",
          url: "https://artstation.com/__artemis_art",
          displayOrder: 2,
        },
        {
          title: "Instagram",
          url: "https://instagram.com/__artemis_art",
          displayOrder: 3,
        },
        {
          title: "Patreon",
          url: "https://patreon.com/__artemis_art",
          displayOrder: 4,
        },
        {
          title: "Commissions Info",
          url: "https://__artemis_art.art/commissions",
          displayOrder: 5,
        },
      ],
    },
  },
  {
    email: "marco.diaz.pro@example.com",
    password: "password123",
    name: "Marco Diaz",
    role: "USER",
    consents: [
      { type: "TERMS_OF_SERVICE", granted: true },
      { type: "PRIVACY_POLICY", granted: true },
    ],
    profile: {
      username: "__market_maven",
      displayName: "Marco Diaz",
      avatarUrl:
        "https://pub-f4942703ba94414ab97ca08e29bff222.r2.dev/avatars/1216843b-6c01-4161-b120-0d2b8f7357cd/d31ff041cab2185dfd88244dee26a8138d988249cfffb50065d5f14cf0cf38fa.webp",
      bio: "Freelance growth marketer helping SaaS startups scale. Let's connect and build something amazing.",
      links: [
        {
          title: "Book a Consultation",
          url: "https://cal.com/__market_maven",
          displayOrder: 1,
        },
        {
          title: "My Portfolio",
          url: "https://__market_maven.pro/portfolio",
          displayOrder: 2,
        },
        {
          title: "Client Testimonials",
          url: "https://__market_maven.pro/testimonials",
          displayOrder: 3,
        },
        {
          title: "LinkedIn",
          url: "https://linkedin.com/in/__market_maven",
          displayOrder: 4,
        },
        {
          title: "Twitter / X",
          url: "https://twitter.com/__market_maven",
          displayOrder: 5,
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
