import { pathsToModuleNameMapper } from "ts-jest";
import tsconfig from "./tsconfig.json" with { type: "json" };

/** @type {import('jest').Config} */
const config = {
  roots: ["<rootDir>"],
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testMatch: ["**/?(*.)+(spec|test).[jt]s?(x)"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          jsx: "react-jsx",
        },
      },
    ],
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  moduleNameMapper: {
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "<rootDir>/src/__tests__/assetMock.ts",
    ...pathsToModuleNameMapper(tsconfig.compilerOptions.paths, {
      prefix: "<rootDir>",
    }),
  },
};

export default config;
