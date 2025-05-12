import { jest } from "@jest/globals";
import {
  render,
  renderHook,
  type RenderHookOptions,
  type RenderOptions,
} from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { SWRConfig } from "swr";

export const spyFetch = () => jest.spyOn(window, "fetch");

export const TestSWRWrapper = ({ children }: { children: ReactNode }) => (
  <SWRConfig
    value={{
      provider: () => new Map(),
      dedupingInterval: 0,
      focusThrottleInterval: 0,
      errorRetryCount: 0,
      errorRetryInterval: 0,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }}
  >
    {children}
  </SWRConfig>
);

export const renderWithSWR = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) => {
  return render(ui, {
    wrapper: TestSWRWrapper,
    ...options,
  });
};

export const renderHookWithSWR = <Props, Result>(
  hook: (props: Props) => Result,
  options?: Omit<RenderHookOptions<Props>, "wrapper">,
) => {
  return renderHook(hook, {
    wrapper: TestSWRWrapper,
    ...options,
  });
};

export const mockedHook = <T extends () => unknown>(hook: T) =>
  jest.mocked(hook) as jest.Mocked<() => Partial<ReturnType<T>>>;
