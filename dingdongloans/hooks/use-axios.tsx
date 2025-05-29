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
		const interceptor = api.interceptors.request.use(
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

		// Cleanup interceptor on unmount
		return () => {
			api.interceptors.request.eject(interceptor);
		};
	}, []);

	return api;
}

export default useAxios;
