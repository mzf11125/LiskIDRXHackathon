import { AxiosError } from "axios"
import { toast } from "@/components/ui/use-toast"

export function handleApiError(error: unknown, customMessage?: string): string {
  console.error("API Error:", error)

  // Default error message
  let errorMessage = customMessage || "An unexpected error occurred. Please try again."

  if (error instanceof AxiosError) {
    // Handle Axios errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const data = error.response.data

      if (data && data.message) {
        errorMessage = data.message
      } else if (data && data.error) {
        errorMessage = data.error
      } else if (error.response.status === 401) {
        errorMessage = "Authentication failed. Please reconnect your wallet."
        // Clear auth token if unauthorized
        localStorage.removeItem("auth_token")
      } else if (error.response.status === 403) {
        errorMessage = "You don't have permission to perform this action."
      } else if (error.response.status === 404) {
        errorMessage = "The requested resource was not found."
      } else if (error.response.status >= 500) {
        errorMessage = "Server error. Please try again later."
      }
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage = "No response from server. Please check your internet connection."
    }
  } else if (error instanceof Error) {
    errorMessage = error.message
  }

  // Show toast notification for the error
  toast({
    variant: "destructive",
    title: "Error",
    description: errorMessage,
  })

  return errorMessage
}
