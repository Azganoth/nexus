import { fakerPT_BR as faker } from "@faker-js/faker";
import type { Link, Profile, RefreshToken, User } from "@repo/database";

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
  id: faker.number.int(),
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
  profileId: number,
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
