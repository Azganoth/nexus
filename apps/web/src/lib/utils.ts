import { toast } from "$/components/ui/Toast";
import { ERRORS } from "@repo/shared/constants";

export const composeTitle = (title: string) => `${title} | Nexus`;

export const unknownError = (error: unknown) => {
  console.error(error);
  toast.error(`${ERRORS.UNEXPECTED_ERROR} Tente novamente mais tarde.`, {
    duration: 5000,
  });
};

export const delayFor = async (ms: number) =>
  new Promise((res) => {
    setTimeout(res, ms);
  });

export const hangFor = async <T>(target: Promise<T>, ms: number) =>
  (await Promise.all([target, delayFor(ms)]))[0];
