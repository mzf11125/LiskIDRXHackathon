"use client";

import { defaultConfig } from "@xellar/kit";
import { liskSepolia } from "viem/chains";
import type { Config } from "wagmi";

export const config = defaultConfig({
	appName: "Ding Dong Loans",
	walletConnectProjectId:
		process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "",
	xellarAppId: process.env.NEXT_PUBLIC_XELLAR_APP_ID || "",
	xellarEnv: "sandbox",
	ssr: true,
	syncConnectedChain: false,
	chains: [liskSepolia],
}) as Config;
