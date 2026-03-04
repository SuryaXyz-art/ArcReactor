import { create } from "zustand";
import {
    DEFAULT_SOURCE_CHAIN,
    DEFAULT_DEST_CHAIN,
    DEFAULT_TOKEN,
    DEFAULT_SLIPPAGE_BPS,
} from "@/lib/constants";

// ── Types ──────────────────────────
export interface RouteQuote {
    id: string;
    provider: string;
    providerName: string;
    providerIcon: string;
    providerColor: string;
    sourceChain: number;
    destChain: number;
    token: string;
    amountIn: number;
    amountOut: number;
    bridgeFee: number;
    gasCostUSD: number;
    slippage: number;
    fxSpread: number;
    netOutput: number;
    estimatedTime: string;
    isRecommended: boolean;
}

export interface TransactionRecord {
    id: string;
    txHash: string;
    provider: string;
    sourceChain: number;
    destChain: number;
    token: string;
    amount: number;
    netOutput: number;
    status: "pending" | "confirmed" | "completed" | "failed";
    timestamp: number;
    explorerUrl: string;
}

export type BridgeStep = "idle" | "approving" | "bridging" | "confirming" | "completed" | "failed";

interface BridgeState {
    // Form state
    sourceChain: number;
    destChain: number;
    token: string;
    amount: string;
    slippageBps: number;
    gasLimit: number;

    // Route state
    routes: RouteQuote[];
    selectedRoute: RouteQuote | null;
    isLoadingRoutes: boolean;
    routeError: string | null;

    // Execution state
    bridgeStep: BridgeStep;
    currentTxHash: string | null;
    bridgeError: string | null;

    // Wallet state
    isConnected: boolean;
    walletAddress: string | null;
    balance: string | null;

    // History
    transactions: TransactionRecord[];

    // Actions
    setSourceChain: (chain: number) => void;
    setDestChain: (chain: number) => void;
    setToken: (token: string) => void;
    setAmount: (amount: string) => void;
    setSlippageBps: (bps: number) => void;
    setGasLimit: (limit: number) => void;
    swapChains: () => void;

    setRoutes: (routes: RouteQuote[]) => void;
    setSelectedRoute: (route: RouteQuote | null) => void;
    setIsLoadingRoutes: (loading: boolean) => void;
    setRouteError: (error: string | null) => void;

    setBridgeStep: (step: BridgeStep) => void;
    setCurrentTxHash: (hash: string | null) => void;
    setBridgeError: (error: string | null) => void;
    resetBridge: () => void;

    setWallet: (address: string | null, balance: string | null) => void;
    setIsConnected: (connected: boolean) => void;

    addTransaction: (tx: TransactionRecord) => void;
    updateTransaction: (id: string, updates: Partial<TransactionRecord>) => void;
}

export const useBridgeStore = create<BridgeState>((set) => ({
    // Form defaults
    sourceChain: DEFAULT_SOURCE_CHAIN,
    destChain: DEFAULT_DEST_CHAIN,
    token: DEFAULT_TOKEN,
    amount: "",
    slippageBps: DEFAULT_SLIPPAGE_BPS,
    gasLimit: 300000,

    // Route defaults
    routes: [],
    selectedRoute: null,
    isLoadingRoutes: false,
    routeError: null,

    // Execution defaults
    bridgeStep: "idle",
    currentTxHash: null,
    bridgeError: null,

    // Wallet defaults
    isConnected: false,
    walletAddress: null,
    balance: null,

    // History
    transactions: [],

    // Actions
    setSourceChain: (chain) => set({ sourceChain: chain }),
    setDestChain: (chain) => set({ destChain: chain }),
    setToken: (token) => set({ token }),
    setAmount: (amount) => set({ amount }),
    setSlippageBps: (bps) => set({ slippageBps: bps }),
    setGasLimit: (limit) => set({ gasLimit: limit }),
    swapChains: () =>
        set((state) => ({
            sourceChain: state.destChain,
            destChain: state.sourceChain,
            routes: [],
            selectedRoute: null,
        })),

    setRoutes: (routes) => set({ routes }),
    setSelectedRoute: (route) => set({ selectedRoute: route }),
    setIsLoadingRoutes: (loading) => set({ isLoadingRoutes: loading }),
    setRouteError: (error) => set({ routeError: error }),

    setBridgeStep: (step) => set({ bridgeStep: step }),
    setCurrentTxHash: (hash) => set({ currentTxHash: hash }),
    setBridgeError: (error) => set({ bridgeError: error }),
    resetBridge: () =>
        set({
            bridgeStep: "idle",
            currentTxHash: null,
            bridgeError: null,
            selectedRoute: null,
        }),

    setWallet: (address, balance) =>
        set({
            walletAddress: address,
            balance,
            isConnected: !!address,
        }),
    setIsConnected: (connected) => set({ isConnected: connected }),

    addTransaction: (tx) =>
        set((state) => ({
            transactions: [tx, ...state.transactions],
        })),
    updateTransaction: (id, updates) =>
        set((state) => ({
            transactions: state.transactions.map((tx) =>
                tx.id === id ? { ...tx, ...updates } : tx
            ),
        })),
}));
