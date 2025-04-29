import { pathsToModuleNameMapper } from "ts-jest";
import tsconfig from "./tsconfig.json" with { type: "json" };

/** @type {import('jest').Config} */
const config = {
  roots: ["<rootDir>"],
  preset: "ts-jest",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testMatch: ["**/?(*.)+(spec|test).[jt]s?(x)"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  moduleFileExtensions: ["ts", "js", "json", "node"],
  moduleNameMapper: pathsToModuleNameMapper(tsconfig.compilerOptions.paths, {
    prefix: "<rootDir>",
  }),
};

export default config;
