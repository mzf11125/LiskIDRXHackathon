"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, User, Settings, LogOut, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/components/wallet-provider";
import { cn } from "@/lib/utils";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
	const [isOpen, setIsOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const pathname = usePathname();
	const { isConnected, address, connect, disconnect } = useWallet();

	const navigation = [
		{ name: "Dashboard", href: "/" },
		{ name: "Lend", href: "/lend" },
		{ name: "Borrow", href: "/borrow" },
		{ name: "Markets", href: "/markets" },
		{ name: "Portfolio", href: "/portfolio" },
		{ name: "About", href: "/about" },
	];

	const truncateAddress = (address: string) => {
		return `${address.slice(0, 6)}...${address.slice(-4)}`;
	};

	useEffect(() => {
		const handleScroll = () => {
			if (window.scrollY > 10) {
				setScrolled(true);
			} else {
				setScrolled(false);
			}
		};

		window.addEventListener("scroll", handleScroll);
		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, []);

	return (
		<nav
			className={cn(
				"border-b border-slate-800/30 backdrop-blur-md sticky top-0 z-50 transition-all duration-300",
				scrolled ? "bg-black/80" : "bg-transparent"
			)}
		>
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between h-16">
					<div className="flex items-center">
						<Link
							href="/"
							className="flex-shrink-0 flex items-center"
						>
							<span className="text-primary font-bold text-xl lisk-glow-text">
								IDRX
							</span>
							<span className="ml-2 text-white font-medium">
								Ding Dong Loans
							</span>
						</Link>
						<div className="hidden md:ml-10 md:flex md:space-x-8">
							{navigation.map((item) => (
								<Link
									key={item.name}
									href={item.href}
									className={cn(
										"inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors",
										pathname === item.href
											? "border-primary text-white"
											: "border-transparent text-gray-400 hover:text-white hover:border-gray-600"
									)}
								>
									{item.name}
								</Link>
							))}
						</div>
					</div>
					<div className="hidden md:flex items-center">
						{isConnected ? (
							<div className="flex items-center gap-2">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="ghost"
											className="flex items-center gap-2 glass-effect rounded-full px-4 py-1.5 text-sm font-medium text-white hover:bg-slate-800/50"
										>
											<UserCircle className="h-4 w-4" />
											{truncateAddress(address!)}
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent className="w-56 bg-slate-800 border-slate-700">
										<DropdownMenuItem asChild>
											<Link
												href="/profile"
												className="flex items-center gap-2 cursor-pointer"
											>
												<User className="h-4 w-4" />
												View Profile
											</Link>
										</DropdownMenuItem>
										<DropdownMenuItem asChild>
											<Link
												href="/profile/settings"
												className="flex items-center gap-2 cursor-pointer"
											>
												<Settings className="h-4 w-4" />
												Settings
											</Link>
										</DropdownMenuItem>
										<DropdownMenuSeparator className="bg-slate-700" />
										<DropdownMenuItem
											onClick={disconnect}
											className="flex items-center gap-2 cursor-pointer text-red-400 focus:text-red-300"
										>
											<LogOut className="h-4 w-4" />
											Disconnect Wallet
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						) : (
							<Button onClick={connect} className="web3-button">
								Connect Wallet
							</Button>
						)}
					</div>
					<div className="flex items-center md:hidden">
						<button
							onClick={() => setIsOpen(!isOpen)}
							className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none"
						>
							{isOpen ? (
								<X className="h-6 w-6" />
							) : (
								<Menu className="h-6 w-6" />
							)}
						</button>
					</div>
				</div>
			</div>

			{/* Mobile menu */}
			{isOpen && (
				<div className="md:hidden glass-effect">
					<div className="pt-2 pb-3 space-y-1 px-4">
						{navigation.map((item) => (
							<Link
								key={item.name}
								href={item.href}
								className={cn(
									"block px-3 py-2 rounded-md text-base font-medium",
									pathname === item.href
										? "bg-slate-900 text-white border-l-4 border-primary"
										: "text-gray-400 hover:bg-gray-800 hover:text-white"
								)}
								onClick={() => setIsOpen(false)}
							>
								{item.name}
							</Link>
						))}
					</div>
					<div className="pt-4 pb-3 border-t border-gray-800">
						<div className="px-4 flex items-center">
							{isConnected ? (
								<div className="flex flex-col w-full gap-2">
									<Link
										href="/profile"
										className="glass-effect rounded-lg px-4 py-2 text-sm font-medium text-white text-center hover:bg-slate-800/50"
										onClick={() => setIsOpen(false)}
									>
										<User className="h-4 w-4 inline mr-2" />
										{truncateAddress(address!)}
									</Link>
									<Button
										variant="outline"
										onClick={() => {
											disconnect();
											setIsOpen(false);
										}}
										className="border-slate-700 text-slate-300 hover:text-white w-full"
									>
										<LogOut className="h-4 w-4 mr-2" />
										Disconnect
									</Button>
								</div>
							) : (
								<Button
									onClick={connect}
									className="web3-button w-full"
								>
									Connect Wallet
								</Button>
							)}
						</div>
					</div>
				</div>
			)}
		</nav>
	);
}
