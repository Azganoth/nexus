import { jest } from "@jest/globals";

export const spyConsoleError = () =>
  jest.spyOn(console, "error").mockImplementation(() => {});

export const spyFetch = () => jest.spyOn(window, "fetch");
