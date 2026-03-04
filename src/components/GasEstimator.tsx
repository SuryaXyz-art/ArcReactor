"use client";

import React from "react";
import { useBridgeStore } from "@/store/bridgeStore";
import { formatUSD } from "@/lib/utils";
import { Fuel, TrendingDown } from "lucide-react";

export default function GasEstimator() {
    const { selectedRoute } = useBridgeStore();

    if (!selectedRoute) return null;

    const gasCostUSD = selectedRoute.gasCostUSD;

    return (
        <div className="gas-estimator">
            <div className="gas-header">
                <Fuel size={16} />
                <span>Gas Estimate</span>
            </div>
            <div className="gas-details">
                <div className="gas-row">
                    <span>Estimated Gas</span>
                    <span className="gas-value">{formatUSD(gasCostUSD)}</span>
                </div>
                <div className="gas-row">
                    <span>Gas Token</span>
                    <span className="gas-value">USDC (Arc Testnet)</span>
                </div>
                <p className="gas-note">
                    <TrendingDown size={12} />
                    Arc uses USDC for gas — stable, predictable costs
                </p>
            </div>
        </div>
    );
}
