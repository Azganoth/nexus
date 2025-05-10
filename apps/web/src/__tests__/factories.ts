import type {
  ApiResponse,
  PublicProfile,
  PublicUser,
} from "@repo/shared/contracts";

export const createTestPublicUser = (
  overrides?: Partial<PublicUser>,
): PublicUser => ({
  id: "dc8d7c75-b500-4500-bb21-b0cc2a4ead41",
  email: "test@example.com",
  name: "Test Example",
  role: "USER",
  ...overrides,
});

export const createTestPublicProfile = (
  overrides?: Partial<PublicProfile>,
): PublicProfile => ({
  id: "1b161016-4a87-4b4f-849c-4b3708459149",
  displayName: "Alice Ferreira",
  username: "alice",
  avatarUrl: "https://example.com/avatar.png",
  bio: "Professional cosplayer and content creator.",
  seoTitle: "Alice's Cosplay Creations",
  seoDescription:
    "Professional cosplayer showcasing elaborate costume builds and convention appearances",
  isPublic: true,
  createdAt: new Date("2025-05-07T20:50:23.818Z"),
  updatedAt: new Date("2025-06-07T20:50:23.818Z"),
  links: [
    {
      id: 1,
      title: "Instagram",
      url: "https://instagram.com/alice",
      displayOrder: 1,
      isPublic: true,
      createdAt: new Date("2025-05-07T20:50:23.818Z"),
      updatedAt: new Date("2025-05-07T20:50:23.818Z"),
    },
    {
      id: 3,
      title: "Patreon",
      url: "https://patreon.com/alice",
      displayOrder: 2,
      isPublic: true,
      createdAt: new Date("2025-05-07T20:50:23.818Z"),
      updatedAt: new Date("2025-05-07T20:50:23.818Z"),
    },
  ],
  ...overrides,
});

export const createTestApiResponse = (status: number, response: ApiResponse) =>
  new Response(JSON.stringify(response), { status });
