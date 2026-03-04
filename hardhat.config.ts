import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
    solidity: {
        version: "0.8.20",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
            viaIR: true,
        },
    },
    networks: {
        arcTestnet: {
            url: process.env.NEXT_PUBLIC_ARC_TESTNET_RPC || "https://rpc.testnet.arc.network",
            chainId: 5042002,
            accounts: process.env.DEPLOYER_PRIVATE_KEY
                ? [process.env.DEPLOYER_PRIVATE_KEY]
                : [],
        },
        sepolia: {
            url: "https://rpc.sepolia.org",
            chainId: 11155111,
            accounts: process.env.DEPLOYER_PRIVATE_KEY
                ? [process.env.DEPLOYER_PRIVATE_KEY]
                : [],
        },
    },
    paths: {
        sources: "./contracts",
        artifacts: "./artifacts",
    },
};

export default config;
