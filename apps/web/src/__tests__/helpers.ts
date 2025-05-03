import { jest } from "@jest/globals";

export const spyConsole = (
  method: "error" | "warn" | "log",
  expectedArgs?: "any" | unknown[],
) => {
  const defaultConsole = console[method];
  return jest.spyOn(console, method).mockImplementation((...args) => {
    const shouldSilence =
      expectedArgs &&
      (expectedArgs === "any" ||
        expectedArgs.some((silencer) => silencer === args[0]));

    if (!shouldSilence) {
      defaultConsole(...args);
    }
  });
};

export const spyFetch = () => jest.spyOn(window, "fetch");
