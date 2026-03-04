// ============================================
// LayerZero Bridge Provider Adapter
// ============================================
import { BRIDGE_PROVIDERS } from "@/lib/constants";
import { generateId } from "@/lib/utils";
import type { RouteQuote } from "@/store/bridgeStore";

interface QuoteParams {
    sourceChain: number;
    destChain: number;
    token: string;
    amount: number;
}

/**
 * Fetch a quote from LayerZero.
 * Simulates realistic LayerZero quote data for testnet.
 */
export async function getLayerZeroQuote(params: QuoteParams): Promise<RouteQuote> {
    const provider = BRIDGE_PROVIDERS.layerzero;

    // Simulate API latency
    await new Promise((r) => setTimeout(r, 1000 + Math.random() * 600));

    // LayerZero has slightly higher fees but competitive for smaller amounts
    const bridgeFee = params.amount * 0.002 + 0.3; // 0.2% + $0.30 base
    const gasCostUSD = 1.2 + Math.random() * 0.8; // $1.20-$2.00
    const slippage = params.amount * 0.001; // 0.1%

    const netOutput = params.amount - bridgeFee - gasCostUSD - slippage;

    return {
        id: generateId(),
        provider: provider.id,
        providerName: provider.name,
        providerIcon: provider.icon,
        providerColor: provider.color,
        sourceChain: params.sourceChain,
        destChain: params.destChain,
        token: params.token,
        amountIn: params.amount,
        amountOut: netOutput + gasCostUSD,
        bridgeFee,
        gasCostUSD,
        slippage,
        fxSpread: 0,
        netOutput,
        estimatedTime: provider.avgTime,
        isRecommended: false,
    };
}
