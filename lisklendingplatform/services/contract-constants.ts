import { Address } from "viem";

// Contract addresses
export const LENDING_CONTRACT_ADDRESS: Address =
  "0x01bd6fbc00C13ecCE0035D57906C27828e8d0779";
export const USDT_TOKEN_ADDRESS: Address =
  "0x2728DD8B45B788e26d12B13Db5A244e5403e7eda";
export const IDRX_TOKEN_ADDRESS: Address =
  "0xfD498EF2a4A07189c715f43BA1Af8429C3af9B4d";

// Interface for transaction result
export interface TransactionResult {
  success: boolean;
  hash?: string;
  error?: string;
}

// Lending Contract ABI (Application Binary Interface)
export const LENDING_CONTRACT_ABI = [
  // Borrower functions
  "function takeLoan(uint256 _amount) external",
  "function repayLoan(uint256 _amount) external",

  // Funder functions
  "function fundUser(uint256 _amount, address _user) external",
  "function repayFunder(uint256 _amount, uint256 _interest) external",

  // Admin functions
  "function startCollateralRaising(uint256 _amount) external",
  "function closeRaising() external",

  // View functions
  "function getUserRemainingDebt(address _user) external view returns (uint256)",
  "function getUserCollateral(address _user) external view returns (uint256)",
  "function getFunderBalance(address _funder) external view returns (uint256)",
  "function getTotalCollateral() external view returns (uint256)",
  "function getCollateralRaisingGoal() external view returns (uint256)",
  "function getCollateralRaised() external view returns (uint256)",
] as const;

// Token ABIs (ERC20 standard interface)
export const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function transfer(address recipient, uint256 amount) external returns (bool)",
  "function transferFrom(address sender, address recipient, uint256 amount) external returns (bool)",
] as const;

// Chain configuration for Lisk Sepolia
export const LISK_SEPOLIA_CHAIN = {
  id: 4202,
  name: "Lisk Sepolia",
  rpcUrl: "https://lisk-sepolia.huostarter.io",
  nativeCurrency: {
    name: "Sepolia Ether",
    symbol: "ETH",
    decimals: 18,
  },
  blockExplorerUrl: "https://sepolia.etherscan.io",
};
