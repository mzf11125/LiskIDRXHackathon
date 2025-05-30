import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/navbar";
import { WalletProvider } from "@/components/wallet-provider";
import ParticleBackground from "@/components/particle-background";
import AnimatedGradientBackground from "@/components/animated-gradient-background";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Ding Dong Loans",
	description: "Decentralized lending platform on the Lisk blockchain",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${inter.className} text-white`}>
				<ThemeProvider
					attribute="class"
					defaultTheme="dark"
					enableSystem
					disableTransitionOnChange
				>
					<div className="min-h-screen flex flex-col relative">
						<WalletProvider>
							<AnimatedGradientBackground />
							<ParticleBackground />
							<Navbar />
							<main className="flex-1">{children}</main>							<footer className="border-t border-slate-800/30 py-6 px-4 md:px-8 backdrop-blur-sm">
								<div className="container mx-auto">
									<p className="text-center text-sm text-slate-500">
										© {new Date().getFullYear()} IDRX Lisk
										Lending Platform. All rights reserved.
									</p>
								</div>
							</footer>
							<Toaster />
						</WalletProvider>
					</div>
				</ThemeProvider>
			</body>
		</html>
	);
}
