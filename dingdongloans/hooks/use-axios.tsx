"use client";

import { useEffect } from "react";
import axios, { AxiosInstance } from "axios";

// Create a custom axios instance
export const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export function useAxios() {
  useEffect(() => {
    // Add a request interceptor
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        // Try to get the token from localStorage
        const token = localStorage.getItem("access_token");

        // If token exists, add it to the headers
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add a response interceptor
    const responseInterceptor = api.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        // Handle common error responses
        if (error.response?.status === 401) {
          // Clear token and redirect to login if needed
          localStorage.removeItem("access_token");
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptors on unmount
    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  return api;
}

export default useAxios;
