import { NextRequest, NextResponse } from "next/server";
import { Bridge, toWei, NATIVE_TOKEN_ADDRESS } from "thirdweb";
import { thirdwebClient } from "@/lib/thirdweb";

// Bridge quote API route using thirdweb Universal Bridge (native token)
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const sourceChain = searchParams.get("sourceChain");
    const destChain = searchParams.get("destChain");
    const token = searchParams.get("token");
    const amount = searchParams.get("amount");

    if (!sourceChain || !destChain || !token || !amount) {
        return NextResponse.json(
            { error: "Missing required parameters: sourceChain, destChain, token, amount" },
            { status: 400 }
        );
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
        return NextResponse.json(
            { error: "Invalid amount" },
            { status: 400 }
        );
    }

    try {
        const originChainId = parseInt(sourceChain, 10);
        const destinationChainId = parseInt(destChain, 10);

        const sellAmountWei = toWei(numAmount.toString());

        const quote = await Bridge.Sell.quote({
            originChainId,
            originTokenAddress: NATIVE_TOKEN_ADDRESS,
            destinationChainId,
            destinationTokenAddress: NATIVE_TOKEN_ADDRESS,
            sellAmountWei,
            client: thirdwebClient,
        });

        const originAmount = Number(quote.originAmount) / 1e18;
        const destinationAmount = Number(quote.destinationAmount) / 1e18;

        const bridgeFee = Math.max(originAmount - destinationAmount, 0);
        const gasCostUSD = 0;
        const slippage = Math.max(numAmount - destinationAmount, 0);
        const netOutput = destinationAmount;

        const quotes = [
            {
                provider: "thirdweb",
                providerName: "Thirdweb Bridge",
                bridgeFee,
                gasCostUSD,
                slippage,
                estimatedTime: "2-5 min",
                amountIn: numAmount,
                netOutput,
                sourceChain: originChainId,
                destChain: destinationChainId,
                token,
                isRecommended: true,
            },
        ];

        return NextResponse.json({ quotes, timestamp: Date.now() });
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 500 }
        );
    }
}
