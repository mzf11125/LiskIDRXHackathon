"use client"

import { useState, useEffect } from "react"

interface AnimatedNumberProps {
  value: number
  duration?: number
  formatOptions?: Intl.NumberFormatOptions
  className?: string
  prefix?: string
  suffix?: string
}

export default function AnimatedNumber({
  value,
  duration = 2000,
  formatOptions = {},
  className = "",
  prefix = "",
  suffix = "",
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    let startTimestamp: number | null = null
    let animationFrameId: number

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / duration, 1)
      setDisplayValue(Math.floor(progress * value))

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step)
      }
    }

    animationFrameId = window.requestAnimationFrame(step)

    return () => {
      window.cancelAnimationFrame(animationFrameId)
    }
  }, [value, duration])

  const formattedValue = new Intl.NumberFormat(undefined, formatOptions).format(displayValue)

  return (
    <span className={className}>
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  )
}
