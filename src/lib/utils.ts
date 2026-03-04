import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge class names with tailwind-merge */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/** Truncate address: 0x1234...5678 */
export function truncateAddress(address: string, chars: number = 4): string {
    if (!address) return "";
    return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/** Format number with commas and decimals */
export function formatNumber(
    value: number | string,
    decimals: number = 2
): string {
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num)) return "0.00";
    return num.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}

/** Format USD amount */
export function formatUSD(value: number): string {
    return `$${formatNumber(value)}`;
}

/** Format token amount (handles large decimals) */
export function formatTokenAmount(
    value: bigint,
    decimals: number = 6
): string {
    const divisor = BigInt(10 ** decimals);
    const whole = value / divisor;
    const fraction = value % divisor;
    const fractionStr = fraction.toString().padStart(decimals, "0").slice(0, 2);
    return `${whole.toLocaleString()}.${fractionStr}`;
}

/** Parse token amount to bigint */
export function parseTokenAmount(
    value: string,
    decimals: number = 6
): bigint {
    const parts = value.split(".");
    const whole = BigInt(parts[0] || "0") * BigInt(10 ** decimals);
    if (parts[1]) {
        const fractionStr = parts[1].padEnd(decimals, "0").slice(0, decimals);
        return whole + BigInt(fractionStr);
    }
    return whole;
}

/** Delay utility */
export function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Calculate basis points */
export function bpsToPercent(bps: number): number {
    return bps / 100;
}

/** Calculate fee from basis points */
export function calculateFee(amount: number, bps: number): number {
    return (amount * bps) / 10000;
}

/** Get explorer URL for transaction */
export function getExplorerTxUrl(explorerUrl: string, txHash: string): string {
    return `${explorerUrl}/tx/${txHash}`;
}

/** Get explorer URL for address */
export function getExplorerAddressUrl(
    explorerUrl: string,
    address: string
): string {
    return `${explorerUrl}/address/${address}`;
}

/** Generate unique id */
export function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
