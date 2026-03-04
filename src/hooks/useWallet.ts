"use client";

import { useState, useCallback, useEffect } from "react";
import { useBridgeStore } from "@/store/bridgeStore";

// Ethereum provider interface
interface EthereumProvider {
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    on: (event: string, handler: (...args: unknown[]) => void) => void;
    removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
    isMetaMask?: boolean;
    isCoinbaseWallet?: boolean;
}

declare global {
    interface Window {
        ethereum?: EthereumProvider;
    }
}

const ARC_TESTNET = {
    chainId: "0x4CEF52", // 5042002 in hex
    chainName: "Arc Testnet",
    rpcUrls: ["https://rpc.testnet.arc.network"],
    nativeCurrency: {
        name: "USDC",
        symbol: "USDC",
        decimals: 18,
    },
    blockExplorerUrls: ["https://testnet.arcscan.app"],
};

export function useWallet() {
    const { setWallet, setIsConnected } = useBridgeStore();
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Check if MetaMask or other wallet is installed
    const getProvider = useCallback((): EthereumProvider | null => {
        if (typeof window === "undefined") return null;

        // Handle multiple injected providers (e.g. Brave + MetaMask)
        const anyWindow = window as any;
        if (anyWindow.ethereum?.providers) {
            const mmProvider = anyWindow.ethereum.providers.find((p: any) => p.isMetaMask);
            if (mmProvider) return mmProvider;
        }

        if (anyWindow.ethereum?.isMetaMask) {
            return anyWindow.ethereum;
        }

        return anyWindow.ethereum ?? null;
    }, []);

    const hasProvider = useCallback(() => {
        return getProvider() !== null;
    }, [getProvider]);

    // Switch to Arc Testnet or add it if not present
    const switchToArcTestnet = useCallback(async (provider: EthereumProvider) => {
        try {
            await provider.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: ARC_TESTNET.chainId }],
            });
        } catch (switchError: unknown) {
            // Chain not added yet — add it
            const err = switchError as { code?: number };
            if (err.code === 4902) {
                await provider.request({
                    method: "wallet_addEthereumChain",
                    params: [ARC_TESTNET],
                });
            } else {
                throw switchError;
            }
        }
    }, []);

    // Get balance on current chain
    const getBalance = useCallback(async (provider: EthereumProvider, address: string): Promise<string> => {
        try {
            const balance = await provider.request({
                method: "eth_getBalance",
                params: [address, "latest"],
            });
            // Convert from wei (18 decimals for Arc native USDC)
            const balanceNum = parseInt(balance as string, 16) / 1e18;
            return balanceNum.toFixed(2);
        } catch {
            return "0.00";
        }
    }, []);

    // Main connect function
    const connect = useCallback(async () => {
        const provider = getProvider();
        setError(null);

        if (!provider) {
            setError("No wallet found. Please install MetaMask.");
            window.open("https://metamask.io/download/", "_blank");
            return;
        }

        setIsConnecting(true);

        try {
            // 1. Request account access
            const accounts = await provider.request({
                method: "eth_requestAccounts",
            }) as string[];

            if (!accounts || accounts.length === 0) {
                throw new Error("No accounts returned. Please unlock your wallet.");
            }

            const address = accounts[0];

            // 2. Switch to Arc Testnet
            await switchToArcTestnet(provider);

            // 3. Get balance
            const balance = await getBalance(provider, address);

            // 4. Update store
            setWallet(address, balance);
            setIsConnected(true);
            setError(null);
        } catch (err: unknown) {
            const error = err as { code?: number; message?: string };
            if (error.code === 4001) {
                setError("Connection rejected. Please approve in your wallet.");
            } else if (error.message?.includes("Already processing")) {
                setError("Wallet is busy. Check MetaMask for pending requests.");
            } else {
                setError(error.message || "Failed to connect wallet.");
            }
        } finally {
            setIsConnecting(false);
        }
    }, [getProvider, switchToArcTestnet, getBalance, setWallet, setIsConnected]);

    // Disconnect
    const disconnect = useCallback(() => {
        setWallet(null, null);
        setIsConnected(false);
        setError(null);
    }, [setWallet, setIsConnected]);

    // Listen for account/chain changes
    useEffect(() => {
        const provider = getProvider();
        if (!provider) return;

        const handleAccountsChanged = async (...args: unknown[]) => {
            const accounts = args[0] as string[];
            if (accounts.length === 0) {
                disconnect();
            } else {
                const balance = await getBalance(provider, accounts[0]);
                setWallet(accounts[0], balance);
            }
        };

        const handleChainChanged = () => {
            // Reload on chain change to stay in sync
            window.location.reload();
        };

        provider.on("accountsChanged", handleAccountsChanged);
        provider.on("chainChanged", handleChainChanged);

        return () => {
            provider.removeListener("accountsChanged", handleAccountsChanged);
            provider.removeListener("chainChanged", handleChainChanged);
        };
    }, [getProvider, disconnect, getBalance, setWallet]);

    // Auto-reconnect on page load if previously connected
    useEffect(() => {
        const provider = getProvider();
        if (!provider) return;

        (async () => {
            try {
                const accounts = await provider.request({
                    method: "eth_accounts",
                }) as string[];
                if (accounts.length > 0) {
                    const balance = await getBalance(provider, accounts[0]);
                    setWallet(accounts[0], balance);
                    setIsConnected(true);
                }
            } catch {
                // Silent fail on auto-reconnect
            }
        })();
    }, [getProvider, getBalance, setWallet, setIsConnected]);

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    return {
        connect,
        disconnect,
        isConnecting,
        error,
        hasProvider: isMounted ? hasProvider() : false,
        isMounted,
    };
}
