import { api } from "@/hooks/use-axios";

import type {
    UserProfile,
    ProfileUpdateRequest,
} from "@/types/profile";

export const getUserProfile = async (): Promise<UserProfile> => {
    const { data } = await api.get("/profiles/me");
    return data;
};

export const getProfileByWallet = async (
    walletAddress: string
): Promise<UserProfile> => {
    const { data } = await api.get(`/profiles/${walletAddress}`);
    return data;
};

export const createOrUpdateUserProfile = async (
    profileData: ProfileUpdateRequest
): Promise<UserProfile> => {
    const { data } = await api.put("/profiles/me", profileData);
    return data;
};

// Keep backward compatibility
export const updateUserProfile = createOrUpdateUserProfile;