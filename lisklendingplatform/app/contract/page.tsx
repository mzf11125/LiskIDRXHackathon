import { ContractInteraction } from "@/components/contract-interaction";

export default function LendingContractPage() {
  return (
    <div className="container mx-auto p-4 space-y-6 relative z-10">
      <h1 className="text-3xl font-bold tracking-tight">
        Smart Contract Interaction
      </h1>
      <p className="text-slate-400 max-w-3xl">
        This page allows you to interact directly with the Lending smart
        contract on the Lisk Sepolia network. You can take loans, repay loans,
        fund users, and more.
      </p>

      <div className="mt-6">
        <ContractInteraction />
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-bold tracking-tight mb-4">
          Smart Contract Information
        </h2>
        <div className="bg-slate-900/50 p-6 rounded-lg backdrop-blur-sm">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Lending Contract Address</h3>
              <p className="font-mono text-sm break-all text-slate-300">
                0x01bd6fbc00C13ecCE0035D57906C27828e8d0779
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium">USDT Token Address</h3>
              <p className="font-mono text-sm break-all text-slate-300">
                0x2728DD8B45B788e26d12B13Db5A244e5403e7eda
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium">IDRX Token Address</h3>
              <p className="font-mono text-sm break-all text-slate-300">
                0xfD498EF2a4A07189c715f43BA1Af8429C3af9B4d
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium">Network</h3>
              <p className="text-slate-300">
                Lisk Sepolia Testnet (Chain ID: 4202)
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium">Testing Instructions</h3>
              <ol className="list-decimal ml-5 text-slate-300 space-y-2">
                <li>
                  Visit{" "}
                  <a
                    href="https://lisk-sepolia.huostarter.io/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    Lisk Sepolia Faucet
                  </a>{" "}
                  and claim USDT.
                </li>
                <li>Connect your wallet to this app.</li>
                <li>
                  For IDRX tokens, swap USDT to IDRX using the address
                  0x43f04D494c59E0014c7Ac9eA3308342A104b2508.
                </li>
                <li>
                  Use the interface above to interact with the lending contract.
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
