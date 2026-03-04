import { NextResponse } from "next/server";

// FX Rates API route - USDC/EURC exchange rates
export async function GET() {
    // Simulated rates from multiple sources
    const baseRate = 0.92;

    const rates = [
        {
            source: "Circle Native",
            rate: baseRate + (Math.random() - 0.5) * 0.005,
            timestamp: Date.now(),
        },
        {
            source: "Uniswap",
            rate: baseRate - 0.001 + (Math.random() - 0.5) * 0.008,
            timestamp: Date.now(),
        },
        {
            source: "Curve",
            rate: baseRate + 0.0005 + (Math.random() - 0.5) * 0.003,
            timestamp: Date.now(),
        },
    ];

    const bestRate = rates.reduce((best, current) =>
        current.rate > best.rate ? current : best
    );

    return NextResponse.json({
        pair: "USDC/EURC",
        rates,
        bestRate,
        timestamp: Date.now(),
    });
}
