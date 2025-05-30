"use client";

import axios, { AxiosInstance, AxiosError } from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

// Create axios instance
export const api: AxiosInstance = axios.create({
  baseURL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired
      localStorage.removeItem("access_token");
      // Trigger re-authentication if needed
      window.dispatchEvent(new CustomEvent("auth-token-expired"));
    }
    return Promise.reject(error);
  }
);

// Auto-update wallet profile function
export const updateWalletProfile = async (address: string) => {
  try {
    const timestamp = Date.now();
    const profileData = {
      display_name: `Test User ${timestamp}`,
      email: `testuser${timestamp}@example.com`,
      bio: "Auto-generated profile for proposal creation",
      avatar_url: "",
      phone: "",
      website: "https://example.com",
      social_media: {
        twitter: "",
        linkedin: "",
        telegram: ""
      },
      company_name: `Test Company ${timestamp}`,
      company_position: "CEO",
      company_website: "https://example.com",
      company_description: "A test company for API integration testing",
    };

    const response = await api.put("/profiles/me", profileData);
    console.log(`✓ Profile updated successfully for ${address}`);
    return response.data;
  } catch (error: any) {
    console.error(`× Failed to update profile: ${error.message}`);
    if (error.response) {
      console.error(`× Response: ${error.response.data}`);
    }
    return null;
  }
};

export default api;
