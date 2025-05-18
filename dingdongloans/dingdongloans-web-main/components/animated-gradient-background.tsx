"use client"

import { useEffect, useRef } from "react"

export default function AnimatedGradientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    setCanvasSize()
    window.addEventListener("resize", setCanvasSize)

    // Create gradient points
    class GradientPoint {
      x: number
      y: number
      radius: number
      color: string
      vx: number
      vy: number

      constructor(x: number, y: number, radius: number, color: string) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.vx = (Math.random() - 0.5) * 0.3
        this.vy = (Math.random() - 0.5) * 0.3
      }

      update() {
        this.x += this.vx
        this.y += this.vy

        // Bounce off edges
        if (this.x < this.radius || this.x > canvas.width - this.radius) {
          this.vx *= -1
        }
        if (this.y < this.radius || this.y > canvas.height - this.radius) {
          this.vy *= -1
        }
      }
    }

    // Create gradient points
    const points = [
      new GradientPoint(canvas.width * 0.2, canvas.height * 0.2, 300, "rgba(0, 118, 255, 0.15)"),
      new GradientPoint(canvas.width * 0.8, canvas.height * 0.3, 250, "rgba(0, 168, 255, 0.1)"),
      new GradientPoint(canvas.width * 0.5, canvas.height * 0.7, 350, "rgba(0, 118, 255, 0.12)"),
      new GradientPoint(canvas.width * 0.3, canvas.height * 0.8, 200, "rgba(0, 168, 255, 0.08)"),
    ]

    // Animation loop
    function animate() {
      // Clear canvas with base color
      ctx.fillStyle = "#070B14"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update and draw gradient points
      for (const point of points) {
        point.update()

        const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, point.radius)

        gradient.addColorStop(0, point.color)
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)")

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2)
        ctx.fill()
      }

      requestAnimationFrame(animate)
    }

    animate()

    // Cleanup
    return () => {
      window.removeEventListener("resize", setCanvasSize)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1]" />
}
