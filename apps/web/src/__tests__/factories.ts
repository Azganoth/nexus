import type { NonNullableObject } from "$/types";
import { fakerPT_BR as faker } from "@faker-js/faker";
import type {
  ApiResponse,
  AuthenticatedLink,
  AuthenticatedProfile,
  AuthenticatedUser,
  PublicLink,
  PublicProfile,
  Timestamps,
} from "@repo/shared/contracts";

export const createRandomTimestamps = (): Timestamps => ({
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
});

export const createRandomAuthenticatedUser = (
  overrides: Partial<AuthenticatedUser> = {},
): AuthenticatedUser => ({
  id: faker.string.uuid(),
  email: faker.internet.email(),
  name: faker.person.fullName(),
  role: "USER",
  ...createRandomTimestamps(),
  ...overrides,
});

export const createRandomPublicLink = (
  overrides: Partial<PublicLink> = {},
): PublicLink => ({
  id: faker.number.int(),
  title: faker.lorem.words(3),
  url: faker.internet.url(),
  displayOrder: faker.number.int({ min: 0, max: 10 }),
  ...overrides,
});

export const createRandomAuthenticatedLink = (
  overrides: Partial<AuthenticatedLink> = {},
): AuthenticatedLink => ({
  ...createRandomPublicLink(overrides),
  ...createRandomTimestamps(),
  isPublic: faker.datatype.boolean(0.9),
  ...overrides,
});

type CompletePublicProfile = NonNullableObject<
  PublicProfile,
  "bio" | "seoTitle" | "seoDescription"
>;

export const createRandomPublicProfile = (
  linkCount = 3,
  overrides: Partial<CompletePublicProfile> = {},
): CompletePublicProfile => {
  const links = Array.from({ length: linkCount }, () =>
    createRandomPublicLink(),
  );
  links.sort((a, b) => a.displayOrder - b.displayOrder);

  return {
    id: faker.string.uuid(),
    username: faker.internet.username(),
    displayName: faker.person.fullName(),
    avatarUrl: faker.image.avatar(),
    bio: faker.lorem.sentence(),
    seoTitle: faker.lorem.sentence(5),
    seoDescription: faker.lorem.sentence(15),
    links,
    ...overrides,
  };
};

type CompleteAuthenticatedProfile = NonNullableObject<
  AuthenticatedProfile,
  "bio" | "seoTitle" | "seoDescription"
>;

export const createRandomAuthenticatedProfile = (
  linkCount = 3,
  overrides: Partial<CompleteAuthenticatedProfile> = {},
): CompleteAuthenticatedProfile => {
  const links = Array.from({ length: linkCount }, () =>
    createRandomAuthenticatedLink(),
  );
  links.sort((a, b) => a.displayOrder - b.displayOrder);

  return {
    id: faker.string.uuid(),
    username: faker.internet.username(),
    displayName: faker.person.fullName(),
    avatarUrl: faker.image.avatar(),
    bio: faker.lorem.sentence(),
    seoTitle: faker.lorem.sentence(5),
    seoDescription: faker.lorem.sentence(15),
    links,
    isPublic: faker.datatype.boolean(0.9),
    ...createRandomTimestamps(),
    ...overrides,
  };
};

export const createTestApiResponse = (status: number, response: ApiResponse) =>
  new Response(JSON.stringify(response), { status });
