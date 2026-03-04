"use client";

import Header from "@/components/Header";
import BridgeForm from "@/components/BridgeForm";
import RouteComparison from "@/components/RouteComparison";
import GasEstimator from "@/components/GasEstimator";
import {
  Zap,
  Shield,
  BarChart3,
  Globe,
  ArrowRight,
} from "lucide-react";

export default function Home() {
  return (
    <div className="app-container">
      <Header />

      <main className="main-content">
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-glow" />
          <div className="hero-content">
            <div className="hero-badge">
              <Zap size={14} />
              Powered by Arc Testnet
            </div>
            <h1 className="hero-title">
              Cross-Chain
              <br />
              <span className="gradient-text">Liquidity Router</span>
            </h1>
            <p className="hero-subtitle">
              Find the cheapest and fastest bridge route for your stablecoins.
              Compare 3 providers. Execute in one click.
            </p>
          </div>
        </section>

        {/* Bridge Section */}
        <section className="bridge-section">
          <div className="bridge-layout">
            <div className="bridge-main">
              <BridgeForm />
              <GasEstimator />
            </div>
            <div className="bridge-results">
              <RouteComparison />
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="features">
          <h2 className="features-title">Why ARC Router?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon" style={{ background: "rgba(99,102,241,0.15)" }}>
                <BarChart3 size={24} color="#6366f1" />
              </div>
              <h3>Multi-Provider Routing</h3>
              <p>
                Scan Thirdweb, LayerZero, and Axelar simultaneously. Always get
                the best rate.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon" style={{ background: "rgba(34,211,238,0.15)" }}>
                <Shield size={24} color="#22d3ee" />
              </div>
              <h3>Slippage Protection</h3>
              <p>
                Smart slippage tolerance with transaction simulation. Your
                stablecoins are safe.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon" style={{ background: "rgba(168,85,247,0.15)" }}>
                <Zap size={24} color="#a855f7" />
              </div>
              <h3>USDC Gas Model</h3>
              <p>
                Arc uses USDC for gas — predictable, dollar-denominated
                transaction costs.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon" style={{ background: "rgba(249,115,22,0.15)" }}>
                <Globe size={24} color="#f97316" />
              </div>
              <h3>Cross-Chain FX</h3>
              <p>
                Real-time USDC/EURC rates from multiple sources. Optimal foreign
                exchange built in.
              </p>
            </div>
          </div>
        </section>

        {/* Supported Chains */}
        <section className="chains-section">
          <h2 className="chains-title">Supported Networks</h2>
          <div className="chains-list">
            {[
              { name: "Arc Testnet", color: "#6366f1", tag: "Primary" },
              { name: "Sepolia", color: "#627eea", tag: "Ethereum" },
              { name: "Base Sepolia", color: "#0052ff", tag: "L2" },
              { name: "Optimism Goerli", color: "#ff0420", tag: "L2" },
            ].map((chain) => (
              <div key={chain.name} className="chain-card">
                <span
                  className="chain-dot-lg"
                  style={{ backgroundColor: chain.color }}
                />
                <span className="chain-name">{chain.name}</span>
                <span className="chain-tag">{chain.tag}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <span>ARC Liquidity Router — Testnet Demo</span>
          <div className="footer-links">
            <a
              href="https://docs.arc.network/arc/concepts/welcome-to-arc"
              target="_blank"
              rel="noopener noreferrer"
            >
              Arc Docs <ArrowRight size={12} />
            </a>
            <a
              href="https://faucet.circle.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get Testnet USDC <ArrowRight size={12} />
            </a>
            <a
              href="https://testnet.arcscan.app"
              target="_blank"
              rel="noopener noreferrer"
            >
              ArcScan <ArrowRight size={12} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
