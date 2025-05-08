import {
  createRandomLink,
  createRandomProfileWithLinks,
  createRandomUser,
} from "$/__tests__/factories";
import { selectData } from "$/__tests__/helpers";
import { mockPrisma } from "$/__tests__/mocks";
import { PUBLIC_LINK_SELECT, PUBLIC_USER_SELECT } from "$/constants";
import { createServer } from "$/server";
import {
  createLinkForUser,
  deleteUserLink,
  getLinksForUser,
  updateUserLink,
} from "$/services/link.service";
import { ApiError } from "$/utils/errors";
import { signAccessToken } from "$/utils/jwt";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { Link, User } from "@repo/database";
import type { Express } from "express";
import supertest from "supertest";

jest.mock("$/services/link.service");

const mockGetLinksForUser = jest.mocked(getLinksForUser);
const mockCreateLinkForUser = jest.mocked(createLinkForUser);
const mockUpdateUserLink = jest.mocked(updateUserLink);
const mockDeleteUserLink = jest.mocked(deleteUserLink);

describe("Link Controller", () => {
  let app: Express;
  const mockUser = createRandomUser();
  const mockPublicUser = selectData(mockUser, PUBLIC_USER_SELECT);
  const mockProfile = createRandomProfileWithLinks(mockUser.id);
  const mockLink = createRandomLink(mockProfile.id);
  const mockPublicLink = selectData(mockLink, PUBLIC_LINK_SELECT);
  const mockAccessToken = signAccessToken(mockUser.id, mockUser.role);

  beforeEach(() => {
    jest.clearAllMocks();
    app = createServer();
  });

  describe("GET /links", () => {
    it("should successfully return an array of links for an authenticated user", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockPublicUser as User);
      mockGetLinksForUser.mockResolvedValue(mockProfile.links);

      const response = await supertest(app)
        .get("/links")
        .set("Authorization", `Bearer ${mockAccessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(mockProfile.links.length);
      expect(mockGetLinksForUser).toHaveBeenCalledWith(mockUser.id);
    });

    it("should successfully return an empty array if the user has no links", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockPublicUser as User);
      mockGetLinksForUser.mockResolvedValue([]);

      const response = await supertest(app)
        .get("/links")
        .set("Authorization", `Bearer ${mockAccessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });

    it("should return 401 if unauthenticated", async () => {
      const response = await supertest(app).get("/links");
      expect(response.status).toBe(401);
    });
  });

  describe("POST /links", () => {
    it("should successfully create a new link", async () => {
      const newData = selectData(mockPublicLink, {
        title: true,
        url: true,
      });
      mockPrisma.user.findUnique.mockResolvedValue(mockPublicUser as User);
      mockCreateLinkForUser.mockResolvedValue(mockPublicLink as Link);

      const response = await supertest(app)
        .post("/links")
        .set("Authorization", `Bearer ${mockAccessToken}`)
        .send(newData);

      expect(response.status).toBe(201);
      expect(response.body.data.title).toEqual(mockPublicLink.title);
      expect(response.body.data.url).toEqual(mockPublicLink.url);
      expect(mockCreateLinkForUser).toHaveBeenCalledWith(mockUser.id, newData);
    });

    it("should return 401 if unauthenticated", async () => {
      const response = await supertest(app).post("/links").send({});
      expect(response.status).toBe(401);
    });

    it("should return 422 for invalid data", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockPublicUser as User);

      const response = await supertest(app)
        .post("/links")
        .set("Authorization", `Bearer ${mockAccessToken}`)
        .send({ title: "No URL" });

      expect(response.status).toBe(422);
      expect(response.body.status).toBe("fail");
    });

    it("should return 403 if the link limit is reached", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockPublicUser as User);
      const error = new ApiError(403, "TOO_MANY_LINKS");
      mockCreateLinkForUser.mockRejectedValue(error);
      const response = await supertest(app)
        .post("/links")
        .set("Authorization", `Bearer ${mockAccessToken}`)
        .send({ title: "A Valid Title", url: "https://example.com" });

      expect(response.status).toBe(403);
      expect(response.body.code).toBe(error.code);
    });
  });

  describe("PATCH /links/:id", () => {
    it("should successfully update and return the updated link", async () => {
      const updatedData = selectData(mockPublicLink, {
        title: true,
      });
      mockPrisma.user.findUnique.mockResolvedValue(mockPublicUser as User);
      mockUpdateUserLink.mockResolvedValue(mockPublicLink);

      const response = await supertest(app)
        .patch(`/links/${mockPublicLink.id}`)
        .set("Authorization", `Bearer ${mockAccessToken}`)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body.data.title).toEqual(mockPublicLink.title);
      expect(mockUpdateUserLink).toHaveBeenCalledWith(
        mockUser.id,
        mockPublicLink.id,
        updatedData,
      );
    });

    it("should return 404 if the link is not found or not owned by the user", async () => {
      const error = new ApiError(404, "NOT_FOUND");
      mockUpdateUserLink.mockRejectedValue(error);
      mockPrisma.user.findUnique.mockResolvedValue(mockPublicUser as User);

      const response = await supertest(app)
        .patch("/links/999")
        .set("Authorization", `Bearer ${mockAccessToken}`)
        .send({ title: "Link qualquer" });

      expect(response.status).toBe(404);
      expect(response.body.code).toBe(error.code);
    });
  });

  describe("DELETE /links/:id", () => {
    it("should successfully delete the link", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockPublicUser as User);
      mockDeleteUserLink.mockResolvedValue(undefined);

      const response = await supertest(app)
        .delete(`/links/${mockLink.id}`)
        .set("Authorization", `Bearer ${mockAccessToken}`);

      expect(response.status).toBe(204);
      expect(mockDeleteUserLink).toHaveBeenCalledWith(
        mockUser.id,
        mockPublicLink.id,
      );
    });

    it("should return 401 if unauthenticated", async () => {
      const response = await supertest(app).delete("/links/999");
      expect(response.status).toBe(401);
    });
  });
});
