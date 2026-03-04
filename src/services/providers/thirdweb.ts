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
    const quote = await Bridge.Sell.quote({
        originChainId: params.sourceChain,
        originTokenAddress: NATIVE_TOKEN_ADDRESS,
        destinationChainId: params.destChain,
        destinationTokenAddress: NATIVE_TOKEN_ADDRESS,
        amount: sellAmountWei,
        client: thirdwebClient,
    });

    // originAmount and destinationAmount are in wei strings
    const originAmount = Number(quote.originAmount) / 1e18;
    const destinationAmount = Number(quote.destinationAmount) / 1e18;

    const bridgeFee = Math.max(originAmount - destinationAmount, 0);
    const gasCostUSD = 0; // thirdweb quote is in token terms; you can extend this later
    const slippage = Math.max(params.amount - destinationAmount, 0);
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
