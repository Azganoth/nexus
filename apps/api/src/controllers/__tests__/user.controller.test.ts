import { createRandomUser } from "$/__tests__/factories";
import { selectData } from "$/__tests__/helpers";
import { mockPrisma } from "$/__tests__/mocks";
import { AUTHENTICATED_USER_SELECT } from "$/constants";
import { createServer } from "$/server";
import { deleteUser, updateUser } from "$/services/user.service";
import { ValidationError } from "$/utils/errors";
import { signAccessToken } from "$/utils/jwt";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { User } from "@repo/database";
import type { Express } from "express";
import supertest from "supertest";

jest.mock("$/services/user.service");

const mockUpdateUser = jest.mocked(updateUser);
const mockDeleteUser = jest.mocked(deleteUser);

describe("User Controller", () => {
  let app: Express;
  const mockUser = createRandomUser();
  const mockAuthenticatedUser = selectData(mockUser, AUTHENTICATED_USER_SELECT);
  const mockAccessToken = signAccessToken(mockUser.id, mockUser.role);

  beforeEach(() => {
    jest.clearAllMocks();
    app = createServer();
  });

  describe("GET /users/me", () => {
    it("should return 401 if no token is provided", async () => {
      const response = await supertest(app).get("/users/me");
      expect(response.status).toBe(401);
    });

    it("returns the current user's data if the token is valid", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(
        mockAuthenticatedUser as User,
      );

      const response = await supertest(app)
        .get("/users/me")
        .set("Authorization", `Bearer ${mockAccessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe(mockAuthenticatedUser.name);
    });
  });

  describe("PATCH /users/me", () => {
    it("should return 401 if unauthenticated", async () => {
      const response = await supertest(app)
        .patch("/users/me")
        .send({ name: "New Name" });
      expect(response.status).toBe(401);
    });

    it("returns 200 and the updated user on success", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(
        mockAuthenticatedUser as User,
      );
      const updatedUser = { ...mockAuthenticatedUser, name: "New Name" };
      mockUpdateUser.mockResolvedValue(updatedUser);

      const response = await supertest(app)
        .patch("/users/me")
        .set("Authorization", `Bearer ${mockAccessToken}`)
        .send({ name: "New Name" });

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe("New Name");
      expect(mockUpdateUser).toHaveBeenCalledWith(mockUser.id, {
        name: "New Name",
      });
    });
  });

  describe("DELETE /users/me", () => {
    it("should return 401 if unauthenticated", async () => {
      const response = await supertest(app)
        .delete("/users/me")
        .send({ password: "123" });

      expect(response.status).toBe(401);
    });

    it("should return 422 if password is not provided", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(
        mockAuthenticatedUser as User,
      );

      const response = await supertest(app)
        .delete("/users/me")
        .set("Authorization", `Bearer ${mockAccessToken}`)
        .send({});

      expect(response.status).toBe(422);
    });

    it("should return 422 if the provided password is incorrect", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(
        mockAuthenticatedUser as User,
      );

      const error = new ValidationError({
        password: ["A senha está incorreta."],
      });
      mockDeleteUser.mockRejectedValue(error);

      const response = await supertest(app)
        .delete("/users/me")
        .set("Authorization", `Bearer ${mockAccessToken}`)
        .send({ password: "wrong_password" });

      expect(response.status).toBe(422);
    });

    it("deletes the user if the password is correct", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(
        mockAuthenticatedUser as User,
      );

      mockDeleteUser.mockResolvedValue(undefined);

      const response = await supertest(app)
        .delete("/users/me")
        .set("Authorization", `Bearer ${mockAccessToken}`)
        .send({ password: "correct_password" });

      expect(response.status).toBe(204);
      expect(mockDeleteUser).toHaveBeenCalledWith(
        mockUser.id,
        "correct_password",
      );
    });
  });
});
