// ============================================
// FX Rate Service - USDC/EURC Exchange Rates
// ============================================

interface FxRateSource {
    source: string;
    rate: number; // EURC per USDC
    inverseRate: number; // USDC per EURC
    timestamp: number;
}

// Simulated real-time FX rates from multiple sources
// In production, these would call real APIs
export async function getCircleRate(): Promise<FxRateSource> {
    // Simulate Circle native swap rate
    const baseRate = 0.92; // 1 USDC ≈ 0.92 EURC
    const jitter = (Math.random() - 0.5) * 0.005;
    const rate = baseRate + jitter;
    return {
        source: "Circle Native",
        rate,
        inverseRate: 1 / rate,
        timestamp: Date.now(),
    };
}

export async function getUniswapRate(): Promise<FxRateSource> {
    // Simulate Uniswap DEX rate
    const baseRate = 0.919;
    const jitter = (Math.random() - 0.5) * 0.008;
    const rate = baseRate + jitter;
    return {
        source: "Uniswap",
        rate,
        inverseRate: 1 / rate,
        timestamp: Date.now(),
    };
}

export async function getCurveRate(): Promise<FxRateSource> {
    // Simulate Curve Finance rate (typically tightest spread for stablecoins)
    const baseRate = 0.9205;
    const jitter = (Math.random() - 0.5) * 0.003;
    const rate = baseRate + jitter;
    return {
        source: "Curve",
        rate,
        inverseRate: 1 / rate,
        timestamp: Date.now(),
    };
}

export async function getBestFxRate(): Promise<FxRateSource> {
    const [circle, uniswap, curve] = await Promise.all([
        getCircleRate(),
        getUniswapRate(),
        getCurveRate(),
    ]);

    const sources = [circle, uniswap, curve];
    // Best rate = highest EURC per USDC (most EURC for your USDC)
    return sources.reduce((best, current) =>
        current.rate > best.rate ? current : best
    );
}

export async function getAllFxRates(): Promise<FxRateSource[]> {
    const [circle, uniswap, curve] = await Promise.all([
        getCircleRate(),
        getUniswapRate(),
        getCurveRate(),
    ]);
    return [circle, uniswap, curve];
}

export function calculateFxCost(
    amountUSDC: number,
    targetToken: string,
    fxRate: number
): { convertedAmount: number; fxSpread: number } {
    if (targetToken === "USDC") {
        return { convertedAmount: amountUSDC, fxSpread: 0 };
    }
    // For EURC conversion
    const midMarketRate = 0.92; // baseline EUR/USD
    const convertedAmount = amountUSDC * fxRate;
    const midMarketAmount = amountUSDC * midMarketRate;
    const fxSpread = Math.abs(convertedAmount - midMarketAmount);
    return { convertedAmount, fxSpread };
}
