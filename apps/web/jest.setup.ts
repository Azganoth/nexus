import { jest } from "@jest/globals";
import "@testing-library/jest-dom/jest-globals";
import { createElement } from "react";
import "whatwg-fetch";

jest.mock("$/lib/constants", () => ({
  __esModule: true,
  IS_SERVER: false,
  API_URL: "http://localhost:3000",
  WEB_URL: "http://localhost:3002",
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: jest.fn((props) => {
    // @ts-expect-error Irrelevant
    return createElement("img", props);
  }),
}));
