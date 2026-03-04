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

    // Axelar: moderate fees, supports most chains
    const bridgeFee = params.amount * 0.0015 + 1.0; // 0.15% + $1.00 base
    const gasCostUSD = 1.5 + Math.random() * 1.0; // $1.50-$2.50
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
