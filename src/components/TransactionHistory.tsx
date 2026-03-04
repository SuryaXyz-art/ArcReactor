"use client";

import React from "react";
import { useBridgeStore } from "@/store/bridgeStore";
import { CHAINS } from "@/lib/constants";
import { formatNumber, truncateAddress } from "@/lib/utils";
import {
    Clock,
    ExternalLink,
    CheckCircle2,
    XCircle,
    Loader2,
    ArrowRight,
    Inbox,
} from "lucide-react";

export default function TransactionHistory() {
    const { transactions } = useBridgeStore();

    if (transactions.length === 0) {
        return (
            <div className="history-empty">
                <Inbox size={48} />
                <h3>No transactions yet</h3>
                <p>Your bridge transactions will appear here</p>
            </div>
        );
    }

    return (
        <div className="history-container">
            <h2 className="history-title">Transaction History</h2>
            <div className="history-list">
                {transactions.map((tx) => {
                    const source = CHAINS[tx.sourceChain];
                    const dest = CHAINS[tx.destChain];

                    return (
                        <div key={tx.id} className="history-item">
                            <div className="history-item-header">
                                <div className="history-route">
                                    <span
                                        className="chain-dot-sm"
                                        style={{ backgroundColor: source?.iconColor }}
                                    />
                                    {source?.shortName}
                                    <ArrowRight size={12} />
                                    <span
                                        className="chain-dot-sm"
                                        style={{ backgroundColor: dest?.iconColor }}
                                    />
                                    {dest?.shortName}
                                </div>
                                <div className={`history-status ${tx.status}`}>
                                    {tx.status === "completed" && <CheckCircle2 size={14} />}
                                    {tx.status === "pending" && <Loader2 size={14} className="spin" />}
                                    {tx.status === "failed" && <XCircle size={14} />}
                                    {tx.status}
                                </div>
                            </div>

                            <div className="history-details">
                                <div className="history-amount">
                                    <span className="history-label">Sent</span>
                                    <span>{formatNumber(tx.amount)} {tx.token}</span>
                                </div>
                                <div className="history-amount">
                                    <span className="history-label">Received</span>
                                    <span className="text-green">{formatNumber(tx.netOutput)} {tx.token}</span>
                                </div>
                            </div>

                            <div className="history-footer">
                                <span className="history-provider">{tx.provider}</span>
                                <span className="history-time">
                                    <Clock size={12} />
                                    {new Date(tx.timestamp).toLocaleString()}
                                </span>
                                <a
                                    href={tx.explorerUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="history-explorer"
                                >
                                    {truncateAddress(tx.txHash)}
                                    <ExternalLink size={12} />
                                </a>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
