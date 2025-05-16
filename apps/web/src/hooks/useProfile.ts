import { apiClient } from "$/services/apiClient";
import type { ApiError } from "$/services/errors";
import type { AuthenticatedProfile } from "@repo/shared/contracts";
import type { UPDATE_PROFILE_SCHEMA } from "@repo/shared/schemas";
import useSWR from "swr";
import type { z } from "zod/v4";

const swrFetcher = (url: string) => apiClient.get<AuthenticatedProfile>(url);

export const useProfile = () => {
  const { data, error, isLoading, mutate } = useSWR<
    AuthenticatedProfile,
    ApiError
  >("/profiles/me", swrFetcher);

  const updateProfile = async (updateData: UpdateProfileData) => {
    if (!data) return;

    await mutate(
      apiClient.patch<AuthenticatedProfile>("/profiles/me", updateData),
      {
        optimisticData: { ...data, ...updateData },
        revalidate: false,
      },
    );
  };

  const updateLinkOrder = async (orderedIds: number[]) => {
    if (!data) return;

    await mutate(
      async () => {
        await apiClient.patch<void>("/links/order", { orderedIds });
        return mutate();
      },
      {
        optimisticData: {
          ...data,
          links: orderedIds.map(
            (id) => data.links.find((link) => link.id === id)!,
          ),
        },
        revalidate: false,
      },
    );
  };

  return {
    profile: data,
    updateProfile,
    updateLinkOrder,
    revalidateProfile: mutate,
    isProfileLoading: isLoading,
    profileError: error,
  };
};

export type UpdateProfileData = z.infer<typeof UPDATE_PROFILE_SCHEMA>;
