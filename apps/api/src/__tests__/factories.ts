import { fakerPT_BR as faker } from "@faker-js/faker";
import type {
  ConsentLog,
  Link,
  PasswordResetToken,
  Profile,
  RefreshToken,
  User,
} from "@repo/database";

export const createRandomUser = (overrides?: Partial<User>): User => ({
  id: faker.string.uuid(),
  email: faker.internet.email(),
  password: faker.internet.password(),
  name: faker.person.fullName(),
  role: "USER",
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  ...overrides,
});

export const createRandomProfile = (
  userId: string,
  overrides?: Partial<Profile>,
): Profile => ({
  id: faker.string.uuid(),
  userId: userId,
  username: faker.internet.username(),
  displayName: faker.person.fullName(),
  avatarUrl: faker.image.avatar(),
  bio: faker.lorem.sentence(),
  seoTitle: faker.lorem.words(3),
  seoDescription: faker.lorem.sentence(),
  isPublic: faker.datatype.boolean(),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  ...overrides,
});

export const createRandomLink = (
  profileId: string,
  overrides?: Partial<Link>,
): Link => ({
  id: faker.number.int(),
  profileId: profileId,
  title: faker.lorem.words(3),
  url: faker.internet.url(),
  displayOrder: faker.number.int({ min: 1, max: 10 }),
  isPublic: faker.datatype.boolean(),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  ...overrides,
});

export type ProfileWithLinks = Profile & { links: Link[] };

export const createRandomProfileWithLinks = (
  userId: string,
  linkCount = 3,
  overrides?: Partial<Profile>,
): ProfileWithLinks => {
  const profile = createRandomProfile(userId, overrides);
  const links = Array.from({ length: linkCount }, () =>
    createRandomLink(profile.id),
  );

  return {
    ...profile,
    links,
  };
};

export const createRandomConsentLog = (
  userId: string,
  overrides?: Partial<ConsentLog>,
): ConsentLog => ({
  id: faker.string.uuid(),
  userId: userId,
  type: faker.helpers.arrayElement([
    "TERMS_OF_SERVICE",
    "PRIVACY_POLICY",
    "ANALYTICS_COOKIES",
    "NECESSARY_COOKIES",
    "THIRD_PARTY_COOKIES",
  ]),
  action: faker.helpers.arrayElement(["GRANT", "REVOKE"]),
  ipAddress: faker.internet.ip(),
  userAgent: faker.internet.userAgent(),
  version: "1.0",
  createdAt: faker.date.past(),
  ...overrides,
});

export const createRandomConsentLogs = (
  userId: string,
  count = 3,
  overrides?: Partial<ConsentLog>,
): ConsentLog[] => {
  return Array.from({ length: count }, () =>
    createRandomConsentLog(userId, overrides),
  );
};

export const createRandomRefreshToken = (
  userId: string,
  overrides?: Partial<RefreshToken>,
): RefreshToken => ({
  id: faker.number.int(),
  token: faker.string.uuid(),
  userId: userId,
  expiresAt: faker.date.future(),
  createdAt: faker.date.past(),
  ...overrides,
});

export const createRandomPasswordResetToken = (
  userId: string,
  overrides?: Partial<PasswordResetToken>,
): PasswordResetToken => ({
  id: faker.number.int(),
  token: faker.string.hexadecimal({ length: 64, prefix: "" }),
  userId: userId,
  expiresAt: faker.date.future({ years: 0.01 }),
  createdAt: faker.date.past(),
  ...overrides,
});
