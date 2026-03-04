import { NextRequest, NextResponse } from "next/server";
import { Bridge } from "thirdweb";
import { thirdwebClient } from "@/lib/thirdweb";

// Bridge status API route (real thirdweb status where possible)
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const txHash = searchParams.get("txHash");
    const chainIdParam = searchParams.get("chainId");

    if (!txHash) {
        return NextResponse.json(
            { error: "Missing txHash parameter" },
            { status: 400 }
        );
    }

    const chainId = chainIdParam ? Number(chainIdParam) : 5042002; // default to Arc Testnet

    try {
        const status = await Bridge.status({
            transactionHash: txHash,
            chainId,
            client: thirdwebClient,
        });

        return NextResponse.json(status);
    } catch (error) {
        // Fallback to a simple pending/completed response if status lookup fails
        return NextResponse.json({
            txHash,
            status: "pending",
            timestamp: Date.now(),
            confirmations: 0,
            error: (error as Error).message,
        });
    }
}
