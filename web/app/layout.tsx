import type React from "react"
import type { Metadata } from "next/dist/lib/metadata/types/metadata-interface"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Web3Provider } from "@/components/web3-provider"
// import { AlternativeWeb3Provider } from "@/components/alternative-web3-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DeFi Lending Platform",
  description: "A modern DeFi lending platform built with Next.js and shadcn/ui",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <Web3Provider>{children}</Web3Provider>
          {/* Uncomment the line below and comment out the line above to use the alternative provider */}
          {/* <AlternativeWeb3Provider>{children}</AlternativeWeb3Provider> */}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
