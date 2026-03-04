"use client";

import Header from "@/components/Header";
import TransactionHistory from "@/components/TransactionHistory";

export default function HistoryPage() {
    return (
        <div className="app-container">
            <Header />
            <main className="main-content" style={{ paddingTop: "2rem" }}>
                <TransactionHistory />
            </main>
        </div>
    );
}
