import { createRandomUser } from "$/__tests__/factories";
import { selectData } from "$/__tests__/helpers";
import { mockPrisma } from "$/__tests__/mocks";
import { PUBLIC_USER_SELECT } from "$/constants";
import { deleteUser, getUserById, updateUser } from "$/services/user.service";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { User } from "@repo/database";
import bcrypt from "bcrypt";

jest.mock("bcrypt");

const mockBcrypt = jest.mocked(bcrypt);

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

  describe("updateUser", () => {
    it("should successfully update an user's name", async () => {
      const updateData = { name: "Novo nome" };
      const updatedUser = { ...mockPublicUser, ...updateData };
      mockPrisma.user.update.mockResolvedValue(updatedUser as User);

      const result = await updateUser(mockUser.id, updateData);

      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockUser.id },
          data: updateData,
        }),
      );
      expect(result.name).toBe(updateData.name);
    });
  });

  describe("deleteUser", () => {
    it("should successfully delete the user if the password is correct", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockImplementation(async () => true);
      mockPrisma.user.delete.mockResolvedValue(mockUser);

      await expect(
        deleteUser(mockUser.id, "correct_password"),
      ).resolves.toBeUndefined();
      expect(mockPrisma.user.delete).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
    });

    it("should throw ApiError if the password is incorrect", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockImplementation(async () => false);

      await expect(
        deleteUser(mockUser.id, "wrong_password"),
      ).rejects.toThrowValidationError({
        password: ["A senha está incorreta."],
      });
      expect(mockPrisma.user.delete).not.toHaveBeenCalled();
    });

    it("should throw ApiError if the user is not found", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(
        deleteUser("non_existent_id", "any_password"),
      ).rejects.toThrowApiError(404, "NOT_FOUND");
    });
  });
});
