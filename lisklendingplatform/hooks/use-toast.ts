"use client"

import {
  ToastActionElement,
  toast as showToast,
} from "@/components/ui/toast"

type ToastProps = {
  title?: string
  description?: string
  action?: ToastActionElement
  variant?: "default" | "destructive"
}

export const useToast = () => {
  const toast = ({ title, description, action, variant = "default" }: ToastProps) => {
    showToast({
      title,
      description,
      action,
      variant,
    })
  }

  return { toast }
}
