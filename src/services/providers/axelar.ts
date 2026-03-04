// ============================================
// Axelar Bridge Provider Adapter
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
 * Fetch a quote from Axelar GMP.
 * Simulates realistic Axelar quote data for testnet.
 */
export async function getAxelarQuote(params: QuoteParams): Promise<RouteQuote> {
    const provider = BRIDGE_PROVIDERS.axelar;

    // Simulate API latency
    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));

    // Axelar: simulated proportional fees for demo
    const bridgeFee = params.amount * 0.0015; // 0.15%
    const gasCostUSD = params.amount * 0.0020; // 0.20%
    const slippage = params.amount * 0.0008; // 0.08%

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
