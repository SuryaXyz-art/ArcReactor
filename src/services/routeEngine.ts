// ============================================
// Route Detection Engine
// ============================================
import type { RouteQuote } from "@/store/bridgeStore";
import { getThirdwebQuote } from "./providers/thirdweb";
import { getLayerZeroQuote } from "./providers/layerzero";
import { getAxelarQuote } from "./providers/axelar";
import { BRIDGE_PROVIDERS } from "@/lib/constants";

interface RouteParams {
    sourceChain: number;
    destChain: number;
    token: string;
    amount: number;
}

/**
 * Fetch quotes from all supported bridge providers in parallel.
 */
export async function fetchAllRoutes(params: RouteParams): Promise<RouteQuote[]> {
    if (params.amount <= 0) {
        throw new Error("Amount must be greater than 0");
    }

    const quotePromises: Promise<RouteQuote | null>[] = [];

    // Check which providers support both source and dest chains
    const providers = [
        { check: BRIDGE_PROVIDERS.thirdweb, fetch: getThirdwebQuote },
        { check: BRIDGE_PROVIDERS.layerzero, fetch: getLayerZeroQuote },
        { check: BRIDGE_PROVIDERS.axelar, fetch: getAxelarQuote },
    ];

    for (const { check, fetch } of providers) {
        if (
            check.supportedChains.includes(params.sourceChain) &&
            check.supportedChains.includes(params.destChain)
        ) {
            quotePromises.push(
                fetch(params).catch((err) => {
                    console.warn(`Failed to fetch ${check.name} quote:`, err);
                    return null;
                })
            );
        }
    }

    const results = await Promise.all(quotePromises);
    return results.filter((r): r is RouteQuote => r !== null);
}

/**
 * Rank routes by net output (best = highest net output to user).
 * Mark the best route as recommended.
 */
export function rankRoutes(routes: RouteQuote[]): RouteQuote[] {
    if (routes.length === 0) return [];

    // Sort by netOutput descending
    const sorted = [...routes].sort((a, b) => b.netOutput - a.netOutput);

    // Mark the best route
    return sorted.map((route, index) => ({
        ...route,
        isRecommended: index === 0,
    }));
}

/**
 * Full pipeline: fetch all quotes → rank → return sorted routes.
 */
export async function getOptimalRoutes(params: RouteParams): Promise<RouteQuote[]> {
    const quotes = await fetchAllRoutes(params);
    return rankRoutes(quotes);
}

/**
 * Calculate a cost breakdown summary.
 */
export function getRouteCostBreakdown(route: RouteQuote) {
    const totalCost = route.bridgeFee + route.gasCostUSD + route.slippage + route.fxSpread;
    const costPercent = (totalCost / route.amountIn) * 100;

    return {
        bridgeFee: route.bridgeFee,
        gasCost: route.gasCostUSD,
        slippage: route.slippage,
        fxSpread: route.fxSpread,
        totalCost,
        costPercent,
        netOutput: route.netOutput,
        savings: route.isRecommended
            ? 0
            : 0, // would calculate vs worst route
    };
}
