import { createRandomUser } from "$/__tests__/factories";
import { selectData } from "$/__tests__/helpers";
import { mockPrisma } from "$/__tests__/mocks";
import { PUBLIC_USER_SELECT } from "$/constants";
import { getUserById } from "$/services/user.service";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { User } from "@repo/database";

describe("User Service", () => {
  const mockUser = createRandomUser();
  const mockPublicUser = selectData(mockUser, PUBLIC_USER_SELECT);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getUserById", () => {
    it("should fetch a user by ID and select only public fields", async () => {
      mockPrisma.user.findUniqueOrThrow.mockResolvedValue(
        mockPublicUser as User,
      );

      const user = await getUserById(mockUser.id);

      expect(mockPrisma.user.findUniqueOrThrow).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockUser.id },
        }),
      );
      expect(user).toEqual(mockPublicUser);
    });

    it("should throw if Prisma's findUniqueOrThrow throws", async () => {
      const dbError = new Error("User not found");
      mockPrisma.user.findUniqueOrThrow.mockRejectedValue(dbError);

      await expect(getUserById("non-existent-id")).rejects.toThrow(dbError);
    });
  });
});
