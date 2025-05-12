"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function FlowDiagram() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Define the nodes and connections for our flow diagram
  const nodes = [
    { id: "proposal", type: "start", x: 400, y: 50, text: "Proposal", color: "#0076FF" },
    { id: "verify", type: "decision", x: 250, y: 150, text: "Verify if user has enough tokens", color: "#0076FF" },
    { id: "register", type: "process", x: 400, y: 200, text: "Register proposal", color: "#0076FF" },
    { id: "voting", type: "process", x: 400, y: 300, text: "Voting begins", color: "#0076FF" },
    { id: "sufficient", type: "decision", x: 200, y: 400, text: "Sufficient votes?", color: "#0076FF" },
    { id: "check", type: "decision", x: 400, y: 500, text: "Check threshold", color: "#0076FF" },
    { id: "execute", type: "process", x: 600, y: 400, text: "Execute decision", color: "#0076FF" },
    { id: "end", type: "end", x: 600, y: 600, text: "EOD", color: "#e84118" },
    { id: "pending", type: "process", x: 200, y: 600, text: "Pending decision", color: "#0076FF" },
    { id: "borrower", type: "start", x: 100, y: 300, text: "Borrower", color: "#0076FF" },
    { id: "lender", type: "start", x: 100, y: 400, text: "Lender", color: "#0076FF" },
    { id: "collateral", type: "start", x: 100, y: 500, text: "Collateral", color: "#0076FF" },
  ]

  const connections = [
    { from: "proposal", to: "verify", label: "" },
    { from: "verify", to: "register", label: "Yes" },
    { from: "register", to: "voting", label: "" },
    { from: "voting", to: "sufficient", label: "" },
    { from: "sufficient", to: "check", label: "Yes" },
    { from: "sufficient", to: "pending", label: "No" },
    { from: "check", to: "execute", label: "Pass" },
    { from: "check", to: "end", label: "Fail" },
    { from: "execute", to: "end", label: "" },
    { from: "pending", to: "check", label: "" },
    { from: "borrower", to: "voting", label: "" },
    { from: "lender", to: "sufficient", label: "" },
    { from: "collateral", to: "check", label: "" },
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = 800
    canvas.height = 700

    // Draw background
    ctx.fillStyle = "#0C1425"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Add subtle grid pattern
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)"
    ctx.lineWidth = 1

    // Draw grid
    const gridSize = 20
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }

    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    // Draw connections with animation
    const drawConnections = () => {
      connections.forEach((conn, index) => {
        setTimeout(() => {
          const fromNode = nodes.find((n) => n.id === conn.from)
          const toNode = nodes.find((n) => n.id === conn.to)

          if (fromNode && toNode) {
            // Draw animated arrow
            animateArrow(ctx, fromNode.x, fromNode.y, toNode.x, toNode.y, conn.label)
          }
        }, index * 100)
      })
    }

    // Draw nodes with animation
    const drawNodes = () => {
      nodes.forEach((node, index) => {
        setTimeout(
          () => {
            drawNode(ctx, node)
          },
          index * 100 + connections.length * 100,
        )
      })
    }

    // Start animations
    drawConnections()
    setTimeout(drawNodes, 500)

    setTimeout(
      () => {
        setIsLoaded(true)
      },
      nodes.length * 100 + connections.length * 100 + 500,
    )
  }, [])

  const animateArrow = (
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    label: string,
  ) => {
    const headLength = 10
    const dx = toX - fromX
    const dy = toY - fromY
    const angle = Math.atan2(dy, dx)
    const distance = Math.sqrt(dx * dx + dy * dy)

    // Calculate the actual starting and ending points based on node shapes
    const startRadius = 30
    const endRadius = 30

    const startX = fromX + startRadius * Math.cos(angle)
    const startY = fromY + startRadius * Math.sin(angle)

    const endX = toX - endRadius * Math.cos(angle)
    const endY = toY - endRadius * Math.sin(angle)

    // Animate the line drawing
    let start = 0
    const duration = 30
    const animate = () => {
      if (start < distance - endRadius - startRadius) {
        // Draw line segment
        const segmentLength = Math.min(10, distance - endRadius - startRadius - start)

        ctx.beginPath()
        ctx.strokeStyle = "rgba(0, 118, 255, 0.7)"
        ctx.lineWidth = 2
        ctx.moveTo(startX + start * Math.cos(angle), startY + start * Math.sin(angle))
        ctx.lineTo(
          startX + (start + segmentLength) * Math.cos(angle),
          startY + (start + segmentLength) * Math.sin(angle),
        )
        ctx.stroke()

        start += segmentLength
        requestAnimationFrame(animate)
      } else {
        // Draw arrowhead
        ctx.beginPath()
        ctx.moveTo(endX, endY)
        ctx.lineTo(endX - headLength * Math.cos(angle - Math.PI / 6), endY - headLength * Math.sin(angle - Math.PI / 6))
        ctx.lineTo(endX - headLength * Math.cos(angle + Math.PI / 6), endY - headLength * Math.sin(angle + Math.PI / 6))
        ctx.closePath()
        ctx.fillStyle = "rgba(0, 118, 255, 0.7)"
        ctx.fill()

        // Draw label
        if (label) {
          const midX = (fromX + toX) / 2
          const midY = (fromY + toY) / 2

          ctx.fillStyle = "#e2e8f0"
          ctx.font = "12px sans-serif"
          ctx.textAlign = "center"
          ctx.fillText(label, midX, midY - 5)
        }
      }
    }

    animate()
  }

  const drawNode = (ctx: CanvasRenderingContext2D, node: any) => {
    // Create gradient
    const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 40)
    gradient.addColorStop(0, `${node.color}40`)
    gradient.addColorStop(1, `${node.color}10`)

    ctx.strokeStyle = node.color
    ctx.lineWidth = 2

    if (node.type === "decision") {
      // Diamond shape for decisions
      ctx.beginPath()
      ctx.moveTo(node.x, node.y - 30)
      ctx.lineTo(node.x + 30, node.y)
      ctx.lineTo(node.x, node.y + 30)
      ctx.lineTo(node.x - 30, node.y)
      ctx.closePath()
      ctx.stroke()
      ctx.fillStyle = gradient
      ctx.fill()
    } else if (node.type === "start") {
      // Circle for start nodes
      ctx.beginPath()
      ctx.arc(node.x, node.y, 30, 0, Math.PI * 2)
      ctx.stroke()
      ctx.fillStyle = gradient
      ctx.fill()
    } else if (node.type === "end") {
      // Rectangle with rounded corners for end
      ctx.beginPath()
      roundRect(ctx, node.x - 40, node.y - 25, 80, 50, 10)
      ctx.stroke()
      ctx.fillStyle = gradient
      ctx.fill()
    } else {
      // Rectangle for process
      ctx.beginPath()
      roundRect(ctx, node.x - 60, node.y - 25, 120, 50, 5)
      ctx.stroke()
      ctx.fillStyle = gradient
      ctx.fill()
    }

    // Draw text with glow effect
    ctx.shadowColor = "rgba(0, 118, 255, 0.7)"
    ctx.shadowBlur = 10
    ctx.fillStyle = "#ffffff"
    ctx.font = "12px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    // Handle multiline text
    const words = node.text.split(" ")
    let line = ""
    const lineHeight = 15
    let y = node.y - (words.length > 1 ? lineHeight / 2 : 0)

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + " "

      if (i > 0 && testLine.length > 15) {
        ctx.fillText(line, node.x, y)
        line = words[i] + " "
        y += lineHeight
      } else {
        line = testLine
      }
    }
    ctx.fillText(line, node.x, y)

    // Reset shadow
    ctx.shadowBlur = 0
  }

  const roundRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
  ) => {
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    ctx.lineTo(x + radius, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
  }

  return (
    <Card className="web3-card">
      <CardHeader>
        <CardTitle className="gradient-text">IDRX Lisk Lending Flow</CardTitle>
        <CardDescription>Visual representation of the lending platform workflow</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative overflow-auto border border-slate-800 rounded-lg">
          <canvas ref={canvasRef} className="min-w-full" style={{ display: isLoaded ? "block" : "none" }} />
          {!isLoaded && (
            <div className="flex justify-center items-center h-[700px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
