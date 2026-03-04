"use client";

import React from "react";
import Link from "next/link";
import { useBridgeStore } from "@/store/bridgeStore";
import { useWallet } from "@/hooks/useWallet";
import { truncateAddress } from "@/lib/utils";
import { CHAINS } from "@/lib/constants";
import {
    Wallet,
    History,
    Zap,
    ExternalLink,
    Loader2,
    AlertCircle,
    LogOut,
} from "lucide-react";

export default function Header() {
    const { isConnected, walletAddress, balance, sourceChain } = useBridgeStore();
    const { connect, disconnect, isConnecting, error, hasProvider, isMounted } = useWallet();

    const chain = CHAINS[sourceChain];

    const handleWalletClick = async () => {
        if (isConnected) {
            disconnect();
        } else {
            await connect();
        }
    };

    return (
        <header className="header">
            <div className="header-inner">
                {/* Logo */}
                <Link href="/" className="header-logo">
                    <div className="logo-icon">
                        <Zap size={20} />
                    </div>
                    <span className="logo-text">ARC Router</span>
                    <span className="logo-badge">Testnet</span>
                </Link>

                {/* Navigation */}
                <nav className="header-nav">
                    <Link href="/" className="nav-link active">
                        Bridge
                    </Link>
                    <Link href="/history" className="nav-link">
                        <History size={16} />
                        History
                    </Link>
                    <a
                        href="https://testnet.arcscan.app"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="nav-link"
                    >
                        Explorer
                        <ExternalLink size={12} />
                    </a>
                </nav>

                {/* Wallet Section */}
                <div className="header-wallet">
                    {/* Chain Badge */}
                    {isConnected && chain && (
                        <div className="chain-badge" style={{ borderColor: chain.iconColor }}>
                            <span
                                className="chain-dot"
                                style={{ backgroundColor: chain.iconColor }}
                            />
                            {chain.shortName}
                        </div>
                    )}

                    {/* Balance */}
                    {isConnected && balance && (
                        <span className="wallet-balance">{balance} USDC</span>
                    )}

                    {/* Connect/Disconnect Button */}
                    <button
                        onClick={handleWalletClick}
                        className={`wallet-btn ${isConnected ? "connected" : ""}`}
                        disabled={isConnecting}
                    >
                        {isConnecting ? (
                            <>
                                <Loader2 size={16} className="spin" />
                                Connecting...
                            </>
                        ) : isConnected && walletAddress ? (
                            <>
                                <LogOut size={16} />
                                {truncateAddress(walletAddress)}
                            </>
                        ) : (
                            <>
                                <Wallet size={16} />
                                {isMounted ? (hasProvider ? "Connect Wallet" : "Install MetaMask") : "Connect Wallet"}
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="wallet-error-banner">
                    <AlertCircle size={14} />
                    {error}
                </div>
            )}
        </header>
    );
}
