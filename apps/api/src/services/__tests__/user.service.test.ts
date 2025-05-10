import { createRandomUser } from "$/__tests__/factories";
import { selectData } from "$/__tests__/helpers";
import { mockPrisma } from "$/__tests__/mocks";
import { AUTHENTICATED_USER_SELECT } from "$/constants";
import { deleteUser, updateUser } from "$/services/user.service";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { User } from "@repo/database";
import bcrypt from "bcrypt";

jest.mock("bcrypt");

const mockBcrypt = jest.mocked(bcrypt);

describe("User Service", () => {
  const mockUser = createRandomUser();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("updateUser", () => {
    it("updates an user's name", async () => {
      const updateData = { name: "Novo nome" };
      const updatedUser = {
        ...selectData(mockUser, AUTHENTICATED_USER_SELECT),
        ...updateData,
      };
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
    it("deletes the user if the password is correct", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(
        selectData(mockUser, { password: true }) as User,
      );
      mockBcrypt.compare.mockImplementation(async () => true);

      await expect(
        deleteUser(mockUser.id, "correct_password"),
      ).resolves.toBeUndefined();
      expect(mockPrisma.user.delete).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
    });

    it("should throw ApiError if the password is incorrect", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(
        selectData(mockUser, { password: true }) as User,
      );
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
