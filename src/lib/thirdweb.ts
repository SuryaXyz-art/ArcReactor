import { createThirdwebClient } from "thirdweb";

// Create a singleton Thirdweb client
export const thirdwebClient = createThirdwebClient({
    clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "demo-client-id",
});

// Arc Testnet chain definition for Thirdweb
export const arcTestnetChain = {
    id: 5042002,
    name: "Arc Testnet",
    rpc: "https://rpc.testnet.arc.network",
    nativeCurrency: {
        name: "USDC",
        symbol: "USDC",
        decimals: 18,
    },
    blockExplorers: [
        {
            name: "ArcScan",
            url: "https://testnet.arcscan.app",
        },
    ],
    testnet: true,
};
