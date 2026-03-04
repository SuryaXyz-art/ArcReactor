# ARC Liquidity Router

> Cross-chain liquidity aggregator for stablecoins (USDC/EURC) on Arc Testnet.
> Scans Thirdweb, LayerZero, and Axelar to find the cheapest bridge route.

![Next.js 14](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636)

## Quick Start

```bash
# Install dependencies
cd alr-app
npm install

# Copy env and add your Thirdweb client ID
cp .env.example .env.local
# Edit .env.local with your NEXT_PUBLIC_THIRDWEB_CLIENT_ID

# Run development server
npm run dev
# Open http://localhost:3000
```

## Get Testnet Tokens

1. **Add Arc Testnet to MetaMask**:
   - Network: `Arc Testnet`
   - RPC: `https://rpc.testnet.arc.network`
   - Chain ID: `5042002`
   - Symbol: `USDC`
   - Explorer: `https://testnet.arcscan.app`

2. **Get test USDC**: [faucet.circle.com](https://faucet.circle.com)
3. **Get Thirdweb API Key**: [thirdweb.com/dashboard](https://thirdweb.com/dashboard)

## Architecture

```
alr-app/
├── contracts/                # Solidity smart contracts
│   ├── LiquidityRouter.sol   # Main aggregator (approveAndBridge, executeBatch)
│   ├── BridgeAdapter.sol     # Abstract interface + 3 provider adapters
│   ├── PriceOracle.sol       # USDC/EURC price feed
│   └── GasOptimizer.sol      # Multicall & batch execution
├── scripts/
│   └── deploy.ts             # Hardhat deployment script
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── api/              # API routes (quotes, status, fx-rates)
│   │   ├── history/          # Transaction history page
│   │   ├── globals.css       # Premium dark theme CSS
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Home page (bridge UI)
│   ├── components/           # React components
│   │   ├── Header.tsx        # Navigation + wallet connect
│   │   ├── BridgeForm.tsx    # Source/dest chain, token, amount
│   │   ├── RouteComparison.tsx # Ranked route cards + execution
│   │   ├── TransactionHistory.tsx
│   │   └── GasEstimator.tsx
│   ├── lib/                  # Core utilities
│   │   ├── constants.ts      # Chains, tokens, providers
│   │   ├── thirdweb.ts       # Thirdweb client setup
│   │   └── utils.ts          # Formatting helpers
│   ├── services/             # Route detection engine
│   │   ├── routeEngine.ts    # Fetch, rank, optimize routes
│   │   ├── fxRates.ts        # USDC/EURC exchange rates
│   │   └── providers/        # Bridge provider adapters
│   └── store/
│       └── bridgeStore.ts    # Zustand state management
└── hardhat.config.ts         # Arc Testnet deployment config
```

## Key Features

| Feature | Description |
|---------|-------------|
| **Multi-Provider Routing** | Scans Thirdweb, LayerZero, Axelar in parallel |
| **Route Ranking** | Ranks by net output (amount - fees - gas - slippage) |
| **USDC Gas Model** | Arc uses USDC for gas — stable, predictable costs |
| **Slippage Protection** | Configurable tolerance (0.1% - 5%) |
| **FX Optimization** | Real-time USDC/EURC rates from multiple sources |
| **Batch Execution** | Multicall support for gas-efficient batching |
| **Transaction History** | Track all bridge transactions with explorer links |

## Smart Contract Deployment

```bash
# Install Hardhat (if not already)
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Add your deployer key to .env.local
# DEPLOYER_PRIVATE_KEY=0x...

# Deploy to Arc Testnet
npx hardhat run scripts/deploy.ts --network arcTestnet

# Verify on ArcScan
# Visit https://testnet.arcscan.app
```

## Token Addresses (Arc Testnet)

| Token | Address | Decimals |
|-------|---------|----------|
| USDC (ERC-20) | `0x3600000000000000000000000000000000000000` | 6 |
| EURC | `0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a` | 6 |

> ⚠️ **Note**: Arc Testnet uses USDC as native gas token (18 decimals). The ERC-20 interface above uses 6 decimals.

## Resources

- [Arc Network Docs](https://docs.arc.network/arc/concepts/welcome-to-arc)
- [Circle Faucet](https://faucet.circle.com)
- [ArcScan Explorer](https://testnet.arcscan.app)
- [Thirdweb SDK Docs](https://portal.thirdweb.com)
- [Arc Litepaper](https://www.arc.network/litepaper)
