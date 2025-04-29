import { createRandomUser } from "$/__tests__/factories";
import { mockPrisma } from "$/__tests__/mocks";
import { getUserById } from "$/services/user.service";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { User } from "@repo/database";

describe("User Service", () => {
  const mockUser = createRandomUser();
  const mockPublicUser = {
    id: mockUser.id,
    email: mockUser.email,
    name: mockUser.name,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getUserById", () => {
    it("should fetch a user by ID and select only public fields", async () => {
      mockPrisma.user.findUniqueOrThrow.mockResolvedValue(
        mockPublicUser as User,
      );

      const result = await getUserById(mockUser.id);

      expect(mockPrisma.user.findUniqueOrThrow).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockUser.id },
        }),
      );
      expect(result).toEqual(mockPublicUser);
    });

    it("should throw if Prisma's findUniqueOrThrow throws", async () => {
      const dbError = new Error("User not found");
      mockPrisma.user.findUniqueOrThrow.mockRejectedValue(dbError);

      await expect(getUserById("non-existent-id")).rejects.toThrow(dbError);
    });
  });
});
