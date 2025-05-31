"use client";

import { useEffect } from "react";
import axios, { AxiosInstance } from "axios";

// Create a custom axios instance
export const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Track interceptors for cleanup
let requestInterceptor: number | null = null;
let responseInterceptor: number | null = null;

// Function to setup interceptors without React hooks
export function setupAxiosInterceptors() {
  // Remove existing interceptors if they exist
  if (requestInterceptor !== null) {
    api.interceptors.request.eject(requestInterceptor);
  }
  if (responseInterceptor !== null) {
    api.interceptors.response.eject(responseInterceptor);
  }

  // Add a request interceptor
  requestInterceptor = api.interceptors.request.use(
    (config) => {
      // Try to get the token from localStorage
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("access_token");
        // If token exists, add it to the headers
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Add a response interceptor
  responseInterceptor = api.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      // Handle common error responses
      if (error.response?.status === 401 && typeof window !== "undefined") {
        // Clear token and redirect to login if needed
        localStorage.removeItem("access_token");
      }
      return Promise.reject(error);
    }
  );
}

// Initialize interceptors immediately for non-React usage
if (typeof window !== "undefined") {
  setupAxiosInterceptors();
}

// React hook version for components that need to manage interceptors
export function useAxios() {
  useEffect(() => {
    setupAxiosInterceptors();
    // No need to return cleanup function since we're reusing the same interceptors
    // The interceptors will be replaced rather than removed when the component remounts
  }, []);

  return api;
}

export default useAxios;
