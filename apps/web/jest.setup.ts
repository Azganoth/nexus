import { jest } from "@jest/globals";
import "@testing-library/jest-dom/jest-globals";
import { MotionGlobalConfig } from "motion";
import { createElement } from "react";
import "whatwg-fetch";

MotionGlobalConfig.skipAnimations = true;

jest.mock("$/lib/env", () => ({}));
jest.mock("$/lib/constants", () => ({
  ...(jest.requireActual("$/lib/constants") as object),
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

// Mocks for JSDOM
HTMLDialogElement.prototype.showModal = function () {
  this.open = true;
};
HTMLDialogElement.prototype.close = function () {
  this.open = false;
};

Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  configurable: true,
  value: class {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  },
});
