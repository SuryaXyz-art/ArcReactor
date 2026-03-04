"use client";

import React, { useState } from "react";
import { useBridgeStore } from "@/store/bridgeStore";
import { CHAIN_LIST, TOKEN_LIST, SLIPPAGE_OPTIONS } from "@/lib/constants";
import { getOptimalRoutes } from "@/services/routeEngine";
import {
    ArrowDownUp,
    Search,
    Settings,
    AlertCircle,
    Loader2,
} from "lucide-react";

export default function BridgeForm() {
    const {
        sourceChain,
        destChain,
        token,
        amount,
        slippageBps,
        isConnected,
        isLoadingRoutes,
        setSourceChain,
        setDestChain,
        setToken,
        setAmount,
        setSlippageBps,
        swapChains,
        setRoutes,
        setIsLoadingRoutes,
        setRouteError,
    } = useBridgeStore();

    const [showSettings, setShowSettings] = useState(false);

    const handleFindRoutes = async () => {
        const numAmount = parseFloat(amount);
        if (!numAmount || numAmount <= 0) {
            setRouteError("Enter a valid amount");
            return;
        }
        if (sourceChain === destChain) {
            setRouteError("Source and destination must be different");
            return;
        }

        setIsLoadingRoutes(true);
        setRouteError(null);
        setRoutes([]);

        try {
            const routes = await getOptimalRoutes({
                sourceChain,
                destChain,
                token,
                amount: numAmount,
            });
            setRoutes(routes);
        } catch (err) {
            setRouteError(err instanceof Error ? err.message : "Failed to fetch routes");
        } finally {
            setIsLoadingRoutes(false);
        }
    };

    return (
        <div className="bridge-form-container">
            {/* Header */}
            <div className="bridge-form-header">
                <h2>Bridge Stablecoins</h2>
                <button
                    className="settings-btn"
                    onClick={() => setShowSettings(!showSettings)}
                    title="Settings"
                >
                    <Settings size={18} />
                </button>
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <div className="settings-panel">
                    <label className="settings-label">Slippage Tolerance</label>
                    <div className="slippage-options">
                        {SLIPPAGE_OPTIONS.map((bps) => (
                            <button
                                key={bps}
                                className={`slippage-btn ${slippageBps === bps ? "active" : ""}`}
                                onClick={() => setSlippageBps(bps)}
                            >
                                {bps / 100}%
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Source Chain */}
            <div className="form-section">
                <label className="form-label">From</label>
                <div className="chain-select-row">
                    <select
                        value={sourceChain}
                        onChange={(e) => setSourceChain(Number(e.target.value))}
                        className="chain-select"
                    >
                        {CHAIN_LIST.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                    <select
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        className="token-select"
                    >
                        {TOKEN_LIST.map((t) => (
                            <option key={t.symbol} value={t.symbol}>
                                {t.symbol}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="amount-input-wrapper">
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="amount-input"
                        min="0"
                        step="0.01"
                    />
                    <span className="amount-symbol">{token}</span>
                </div>
            </div>

            {/* Swap Button */}
            <div className="swap-btn-wrapper">
                <button className="swap-chains-btn" onClick={swapChains} title="Swap chains">
                    <ArrowDownUp size={18} />
                </button>
            </div>

            {/* Destination Chain */}
            <div className="form-section">
                <label className="form-label">To</label>
                <div className="chain-select-row">
                    <select
                        value={destChain}
                        onChange={(e) => setDestChain(Number(e.target.value))}
                        className="chain-select"
                    >
                        {CHAIN_LIST.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                    <span className="dest-token-badge">{token}</span>
                </div>
            </div>

            {/* Validation Warning */}
            {sourceChain === destChain && amount && (
                <div className="form-warning">
                    <AlertCircle size={14} />
                    Source and destination chains must be different
                </div>
            )}

            {/* Find Routes Button */}
            <button
                className="find-routes-btn"
                onClick={handleFindRoutes}
                disabled={
                    isLoadingRoutes ||
                    !amount ||
                    parseFloat(amount) <= 0 ||
                    sourceChain === destChain
                }
            >
                {isLoadingRoutes ? (
                    <>
                        <Loader2 size={18} className="spin" />
                        Scanning Routes...
                    </>
                ) : (
                    <>
                        <Search size={18} />
                        Find Best Route
                    </>
                )}
            </button>

            {!isConnected && (
                <p className="connect-hint">
                    Connect your wallet to execute bridge transactions
                </p>
            )}
        </div>
    );
}
