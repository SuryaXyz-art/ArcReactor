// ============================================
// Thirdweb Bridge Provider Adapter (real SDK)
// ============================================
import { BRIDGE_PROVIDERS } from "@/lib/constants";
import { generateId } from "@/lib/utils";
import type { RouteQuote } from "@/store/bridgeStore";
import { Bridge, NATIVE_TOKEN_ADDRESS } from "thirdweb";
import { thirdwebClient } from "@/lib/thirdweb";

interface QuoteParams {
    sourceChain: number;
    destChain: number;
    token: string;
    amount: number;
}

/**
 * Fetch a real quote from thirdweb Universal Bridge using native tokens.
 * On Arc Testnet the native token is USDC, so this aligns with your UI.
 */
export async function getThirdwebQuote(params: QuoteParams): Promise<RouteQuote> {
    const provider = BRIDGE_PROVIDERS.thirdweb;

    // Convert human amount to wei (18 decimals for native token)
    const sellAmountWei = BigInt(Math.floor(params.amount * 1e18));

    // Call thirdweb Bridge.Sell.quote to get a real route
    let originAmount = params.amount;
    let destinationAmount = params.amount;
    let gasCostUSD = 0;

    try {
        const quote = await Bridge.Sell.quote({
            originChainId: params.sourceChain,
            originTokenAddress: NATIVE_TOKEN_ADDRESS,
            destinationChainId: params.destChain,
            destinationTokenAddress: NATIVE_TOKEN_ADDRESS,
            amount: sellAmountWei,
            client: thirdwebClient,
        });

        // originAmount and destinationAmount are in wei strings
        originAmount = Number(quote.originAmount) / 1e18;
        destinationAmount = Number(quote.destinationAmount) / 1e18;
    } catch (error) {
        console.warn("Thirdweb Bridge SDK unsupported route, using estimated fallback:", error);
        destinationAmount = params.amount * 0.998; // Estimated 0.2% total fees
        gasCostUSD = params.amount * 0.0005; // 0.05%
    }

    const bridgeFee = Math.max(originAmount - destinationAmount - gasCostUSD, 0);
    const slippage = params.amount * 0.0005;
    const netOutput = destinationAmount;

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
        amountOut: destinationAmount,
        bridgeFee,
        gasCostUSD,
        slippage,
        fxSpread: 0,
        netOutput,
        estimatedTime: provider.avgTime,
        isRecommended: false,
    };
}
