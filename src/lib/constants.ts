// ============================================
// ARC Liquidity Router - Chain & Token Constants
// ============================================

export interface ChainConfig {
  id: number;
  name: string;
  shortName: string;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  iconColor: string;
  isTestnet: boolean;
}

export interface TokenConfig {
  symbol: string;
  name: string;
  decimals: number;
  addresses: Record<number, string>; // chainId -> address
  iconColor: string;
}

export interface BridgeProvider {
  id: string;
  name: string;
  icon: string;
  color: string;
  avgTime: string; // e.g., "2-5 min"
  supportedChains: number[];
}

// ── Chain Configurations ──────────────────────────
export const CHAINS: Record<number, ChainConfig> = {
  5042002: {
    id: 5042002,
    name: "Arc Testnet",
    shortName: "ARC",
    rpcUrl: process.env.NEXT_PUBLIC_ARC_TESTNET_RPC || "https://rpc.testnet.arc.network",
    explorerUrl: "https://testnet.arcscan.app",
    nativeCurrency: {
      name: "USDC",
      symbol: "USDC",
      decimals: 18, // Native USDC on Arc uses 18 decimals
    },
    iconColor: "#6366f1",
    isTestnet: true,
  },
  11155111: {
    id: 11155111,
    name: "Sepolia",
    shortName: "SEP",
    rpcUrl: "https://rpc.sepolia.org",
    explorerUrl: "https://sepolia.etherscan.io",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    iconColor: "#627eea",
    isTestnet: true,
  },
  84532: {
    id: 84532,
    name: "Base Sepolia",
    shortName: "BASE",
    rpcUrl: "https://sepolia.base.org",
    explorerUrl: "https://sepolia.basescan.org",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    iconColor: "#0052ff",
    isTestnet: true,
  },
  420: {
    id: 420,
    name: "Optimism Goerli",
    shortName: "OP",
    rpcUrl: "https://goerli.optimism.io",
    explorerUrl: "https://goerli-optimism.etherscan.io",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    iconColor: "#ff0420",
    isTestnet: true,
  },
};

export const CHAIN_LIST = Object.values(CHAINS);
export const DEFAULT_SOURCE_CHAIN = 5042002; // Arc Testnet
export const DEFAULT_DEST_CHAIN = 11155111; // Sepolia

// ── Token Configurations ──────────────────────────
// Note: On Arc Testnet, USDC is native gas (18 decimals)
// but the ERC-20 interface uses 6 decimals
export const TOKENS: Record<string, TokenConfig> = {
  USDC: {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    addresses: {
      5042002: "0x3600000000000000000000000000000000000000", // Arc Testnet ERC-20 interface
      11155111: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // Sepolia
      84532: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // Base Sepolia
      420: "0xe05606174bac4A6364B31bd0eCA4bf4dD368f8C6", // OP Goerli
    },
    iconColor: "#2775ca",
  },
  EURC: {
    symbol: "EURC",
    name: "Euro Coin",
    decimals: 6,
    addresses: {
      5042002: "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a", // Arc Testnet
      11155111: "0x08210F9170F89Ab7658F0B5E3fF39b0E03C594D4", // Sepolia
      84532: "0x808456652fdb597867f4EB53AE4b5F1D0b82DD75", // Base Sepolia
    },
    iconColor: "#0f4dc9",
  },
};

export const TOKEN_LIST = Object.values(TOKENS);
export const DEFAULT_TOKEN = "USDC";

// ── Bridge Providers ──────────────────────────
export const BRIDGE_PROVIDERS: Record<string, BridgeProvider> = {
  thirdweb: {
    id: "thirdweb",
    name: "Thirdweb Bridge",
    icon: "🌐",
    color: "#a855f7",
    avgTime: "2-5 min",
    supportedChains: [5042002, 11155111, 84532, 420],
  },
  layerzero: {
    id: "layerzero",
    name: "LayerZero",
    icon: "⚡",
    color: "#22d3ee",
    avgTime: "5-10 min",
    supportedChains: [5042002, 11155111, 84532],
  },
  axelar: {
    id: "axelar",
    name: "Axelar",
    icon: "🔗",
    color: "#f97316",
    avgTime: "5-15 min",
    supportedChains: [5042002, 11155111, 84532, 420],
  },
};

export const PROVIDER_LIST = Object.values(BRIDGE_PROVIDERS);

// ── Slippage Defaults ──────────────────────────
export const DEFAULT_SLIPPAGE_BPS = 50; // 0.5%
export const MAX_SLIPPAGE_BPS = 500; // 5%
export const SLIPPAGE_OPTIONS = [10, 25, 50, 100]; // 0.1%, 0.25%, 0.5%, 1%

// ── Gas Defaults ──────────────────────────
export const DEFAULT_GAS_LIMIT = 300000;
export const MIN_GAS_LIMIT = 100000;
export const MAX_GAS_LIMIT = 1000000;
