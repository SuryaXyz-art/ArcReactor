import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ARC Liquidity Router | Cross-Chain Bridge Aggregator",
  description:
    "Find the cheapest and fastest route to bridge USDC & EURC across chains. Powered by Arc Testnet with Thirdweb, LayerZero, and Axelar.",
  keywords: [
    "Arc Testnet",
    "cross-chain bridge",
    "liquidity aggregator",
    "USDC",
    "EURC",
    "DeFi",
    "stablecoin bridge",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <div id="app-root">{children}</div>
      </body>
    </html>
  );
}
