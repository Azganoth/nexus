import { toast } from "$/components/ui/Toast";
import { ERRORS } from "@repo/shared/constants";

export const composeTitle = (title: string) => `${title} | Nexus`;

export const unknownError = (error: unknown) => {
  console.error("Unexpected error:", error);

  const errorMessage =
    error instanceof Error ? error.message : ERRORS.UNEXPECTED_ERROR;

  toast.error(`${errorMessage} Tente novamente mais tarde.`, {
    duration: 5000,
  });
};

export const delayFor = async (ms: number) =>
  new Promise((res) => {
    setTimeout(res, ms);
  });

export const hangFor = async <T>(target: Promise<T>, ms: number) =>
  (await Promise.all([target, delayFor(ms)]))[0];

export const hashFileSHA256 = async (file: File | Blob): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);

  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};
